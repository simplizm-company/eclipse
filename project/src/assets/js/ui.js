(function($){
    'use strict';

    if (typeof window.ui === 'undefined') {
        var ui = window.ui = {}
    }

    ui.setElementsVariable = function () {
        ui.$html      = $('html');
        ui.$body      = $('body');
    }

    // ui.slider = (function (_) {
    //     return {
    //         mainVisual : function () {
    //             this.$mainVisual = $('#main .main_visual .slick-wrap').slick({
    //                 fade : true,
    //                 arrows : true,
    //                 dots : false,
    //                 infinite : true,
    //                 slidesToShow : 1,
    //                 slidesToScroll : 1,
    //                 accessibility : false
    //             });
    //         }
    //     }
    // })(ui);

    ui.inputfile = function (target) {
        var $target = $(target), value = $target.val();
        $target.next().val(value);
    }

    ui.hello = (function (_) {
        return {
            init : function () {
                var self = this;
                if (_.$hello) {
                    _.$hello.each(function(idx, obj){
                        obj.t = $(obj).offset().top;
                        obj.h = $(obj).outerHeight() / 2;
                        obj.p = obj.t + obj.h;
                        obj.e = 'scroll.lmotion'+idx;
                        self.scroll(obj);
                        $(window).on(obj.e, function () {
                            self.scroll(obj);
                        });
                    });
                }
            },
            scroll : function (obj) {
                if(_.winscrlT + _.winsizeH > obj.p && !obj.visible){
                    $(obj).addClass('_visible');
                    $(window).off(obj.e);
                    obj.visible = true;
                }
            }
        }
    })(ui);

    ui.tabAction = function (navi, cont) {
        var _ = ui;
        function action(tab, idx){
            tab.def.$navi.eq(idx).addClass('on').siblings().removeClass('on');
            tab.def.$cont.eq(idx).addClass('on').siblings().removeClass('on');
            tab.def.offsetTop = tab.def.$navi.offset().top;

            tab.def.idx = idx;
        }
        var tabAction = (function () {
            return {
                def : {
                    idx : 0,
                    $navi : $(navi).children(),
                    $cont : $(cont).children()
                },
                init : function () {
                    var _this = this;
                    _this.def.$navi.on('click', function () {
                        action(_this, $(this).index());
                    });
                    return _this;
                },
                setIndex : function(idx){
                    action(this, idx);
                    $('html, body').animate({scrollTop : this.def.offsetTop-_.$header.outerHeight()}, 300);
                }
            };
        })();
        return tabAction.init();
    }

    ui.textMarginCut = function (target) {
        target.find('._').each(function (idx, obj) {
            this.$inner = $(this).wrapInner('<div>').children('div');
            this.lineHeight = parseInt($(this).css('line-height'));
            this.fontSize = parseInt($(this).css('font-size'));
            this.margin = (this.lineHeight - this.fontSize) / this.fontSize;
            $(this).css({'display': 'flex'});
            this.$inner.css({'margin': '-'+this.margin+'ex 0'});
        });
    }

    $(document).ready(function () {
        ui.setElementsVariable();
        ui.textMarginCut($('body'));
    });

    $(window).on({
        'load' : function () {
            ui.hello.init();

            Y$.matchmedia({
                matchDesktop : function () {
                    console.log('pc');
                },
                matchMobile : function () {
                    console.log('mobile');
                }
            });
        },
        'resize' : function () {
            //
        },
        'scroll' : function () {
            //
        }
    });
})(jQuery);
