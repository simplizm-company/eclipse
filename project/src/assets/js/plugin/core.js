/*
 * Eclipse for jQuery
 * Version: 1.0.1
 * Author: shinyongjun
 * Website: http://www.simplizm.com/
 */

;(function($){
    'use strict';

    var Y$ = window.Y$ = {
        window: {}
    };

    $.event.special.clickstart = {
        setup: function() {
            var isTouchSupported = 'ontouchstart' in document;
            var clickstart = isTouchSupported ? 'touchstart' : 'mousedown';
            $(this).bind(clickstart + '.clickstart-event', function(event) {
                event.type = 'clickstart';
                if (isTouchSupported) {
                    event.posX = event.originalEvent.touches[0].pageX;
                    event.posY = event.originalEvent.touches[0].pageY;
                } else {
                    event.posX = event.pageX;
                    event.posY = event.pageY;
                }
                ($.event.dispatch||$.event.handle).call(this, event);
            });
        },
        teardown: function() {
            $(this).unbind('.clickstart-event');
        }
    };

    $.event.special.clickmove = {
        setup: function() {
            var isTouchSupported = 'ontouchmove' in document;
            var clickmove = isTouchSupported ? 'touchmove' : 'mousemove';
            $(this).bind(clickmove + '.clickmove-event', function(event) {
                event.type = 'clickmove';
                if (isTouchSupported) {
                    event.posX = event.originalEvent.touches[0].pageX;
                    event.posY = event.originalEvent.touches[0].pageY;
                } else {
                    event.posX = event.pageX;
                    event.posY = event.pageY;
                }
                ($.event.dispatch||$.event.handle).call(this, event);
            });
        },
        teardown: function() {
            $(this).unbind('.clickmove-event');
        }
    };

    $.event.special.clickend = {
        setup: function() {
            var isTouchSupported = 'ontouchend' in document;
            var clickend = isTouchSupported ? 'touchend' : 'mouseup';
            $(this).bind(clickend + '.clickend-event', function(event) {
                event.type = 'clickend';
                ($.event.dispatch||$.event.handle).call(this, event);
            });
        },
        teardown: function() {
            $(this).unbind('.clickend-event');
        }
    };

    Y$.getWindowScroll = function () {
        Y$.window.scrollTop = $(window).scrollTop();
        Y$.window.scrollLeft = $(window).scrollLeft();
    }

    Y$.getWindowSize = function () {
        Y$.window.width = $(window).outerWidth();
        Y$.window.height = $(window).outerHeight();
    }

    Y$.matchmedia = function (settings) {
        var defaults = {
            matchDesktop : function () {},
            matchMobile : function () {}
        };
        var opt = $.extend({}, defaults, settings);
        var media = window.matchMedia('(max-width: 750px)');

        function matchesAction (paramse) {
            if (!paramse.matches) {
                opt.matchDesktop();
            } else {
                opt.matchMobile();
            }
        }

        if (matchMedia) {
            matchesAction(media);
            media.addListener(function (parameter) {
                matchesAction(parameter);
            });
        }
    }

    $(window).on({
        'load': function () {
            Y$.getWindowScroll();
            Y$.getWindowSize();
        },
        'scroll': function () {
            Y$.getWindowScroll();
        },
        'resize': function () {
            Y$.getWindowSize();
        }
    })
}(jQuery));