/*
 * Eclipse for jQuery
 * Version: 1.0.1
 * Author: shinyongjun
 * Website: http://www.simplizm.com/
 */

;(function($){
    'use strict';

    var Eclipse = window.Eclipse || {};

    Eclipse = (function(){
        function eclipse(element, settings){
            var _ = this;

            _.defaults = {
                nameSpace: 'eclipse', // class 네임스페이스
                startIndex: 0, // slider 시작 index
                arrow: true, // arrow navigation 사용 여부
                pager: true, // pager 사용 여부
                slidesToShow: 1, // 한번에 보여질 slide 갯수
                slidesToMove: 1, // 한번에 움직이는 slides 갯수
                speed: 500, // 전환 속도
                margin: 0, // slides 간격
                friction: 200, // mousemove, touchmove 감도
                countIndex: 0, // 첫번째 활성 슬라이드의 인덱스값을 조절
                autoplay: false, // 자동 롤링
                interval: 3000 // 자동 롤링 시간 간격
            }

            _.options = $.extend({}, _.defaults, settings);

            _.initials = {
                slidesCount: 0, // slides 갯수
                thisIndex: 0, // 현재 index
                thisLastIndex: 0, // active중 마지막 index
                sliderWidth: 0, // 슬라이더 너비값
                nextIndex: 0, // 다음 index
                transition: _.options.speed + 'ms', // transition 속도
                playActionFlag: false, // 시작종료 flag
                viewIndex: [], // 보여지는 slides의 배열
                computedIndexArray: [], // 계산용 index 배열
                clickStartFlag: false, // click start flag
                clickStartPosX: 0,
                clickMovePosX: 0,
                setMoveChecker: false,
                arrayCheckPoint: [],
                thisPageIndex: 0,
                pagerComputedLength: 0,
                autoplayInterval: null
            }

            _.$eclipse = $(element);

            _.init(true);
        }

        return eclipse;
    }());

    Eclipse.prototype.preparationAction = function (callback) {
        var _ = this;

        if (!_.initials.playActionFlag) {
            _.initials.playActionFlag = true;

            if (_.options.autoplay) {
                _.stopAutoplay();
                _.setAutoplay();
            }

            var minPoint = _.initials.slidesCount;
            var maxPoint = -1;
            var minIndex = 0;
            var maxIndex = 0;
            _.appClone = [];
            _.preClone = [];
            _.$appClone = [];
            _.$preClone = [];

            _.$slides.each(function (i) {
                this.isView = undefined;
                for (var j = 0; j < _.initials.viewIndex.length; j++) {
                    if (this.index === _.initials.viewIndex[j]) {
                        this.isView = _.initials.viewIndex.indexOf(_.initials.viewIndex[j]);
                        $(this).removeClass(`eclipse-active eclipse-active-${j + 1}`);
                    }
                }
                this.point = this.isView !== undefined ? this.isView : i - _.initials.viewIndex[0];
                this.left = this.width * this.point + (_.options.margin * this.point);
                this.transform = 'translate3d(' + this.left + 'px, 0, 0)';
                $(this).stop().css(_.autoPrefixer(0, 'none', this.transform));
                if (maxPoint < this.point) {
                    maxPoint = this.point;
                    maxIndex = i;
                }
                if (minPoint > this.point) {
                    minPoint = this.point;
                    minIndex = i;
                }
            }).promise().done(function () {
                for (var i = 0; i < _.options.slidesToShow; i++) {
                    _.preClone.push(_.initials.computedIndexArray[minIndex + _.initials.slidesCount - (i + 1)]);
                    _.appClone.push(_.initials.computedIndexArray[maxIndex + _.initials.slidesCount + (i + 1)]);
                }
                for (var j = 0; j < _.preClone.length; j++) {
                    var self = _.$slides.eq(_.preClone[j]).clone().prependTo(_.$slider).addClass('eclipse-clone')[0];
                    self.index = _.preClone[j];
                    self.width = _.$slides.eq(_.preClone[j])[0].width;
                    self.point = _.$slides.eq(minIndex)[0].point - (j + 1);
                    self.left = self.width * self.point + (_.options.margin * self.point);
                    self.transform = 'translate3d(' + self.left + 'px, 0, 0)';
                    $(self).stop().css(_.autoPrefixer(0, 'none', self.transform));
                    _.$preClone.push(self);
                }
                for (var j = 0; j < _.appClone.length; j++) {
                    var self = _.$slides.eq(_.appClone[j]).clone().appendTo(_.$slider).addClass('eclipse-clone')[0];
                    self.index = _.appClone[j];
                    self.width = _.$slides.eq(_.appClone[j])[0].width;
                    self.point = _.$slides.eq(maxIndex)[0].point + (j + 1);
                    self.left = self.width * self.point + (_.options.margin * self.point);
                    self.transform = 'translate3d(' + self.left + 'px, 0, 0)';
                    $(self).stop().css(_.autoPrefixer(0, 'none', self.transform));
                    _.$appClone.push(self);
                }
                if (callback) {
                    setTimeout(function () {
                        callback();
                    }, 50);
                }
            });
        }
    }

    Eclipse.prototype.afterationAction = function () {
        var _ = this;

        _.setPagerClass();

        setTimeout(function () {
            _.initials.playActionFlag = false;
            _.removeClone(_.$appClone);
            _.removeClone(_.$preClone);

            _.$slides.each(function (i) {
                this.isView = undefined;
                for (var j = 0; j < _.initials.viewIndex.length; j++) {
                    if (this.index === _.initials.viewIndex[j]) {
                        this.isView = _.initials.viewIndex.indexOf(_.initials.viewIndex[j]);
                    }
                }
                this.point = this.isView !== undefined ? this.isView : i - _.initials.viewIndex[0];
                this.left = this.width * this.point + (_.options.margin * this.point);
                this.transform = 'translate3d(' + this.left + 'px, 0, 0)';
                $(this).stop().css(_.autoPrefixer(0, 'none', this.transform));
            });
        }, _.options.speed);
    }

    Eclipse.prototype.removeClone = function (target) {
        var _ = this;

        $(target).each(function () {
            $(this).remove();
        }).promise().done(function () {
            target = [];
        });
    }

    Eclipse.prototype.goToSlidesPrevOrNext = function (nextIndex) {
        var _ = this;

        var computedNextIndex = 0;

        if (nextIndex == 'next') {
            _.initials.thisPageIndex++;
            _.initials.thisPageIndex = _.initials.thisPageIndex !== _.initials.arrayCheckPoint.length ? _.initials.thisPageIndex : 0;
            if (_.options.slidesToMove !== 1) {
                if (_.initials.thisPageIndex == _.initials.arrayCheckPoint.length - 1 && _.initials.arrayCheckPoint.slice(-1)[0] + _.options.slidesToShow >= _.initials.slidesCount) {
                    computedNextIndex = _.initials.arrayCheckPoint.slice(-1)[0] % _.options.slidesToMove;
                } else {
                    if (_.initials.thisPageIndex == 0) {
                        computedNextIndex = _.options.slidesToShow;
                    } else {
                        computedNextIndex = _.options.slidesToMove;
                    }
                }
            } else {
                computedNextIndex = 1;
            }
        }

        if (nextIndex == 'prev') {
            _.initials.thisPageIndex--;
            _.initials.thisPageIndex = _.initials.thisPageIndex !== -1 ? _.initials.thisPageIndex : _.initials.arrayCheckPoint.length - 1;
            if (_.options.slidesToMove !== 1) {
                if (_.initials.thisPageIndex == _.initials.arrayCheckPoint.length - 2 && _.initials.arrayCheckPoint.slice(-1)[0] + _.options.slidesToMove >= _.initials.slidesCount) {
                    computedNextIndex = -_.initials.arrayCheckPoint.slice(-1)[0] % _.options.slidesToMove;
                } else {
                    if (_.initials.thisPageIndex == _.initials.arrayCheckPoint.length - 1) {
                        computedNextIndex = -_.options.slidesToShow;
                    } else {
                        computedNextIndex = -_.options.slidesToMove;
                    }
                }
            } else {
                computedNextIndex = -1;
            }
        }

        _.setViewIndex(computedNextIndex);

        function motionScript (target) {
            target.point -= computedNextIndex;
            target.left = target.width * target.point + (_.options.margin * target.point);
            target.transform = 'translate3d(' + target.left + 'px, 0, 0)';
            $(target).stop().css(_.autoPrefixer(0, _.initials.transition, target.transform));
        }

        $(_.$appClone).each(function () {
            motionScript(this);
        }).promise().done(function () {
            _.setActiveClass($(_.$appClone));
        });

        $(_.$preClone).each(function () {
            motionScript(this);
        }).promise().done(function () {
            _.setActiveClass($(_.$preClone));
        });

        _.$slides.each(function () {
            motionScript(this);
        }).promise().done(function () {
            _.setActiveClass(_.$slides);
            _.afterationAction();
        });
    }

    Eclipse.prototype.goToSlides = function (nextIndex) {
        var _ = this;
        var thisIndex = _.initials.viewIndex[0];

        if (_.initials.viewIndex[0] !== nextIndex && !_.initials.playActionFlag) {
            _.preparationAction(function () {
                var computedNextIndex = nextIndex;
        
                function motionScript (target) {
                    target.point += (thisIndex - computedNextIndex);
                    target.left = target.width * target.point + (_.options.margin * target.point);
                    target.transform = 'translate3d(' + target.left + 'px, 0, 0)';
                    $(target).stop().css(_.autoPrefixer(0, _.initials.transition, target.transform));
                }

                _.setViewIndex(computedNextIndex - _.initials.viewIndex[0]);

                $(_.$appClone).each(function () {
                    motionScript(this);
                }).promise().done(function () {
                    _.setActiveClass($(_.$appClone));
                });
        
                $(_.$preClone).each(function () {
                    motionScript(this);
                }).promise().done(function () {
                    _.setActiveClass($(_.$preClone));
                });

                _.$slides.each(function () {
                    motionScript(this);
                }).promise().done(function () {
                    _.setActiveClass(_.$slides);
                    _.afterationAction();
                });
            });
        }
    }

    Eclipse.prototype.setViewIndex = function (nextIndex) {
        var _ = this;

        for (var j = 0; j < _.initials.viewIndex.length; j++) {
            _.initials.viewIndex[j] = _.initials.computedIndexArray[_.initials.viewIndex[j] + _.initials.slidesCount + nextIndex];
        }
    }

    Eclipse.prototype.setActiveClass = function ($target) {
        var _ = this;

        $target.each(function (i) {
            for (var j = 0; j < _.initials.viewIndex.length; j++) {
                if (this.index === _.initials.viewIndex[j]) {
                    $(this).addClass(`eclipse-active eclipse-active-${j + 1}`);
                }
            }
        })
    }

    Eclipse.prototype.buildControls = function () {
        var _ = this;

        if (_.options.arrow === true) {
            var prev = $(`<button>prev</button>`).addClass(`eclipse-arrow eclipse-prev`),
                next = $(`<button>next</button>`).addClass(`eclipse-arrow eclipse-next`);
            _.$arrowPrev = prev.appendTo(_.$eclipse);
            _.$arrowNext = next.appendTo(_.$eclipse);
        }

        if (_.options.pager === true && _.initials.slidesCount > _.options.slidesToMove) {
            if (_.options.slidesToMove == 1) {
                _.initials.pagerComputedLength = _.initials.slidesCount;
            } else {
                _.initials.pagerComputedLength = Math.ceil((_.initials.slidesCount - _.options.slidesToShow) / _.options.slidesToMove) + 1;
            }
            var paging = $('<div />').addClass(`eclipse-paging`);
            for (var i = 1; i <= _.initials.pagerComputedLength; i++) {
                paging.append($(`<button>${i}</button>`).addClass(`eclipse-paging-button`));
            }
            _.$paging = paging.appendTo(_.$eclipse);
            _.$pagingButton = _.$paging.children();
        }

        _.setPagerClass();
    }

    Eclipse.prototype.autoPrefixer = function (left, transition, transform) {
        return {
            'left': left,
            '-webkit-transition': transition,
            '-moz-transition': transition,
            '-ms-transition': transition,
            'transition': transition,
            '-webkit-transform': transform,
            '-moz-transform': transform,
            '-ms-transform': transform,
            'transform': transform
        }
    }

    Eclipse.prototype.setSlidesCSS = function () {
        var _ = this;

        _.$slides.css({
            'float': 'none',
            'position': 'absolute',
            'top': 0
        });
    }

    Eclipse.prototype.setSlidesEach = function () {
        var _ = this;
        var indexTemp = [];
        var vi = _.options.startIndex;

        for (var j = 0; j < _.options.slidesToShow; j++) {
            _.initials.viewIndex[j] = vi;
            vi = vi + 1 > _.initials.slidesCount - 1 ? 0 : vi + 1;
        }

        _.$slides.each(function (i) {
            if (i > (_.initials.slidesCount - 1) - _.options.countIndex) {
                _.$slides.eq(0).before($(this));
            }
        }).promise().done(function () {
            _.$slides = _.$slider.children();
            _.$slides.each(function (i) {
                this.width = (_.initials.sliderWidth - (_.options.slidesToShow - 1) * _.options.margin) / _.options.slidesToShow;
                this.height = $(this).height();
                this.index = i;
                this.point = i - _.options.startIndex < 0 ? i - _.options.startIndex + _.initials.slidesCount : i - _.options.startIndex;
                this.left = this.index == _.options.startIndex ? this.width * this.point : (this.width * this.point) + (this.point * _.options.margin);
                this.transform = 'translate3d(' + this.left + 'px, 0, 0)';
    
                indexTemp.push(i);
    
                $(this).css({'width': this.width}).css(_.autoPrefixer(0, 'none', this.transform));
            }).promise().done(function () {
                for (var i = 0; i < 3; i++) {
                    _.initials.computedIndexArray.push.apply(_.initials.computedIndexArray, indexTemp);
                }
                _.$slider.css({
                    'overflow': 'hidden',
                    'position': 'relative',
                    'height': _.$slides[_.initials.viewIndex[0]].height
                });
                _.setActiveClass(_.$slides);
            });
        });
    }

    Eclipse.prototype.setInitials = function () {
        var _ = this;

        _.initials.slidesCount = _.$slides.length;
        _.initials.sliderWidth = _.$slider.width();
        _.options.slidesToMove = _.initials.slidesCount - _.options.slidesToShow < _.options.slidesToMove ? 1 : _.options.slidesToMove;
        _.initials.thisPageIndex = _.options.startIndex;

        if (_.options.slidesToMove === 1) {
            for (var i = 0; i < _.initials.slidesCount; i++) {
                _.initials.arrayCheckPoint.push(i);
            }
        } else {
            for (var i = 0; i < _.initials.slidesCount; i++) {
                if (i % _.options.slidesToMove == 0 && _.initials.arrayCheckPoint.length < Math.ceil((_.initials.slidesCount - _.options.slidesToShow) / _.options.slidesToMove) + 1) {
                    _.initials.arrayCheckPoint.push(i + _.options.slidesToShow - 1 > _.initials.slidesCount - 1 ? (_.initials.slidesCount - 1) - (_.options.slidesToShow - 1) : i);
                }
            }
        }
    }

    Eclipse.prototype.clickStart = function (e) {
        var _ = this;

        e.preventDefault();

        if (!_.initials.playActionFlag) {
            _.initials.clickStartPosX = e.posX;
    
            $(document).on({
                'clickmove.eclipse': function (e) {
                    _.clickMove(e);
                },
                'clickend.eclipse': function (e) {
                    _.clickEnd(e);
                }
            });
        }
    }

    Eclipse.prototype.clickMove = function (e) {
        var _ = this;

        _.initials.clickMovePosX = _.initials.clickStartPosX - e.posX;

        _.preparationAction();

        $(_.$appClone).each(function () {
            this.move = this.left - _.initials.clickMovePosX;
            this.transform = 'translate3d(' + this.move + 'px, 0, 0)';
            $(this).stop().css(_.autoPrefixer(0, 'none', this.transform));
        });

        $(_.$preClone).each(function () {
            this.move = this.left - _.initials.clickMovePosX;
            this.transform = 'translate3d(' + this.move + 'px, 0, 0)';
            $(this).stop().css(_.autoPrefixer(0, 'none', this.transform));
        });

        _.$slides.each(function () {
            this.move = this.left - _.initials.clickMovePosX;
            this.transform = 'translate3d(' + this.move + 'px, 0, 0)';
            $(this).stop().css(_.autoPrefixer(0, 'none', this.transform));
        });
    }

    Eclipse.prototype.clickEnd = function (e) {
        var _ = this;

        if (Math.abs(_.initials.clickMovePosX) > _.options.friction) {
            if (_.initials.clickMovePosX > 0) {
                _.goToSlidesPrevOrNext('next');
            }
            if (_.initials.clickMovePosX < 0) {
                _.goToSlidesPrevOrNext('prev');
            }
        } else {
            _.goToSlidesPrevOrNext(0);
        }
        $(document).off('clickmove.eclipse clickend.eclipse');
        _.initials.clickStartPosX = 0;
        _.initials.clickMovePosX = 0;
        _.initials.setMoveChecker = false;
    }

    Eclipse.prototype.setPagerClass = function () {
        var _ = this;

        _.$pagingButton.eq(_.initials.thisPageIndex).addClass('eclipse-paging-active').siblings().removeClass('eclipse-paging-active');
    }

    Eclipse.prototype.setEvents = function () {
        var _ = this;

        _.$slider.on({
            'clickstart.eclipse': function (e) {
                _.clickStart(e);
            }
        });

        _.$arrowPrev.on('click', function () {
            _.preparationAction(function () {
                _.goToSlidesPrevOrNext('prev');
            });
        });

        _.$arrowNext.on('click', function () {
            _.preparationAction(function () {
                _.goToSlidesPrevOrNext('next');
            });
        });

        _.$pagingButton.on('click', function () {
            _.initials.thisPageIndex = $(this).index();
            _.goToSlides(_.initials.arrayCheckPoint[$(this).index()]);
        });
    }

    Eclipse.prototype.setAutoplay = function () {
        var _ = this;

        if (_.options.autoplay) {
            _.initials.autoplayInterval = setInterval(function () {
                _.preparationAction(function () {
                    _.goToSlidesPrevOrNext('next');
                });
            }, _.options.interval);
        }
    }

    Eclipse.prototype.stopAutoplay = function () {
        var _ = this;

        clearInterval(_.initials.autoplayInterval);
    }

    Eclipse.prototype.init = function () {
        var _ = this;

        _.$eclipse.addClass('eclipse-wrapper')
        _.$slider = _.$eclipse.find('.eclipse-slider');
        _.$slides = _.$slider.children().addClass(`eclipse-slides`);

        _.setSlidesCSS();
        _.setInitials();
        _.setSlidesEach();
        _.buildControls();
        _.setEvents();
        _.setAutoplay();
    }

    $.fn.eclipse = function(){
        var _ = this,
            o = arguments[0],
            s = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            r;
        for (var i = 0; i < l; i++) {
            if (typeof o == 'object' || typeof o == 'undefined') {
                _[i].Eclipse = new Eclipse(_[i], o);
            } else {
                r = _[i].Eclipse[o].apply(_[i].Eclipse, s);
                if (typeof r != 'undefined') {
                    return r;
                }
            }
        }
        return _;
    }
}(jQuery));