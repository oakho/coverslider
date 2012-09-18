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
    this.$nested   = this.$element.find('[data-coverslider]').coverSlider({
                        duration: this.options.duration,
                        easing: this.options.easing
                      }, true);
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

      this.$element.on('click', '[data-coverslider-goto]', function(event) {
        if ($(this).data('coverslider-goto') === 'prev') { self.prev(); }
        if ($(this).data('coverslider-goto') === 'next') { self.next(); }

        event.preventDefault();
        // Avoid bubbling issue that resizes parent slider when sliders are nested
        event.stopPropagation();
      });

      // Listen to goto event to slide to given destination
      this.$element.on('goto.coverSlider', $.proxy(this.goTo, this));

      // Listen to statechange event on the main slider then trigger goto event
      // to bring the user back and forth in the browser history
      if (window.location.protocol !== "file:" &&  !this.nested) {
        window.History.Adapter.bind(window, 'statechange', function(e) {
          var state = window.History.getState();
          $(state.data.element).trigger('goto.coverSlider', [state.data.destination]);
        });
      }
    },

    goTo: function(event, destination) {
      var self = this, to, toIndex, position, properties, data;

      if(typeof destination === "string") { destination = $(destination); }

      // Do nothing if the section doesn't exist
      if (destination === undefined) { return; }

      toIndex = this.$covers.index(destination);
      position = this.getPosition(toIndex);

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
          self.$active = destination.addClass('active');

          if (window.location.protocol !== "file:" && !self.nested) {
            data = { element: '#' + self.$element.attr('id'), destination: destination.attr('id') };
            window.History.pushState(data, null, destination.attr('id'));
          }
        },
        easing: this.options.easing
      });

      // Avoid bubbling issue when sliders are nested
      event.stopPropagation();
    },

    prev: function() {
      this.$element.trigger('goto.coverSlider', [this.$active.prev()]);
    },

    next: function() {
      this.$element.trigger('goto.coverSlider', [this.$active.next()]);
    },

    resetNested: function() {
      this.$nested.each(function(i, el) {
        // $(this).trigger('goto', '#'+ $(this).find('section').first().attr('id'));
      });
    },

    setContainersSize: function(event) {
      var self = this, windowWidth, windowHeight, direction, position;

      windowWidth  = $(window).width();
      windowHeight = $(window).height();
      direction    = this.getDirectionProperty();
      position     = this.getPosition(this.$active.index());

      this.$inner.css(direction, position);

      // Set window's height to the slider
      this.$element.height(windowHeight);

      if (this.isVertical()) { this.$inner.height(windowHeight * this.$covers.length); }
      if (this.isHorizontal()) { this.$inner.width(windowWidth * this.$covers.length); }

      // Set window's width and height to each covers
      this.$covers.each(function(i, el) {
        $(this).width(windowWidth).height(windowHeight);
      });

      // Avoid bubbling issue that resizes parent slider when sliders are nested
      event.stopPropagation();
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
          type   = { type: $this.attr('data-coverslider') },
          opts   = $.extend({}, $.fn.coverSlider.defaults, options, type),
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