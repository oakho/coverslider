/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($) {

  /*
    ======== A Handy Little QUnit Reference ========
    http://docs.jquery.com/QUnit

    Test methods:
      expect(numAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      raises(block, [expected], [message])
  */

  module('jQuery#coverSlider Common', {
    setup: function() {
      this.$vertical         = $('#vertical');
      this.$verticalCovers   = this.$vertical.find('.coverSlider-inner').children('section');
      this.$horizontal       = $('#horizontal');
      this.$horizontalCovers = this.$horizontal.find('.coverSlider-inner').children('section');

      this.$vertical.coverSlider({duration: 0});
    }
  });

  test('is chainable', 1, function() {
    strictEqual(this.$vertical.coverSlider(), this.$vertical, 'should be chaninable');
  });

  test('provide overridable options', 1, function() {
    strictEqual(this.$vertical.data('coverSlider').options.duration, 0, 'should provide overridable options');
  });

  test('covers has window size', 2, function() {
    strictEqual(this.$verticalCovers.first().width(), $(window).width(), 'should have window width');
    strictEqual(this.$verticalCovers.first().height(), $(window).height(), 'should have window height');
  });

  module('jQuery#coverSlider Vertical Sliders', {
    setup: function() {
      this.$vertical         = $('#vertical');
      this.$verticalCovers   = this.$vertical.find('.coverSlider-inner').children('section');
      this.$horizontal       = $('#horizontal');
      this.$horizontalCovers = this.$horizontal.find('.coverSlider-inner').children('section');

      this.$vertical.coverSlider({duration: 0});
    }
  });

  test('have height equal to the sum of all its covers height', 1, function() {
    var sliderHeight = this.$vertical.children('.coverSlider-inner').height(),
        coversHeight = 0;

    this.$vertical.children('.coverSlider-inner').children('section').each(function(i, e) {
      coversHeight += $(this).height();
    });

    strictEqual(sliderHeight, coversHeight, 'should have height equal to the sum of all its covers height');
  });

  asyncTest('can go to another cover', 2, function() {
    this.$vertical.trigger('goto', ['#third']);

    var self     = this,
        duration = this.$vertical.data('coverSlider').options.duration + 100;

    setTimeout(function() {
      strictEqual(self.$vertical.children('.coverSlider-inner').css('top'), '-'+ ($(window).height() * 2) +'px', 'should have vertically scrolled to third section');
      ok($('#third').hasClass('active'), 'should have an active class');
      start();
    }, duration);
  });

  module('jQuery#coverSlider Horizontal Sliders', {
    setup: function() {
      this.$vertical         = $('#vertical');
      this.$verticalCovers   = this.$vertical.find('.coverSlider-inner').children('section');
      this.$horizontal       = $('#horizontal');
      this.$horizontalCovers = this.$horizontal.find('.coverSlider-inner').children('section');

      this.$vertical.coverSlider({duration: 0});
    }
  });

  test('have width equal to the sum of all its covers width', 1, function() {
    var sliderWidth = this.$horizontal.children('.coverSlider-inner').width(),
        coversWidth = 0;

    this.$horizontal.children('.coverSlider-inner').children('section').each(function(i, e) {
      coversWidth += $(this).width();
    });

    strictEqual(sliderWidth, coversWidth, 'should have width equal to the sum of all its covers width');
  });

  asyncTest('can go to another cover', 2, function() {
    this.$horizontal.trigger('goto', '#horizontal-third');

    var self     = this,
        duration = this.$horizontal.data('coverSlider').options.duration + 100;

    setTimeout(function() {
      strictEqual(self.$horizontal.children('.coverSlider-inner').css('left'), '-'+ $(window).width() * 2 +'px', 'should have horizontally scrolled to third section');
      ok($('#horizontal-third').hasClass('active'), 'should have an active class');
      start();
    }, duration);
  });

  asyncTest('can go to next section', 2, function() {
    this.$horizontal.find('.coverSlider-next').trigger('click');

    var self         = this,
        duration     = this.$horizontal.data('coverSlider').options.duration + 100,
        nextPosition = '-'+ $(window).width() * $('#horizontal-second').index() +'px';

    setTimeout(function() {
      ok($('#horizontal-second').is('.active'), 'should have gone to next section');
      strictEqual(self.$horizontal.children('.coverSlider-inner').css('left'), nextPosition, 'should have horizontally gone to next section');
      start();
    }, duration);
  });

  asyncTest('can go to prev section', 2, function() {
    this.$horizontal.find('.coverSlider-next').trigger('click').trigger('click');
    this.$horizontal.find('.coverSlider-prev').trigger('click');

    console.log($('#horizontal-third'));

    var self         = this,
        duration     = this.$horizontal.data('coverSlider').options.duration + 100,
        prevPosition = '-'+ $(window).width() * $('#horizontal-second').index() +'px';

    setTimeout(function() {
      ok($('#horizontal-second').is('.active'), 'should have gone to prev section');
      strictEqual(self.$horizontal.children('.coverSlider-inner').css('left'), prevPosition, 'should have horizontally gone to next section');
      start();
    }, duration * 2);
  });

}(jQuery));
