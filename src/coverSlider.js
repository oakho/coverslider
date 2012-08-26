/*
 * coverSlider
 * https://github.com/oakho/coverSlider
 *
 * Copyright (c) 2012 Antoine Lagadec
 * Licensed under the MIT, GPL licenses.
 */

(function($, window, undefined) {

  "use strict";

  var console = window.console || undefined; // Avoid jslint yellin'
  /**
   * CoverSlider's constructor
   * @param {String} element Current slider element
   * @param {Object} options An object of options provided to override defaults
   * @return {void}
   */
  $.coverSlider = function(element, options, nested) {
    var verticals, horizontals;

    // Public attributes
    this.version   = '0.1.0';
    this.element   = element;
    this.options   = options;
    this.nested    = nested;

    // DOM elements references
    this.$element  = $(element);
    this.$inner    = this.$element.children('.coverSlider-inner');
    this.$covers   = this.$inner.children('section');
    this.$active   = this.$covers.first().addClass('active');
    this.$nested   = $();

    // Initialize all cover sliders nested inside the current element's section
    // should be rewritten to be able to set type attribute from a data attribute
    // on the element
    verticals = this.$element.find('.coverSlider-vertical').coverSlider({
      duration: this.options.duration,
      easing: this.options.easing
    }, true);
    horizontals = this.$element.find('.coverSlider-horizontal').coverSlider({
      type: 'horizontal',
      duration: this.options.duration,
      easing: this.options.easing
    }, true);

    // Keep a reference of all initialized nested sliders
    if (horizontals.length) { this.$nested.push(horizontals); }
    if (verticals.length) { this.$nested.push(verticals); }
  };

  $.coverSlider.prototype = {

    initialize: function() {
      // Initialize slider's events
      this.addEvents();

      // Initialize slider's sections width and height
      $(window).trigger('resize');
    },

    addEvents: function() {
      var self = this;
      // Listen to resize event to set window's width and height
      // on slider's sections on window resize
      $(window).on('resize', $.proxy(this.setContainersSize, this));

      this.$element.on('click', '[data-goto]', function(event) {
        event.preventDefault();
        // Avoid bubbling issue that resizes parent slider when sliders are nested
        event.stopPropagation();

        if ($(this).data('goto') === 'prev') { self.prev(); }
        if ($(this).data('goto') === 'next') { self.next(); }
      });

      // Listen to goto event to slide to given destination
      this.$element.on('goto.coverSlider', $.proxy(this.goTo, this));

      // Listen to statechange event on the main slider then trigger goto event
      // to bring the user back and forth in the browser history
      if (!this.nested) {
        window.History.Adapter.bind(window, 'statechange', function(e) {
          var state = window.History.getState();
          $(state.data.element).trigger('goto.coverSlider', [state.data.destination]);
        });
      }
    },

    goTo: function(event, destination) {
      // Avoid bubbling issue when sliders are nested
      event.stopPropagation();
      var self = this,
        to, toIndex, position, properties, historyData;

      to = $(destination);
      toIndex = this.$covers.index(to);
      position = this.getPosition(toIndex);

      // Do nothing if the section doesn't exist
      if (!to.length) { return; }

      // Reset nested sliders position
      if (!this.nested && this.options.resetNested) { this.resetNested(); }

      // Initialize an object with properties to animate
      properties = {};
      properties[this.getDirectionProperty()] = position;

      self.$inner.animate(
      properties, {
        duration: this.options.duration,
        step: function(now, fx) {
          self.$element.trigger('step.coverSlider', [now, fx, position]);
        },
        complete: function() {
          self.$element.trigger('complete.coverSlider');
          self.$inner.children('.active').removeClass('active');
          self.$active = to.addClass('active');

          if (!self.nested) {
            historyData = {
              element: '#' + self.$element.attr('id'),
              destination: destination
            };
            window.History.pushState(historyData, null, destination.replace(/\#/g, ''))
          }
        },
        easing: this.options.easing
      });
    },

    prev: function() {
      var prev = this.$active.prev().attr('id');
      if (prev !== undefined) {
        this.$element.trigger('goto.coverSlider', ['#' + prev]);
      }
    },

    next: function() {
      var next = this.$active.next().attr('id');
      if (next !== undefined) {
        this.$element.trigger('goto.coverSlider', ['#' + next]);
      }
    },

    resetNested: function() {
      this.$nested.each(function(i, el) {
        // $(this).trigger('goto', '#'+ $(this).find('section').first().attr('id'));
      });
    },

    setContainersSize: function(event) {
      var self = this,
        windowWidth, windowHeight, direction, position;

      // Avoid bubbling issue that resizes parent slider when sliders are nested
      event.stopPropagation();

      windowWidth = $(window).width();
      windowHeight = $(window).height();
      direction = this.getDirectionProperty();
      position = this.getPosition(this.$active.index());

      this.$inner.css(direction, position);

      // Set window's height to the slider
      this.$element.height(windowHeight);

      if (this.isVertical()) { this.$inner.height(windowHeight * this.$covers.length); }
      if (this.isHorizontal()) { this.$inner.width(windowWidth * this.$covers.length); }

      // Set window's width and height to each covers
      this.$covers.each(function(i, el) {
        $(this).width(windowWidth).height(windowHeight);
      });
    },

    /**
     * Tells if the slider is vertical
     * @return {Boolean}
     */
    isVertical: function() {
      return (this.options.type === 'vertical');
    },

    /**
     * Tells if the slider is horizontal
     * @return {Boolean}
     */
    isHorizontal: function() {
      return (this.options.type === 'horizontal');
    },

    /**
     * Gets slide direction following current slider's type
     * @return {String}
     */
    getDirectionProperty: function() {
      return this.isVertical() ? 'top' : 'left';
    },

    /**
     * Gets position of the section
     * @param  {Number} index Section's index
     * @return {Number}       Section's scroll position
     */
    getPosition: function(index) {
      return this.isVertical() ? (-($(window).height() * index)) : (-($(window).width() * index));
    }
  };

  $.fn.coverSlider = function(options, nested) {
    return this.each(function() {
      var $this  = $(this),
          data   = $this.data('coverSlider'),
          opts   = $.extend({}, $.fn.coverSlider.defaults, options),
          nested = nested || false;

      if (!data) {
        $this.data('coverSlider', (data = new $.coverSlider(this, opts, nested)));
        data.initialize(); // Let the magic happens :)
      }
    });
  };

  $.fn.coverSlider.defaults = {
    type: 'vertical',
    duration: 2000,
    easing: 'linear',
    resetNested: false
  };

}(jQuery, window, undefined));