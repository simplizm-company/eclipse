/*
 * sunrise for jQuery
 * Version: 1.0.1
 * Author: shinyongjun
 * Website: http://www.simplizm.com/
 */

;(function ($) {
    'use strict';

    var Sunrise = window.Sunrise || {};

    Sunrise = (function () {
        var pluginIndex = 0;
        function sunrise (url, settings) {
            var _ = this,
                settings = settings === undefined ? {} : settings,
                defaults = {
                    url: url,
                    inline: false,
                    background: true,
                    centerMode: true,
                    computedScroll: false,
                    positionTop: 0,
                    positionLeft: 0,
                    pluginIndex: pluginIndex++,
                    openCallback: function () {},
                    closeCallback: function () {}
                }

            _.options = $.extend(defaults, settings);

            _.init(true);
        };
        return sunrise;
    }());

    Sunrise.prototype.getWindowProperty = function () {
        var _ = this;
        _.windowWidth = $(window).width();
        _.windowHeight = $(window).height();
        _.windowScrollY = $(window).scrollTop();
        _.windowScrollX = $(window).scrollLeft();
    }

    Sunrise.prototype.setElements = function () {
        var _ = this;
        _.$body = $('body');
        _.$wrapper = _.$body.append('<div class="sunrise-wrapper"></div>').children('.sunrise-wrapper:last-child');
        if (_.options.background) {
            _.$back = _.$wrapper.append('<div class="sunrise-back" sunrise="close"></div>').children('.sunrise-back');
        }
        _.$outer = _.$wrapper.append('<div class="sunrise-outer"></div>').children('.sunrise-outer');
        _.$inner = _.$outer.append('<div class="sunrise-inner"></div>').children('.sunrise-inner');
    }

    Sunrise.prototype.setPopupStyle = function () {
        var _ = this;
        if (_.options.centerMode) {
            _.getWindowProperty();
            _.popupWidth = _.$outer.width();
            _.popupHeight = _.$outer.height();
            if (_.popupWidth > _.windowWidth * 0.8) {
                _.$outer.css({'left': _.windowScrollX + _.windowWidth * 0.1});
            } else {
                _.$outer.css({'left': _.windowScrollX + ((_.windowWidth - _.popupWidth) / 2)});
            }
            if (_.popupHeight > _.windowHeight * 0.8) {
                _.$outer.css({'top': _.windowScrollY + _.windowHeight * 0.1});
            } else {
                _.$outer.css({'top': _.windowScrollY + ((_.windowHeight - _.popupHeight) / 2)});
            }
        } else {
            _.getWindowProperty();
            _.$outer.css({
                'top': _.options.positionTop,
                'left': _.options.positionLeft
            });
        }
    }

    Sunrise.prototype.EventsBinding = function () {
        var _ = this;
        _.$wrapper.find('[sunrise=close]').on('click', function () {
            _.popupClose();
        });
    }

    Sunrise.prototype.popupClose = function () {
        var _ = this;
        _.$wrapper.remove();
        _.options.closeCallback();
    }

    Sunrise.prototype.openEvents = function (data) {
        var _ = this;
        ui.textMarginCut(_.$inner);
        _.setPopupStyle();
        _.$outer.addClass('_visible');
        _.EventsBinding();
        _.options.openCallback(data);
    }

    Sunrise.prototype.getAjaxPopup = function () {
        var _ = this;
        if (!_.options.inline) {
            $.ajax({
                url: _.options.url,
                timeout: 10000,
                dataType: 'html',
                success: function (data) {
                    _.$inner.append(data);
                    if (_.$inner.find('img').length) {
                        var idx = 0;
                        var max = _.$inner.find('img').length;
                        _.$inner.find('img').one('load', function (obj) {
                            idx++;
                            if (idx === max) {
                                _.openEvents(data);
                            }
                        });
                    } else {
                        _.openEvents(data);
                    }
                }
            });
        } else {
            var $data = _.$inner.append($(_.options.url).clone()).children(_.options.url);
            $data.show();
            if (_.$inner.find('img').length) {
                var idx = 0;
                var max = _.$inner.find('img').length;
                _.$inner.find('img').one('load', function (obj) {
                    idx++;
                    if (idx === max) {
                        _.openEvents();
                    }
                });
            } else {
                _.openEvents();
            }
        }
    }

    Sunrise.prototype.init = function () {
        var _ = this;
        _.setElements();
        _.getAjaxPopup();
    }

    window.sunrise = function () {
        var _ = new Sunrise(arguments[0], arguments[1]);
        return _;
    }
}(jQuery));