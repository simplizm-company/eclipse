/*
 * kronos for jQuery
 * Version: 1.0.1
 * Author: shinyongjun
 * Website: http://www.simplizm.com/
 */

;(function($){
    'use strict';

    var Kronos = window.Kronos || {};

    Kronos = (function(){
        var fnidx = 0;

        function kronos(element, settings){
            var _ = this, settings = settings === undefined ? {} : settings;

            var defaults = {
                initDate : null,
                nameSpace : 'kronos',
                format : 'yyyy-mm-dd',
                visible : false,
                disableWeekends : false,
                button : {
                    month : true,
                    year : true,
                    trigger : false,
                    today : false
                },
                text : {
                    thisMonth : '월',
                    thisYear : '년',
                    days : ['일', '월', '화', '수', '목', '금', '토'],
                    month : ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
                    btnToday : '오늘로',
                    btnPrevMonth : '이전달',
                    btnNextMonth : '다음달',
                    btnPrevYear : '이전해',
                    btnNextYear : '다음해'
                },
                select : false,
                selectYear : {
                    start : -100,
                    end : 0
                },
                periodFrom : false,
                periodTo : false,
                date : {
                    /* ex : ['19910301', '1231'] */
                    disabled : [],
                    holiday : []
                },
                onChange : function(){
                    //console.log(date);
                }
            }

            _.opt = _.hasOwnProperty(defaults, settings);
            _.str = {}
            _.sbj = {
                weekCount : 0,
                oldY : false,
                oldM : false
            };
            _.$input = $(element).attr('readonly', 'readonly').addClass(_.opt.nameSpace+'-input');
            _.$from = _.opt.periodFrom ? $(_.opt.periodFrom) : false;
            _.$to = _.opt.periodTo ? $(_.opt.periodTo) : false;

            _.core = {
                today : null,
                input : null,
                from : null,
                to : null
            }

            _.node = {
                outer : '<div class="'+_.opt.nameSpace+'-outer" />',
                trigger : '<button type="button" class="'+_.opt.nameSpace+'-trigger" title="'+_.opt.text.btnToday+'">'+_.opt.text.btnToday+'</button>',
                viewer : '<div class="'+_.opt.nameSpace+'-viewer" />',
                animate : '<div class="'+_.opt.nameSpace+'-animate" />',
                btnPrevMonth : '<button type="button" class="'+_.opt.nameSpace+'-prev-month" title="'+_.opt.text.btnPrevMonth+'">'+_.opt.text.btnPrevMonth+'</button>',
                btnNextMonth : '<button type="button" class="'+_.opt.nameSpace+'-next-month" title="'+_.opt.text.btnNextMonth+'">'+_.opt.text.btnNextMonth+'</button>',
                btnPrevYear : '<button type="button" class="'+_.opt.nameSpace+'-prev-year" title="'+_.opt.text.btnPrevYear+'">'+_.opt.text.btnPrevYear+'</button>',
                btnNextYear : '<button type="button" class="'+_.opt.nameSpace+'-next-year" title="'+_.opt.text.btnNextYear+'">'+_.opt.text.btnNextYear+'</button>',
                btnToday : '<button type="button" class="'+_.opt.nameSpace+'-today" title="'+_.opt.text.btnToday+'">'+_.opt.text.btnToday+'</button>'
            }

            _.fnidx = fnidx++;
            _.keyupEvent = 'keyup.kronos'+_.fnidx,
            _.clickEvent = 'click.kronos'+_.fnidx;

            _.init(true);
        }

        return kronos;
    }());

    Kronos.prototype.hasOwnProperty = function(org, src){
        var _ = this;

        for(var prop in src){
            if(!Object.prototype.hasOwnProperty.call(src, prop)){
                continue;
            }
            if('object' === $.type(org[prop])){
                org[prop] = ($.isArray(org[prop]) ? src[prop].slice(0) : _.hasOwnProperty(org[prop], src[prop]));
            }else{
                org[prop] = src[prop];
            }
        }

        return org;
    }

    Kronos.prototype.checkFormat = function(){
        var _ = this;

        _.sbj.indexYS = _.opt.format.indexOf('y');
        _.sbj.indexYE = _.opt.format.lastIndexOf('y')+1;
        _.sbj.indexMS = _.opt.format.indexOf('m');
        _.sbj.indexME = _.opt.format.lastIndexOf('m')+1;
        _.sbj.indexDS = _.opt.format.indexOf('d');
        _.sbj.indexDE = _.opt.format.lastIndexOf('d')+1;

        _.sbj.formatY = String(_.opt.format.substring(_.sbj.indexYS, _.sbj.indexYE));
        _.sbj.formatM = String(_.opt.format.substring(_.sbj.indexMS, _.sbj.indexME));
        _.sbj.formatD = String(_.opt.format.substring(_.sbj.indexDS, _.sbj.indexDE));
    }

    Kronos.prototype.getTodayDate = function(){
        var _ = this;

        _.sbj.date        = new Date();
        _.sbj.todayY    = _.sbj.date.getFullYear();
        _.sbj.todayM    = _.sbj.date.getMonth();
        _.sbj.todayD    = _.sbj.date.getDate();
        _.sbj.dateLeng    = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        _.core.today    = String(_.sbj.todayY) + _.combineZero(_.sbj.todayM + 1) + _.combineZero(_.sbj.todayD);
    }

    Kronos.prototype.combineZero = function(number){
        return String(number).length == 1 ? '0' + String(number) : String(number);
    }

    Kronos.prototype.combineCore = function(year, month, date){
        return String(year)+String(month)+String(date);
    }

    Kronos.prototype.isolateCore = function(core, get){
        switch(get){
            case 'year+month' :
                return core.substring(0, 6);
                break;
            case 'year' :
                return core.substring(0, 4);
                break;
            case 'month' :
                return core.substring(4, 6);
                break;
            case 'date' :
                return core.substring(6, 8);
                break;
            default :
                return false;
                break;
        }
    }

    Kronos.prototype.setLayout = function(){
        var _ = this;

        _.$outer = _.$input.wrap(_.node.outer).parent('.'+_.opt.nameSpace+'-outer');

        if(_.opt.button.trigger){
            _.$trigger = _.$outer.append(_.node.trigger).children('.'+_.opt.nameSpace+'-trigger');
        }

        _.$viewer = _.$outer.append(_.node.viewer).children('.'+_.opt.nameSpace+'-viewer');
        _.$animate = _.$viewer.append(_.node.animate).children('.'+_.opt.nameSpace+'-animate');
    }

    Kronos.prototype.inputInit = function(){
        var _ = this;

        if(_.opt.initDate){
            _.core.input = _.opt.initDate;
            _.$input.attr({'core' : _.core.input}).val(_.convertFormat(_.core.input));
        }
    }

    Kronos.prototype.convertFormat = function(core){
        var _ = this, f, y, m, d;

        y = _.sbj.formatY.length === 2 ? String(core.substring(2, 4)) : String(core.substring(0, 4));
        m = String(core.substring(4, 6));
        d = String(core.substring(6, 8));
        f = _.opt.format.replace(_.sbj.formatY, y).replace(_.sbj.formatM, m).replace(_.sbj.formatD, d);

        return f;
    }

    Kronos.prototype.setDatepicker = function(){
        var _ = this;

        _.setDate();
        _.setMarkup();
        _.getCoreDate();
        _.setDateClass();
        _.onClickDate();
        _.onClickButton();
        _.onChangeSelect();
        _.slideAnimate();

        if(_.initFlag){
            _.$input.focus();
        }
    }

    Kronos.prototype.setDate = function(){
        var _ = this;

        _.sbj.thisY = _.sbj.date.getFullYear();
        _.sbj.thisM = _.sbj.date.getMonth();
        _.str.thisM = _.combineZero(_.sbj.thisM + 1);
        _.sbj.prevY = _.sbj.thisM === 0 ? _.sbj.thisY - 1 : _.sbj.thisY;
        _.sbj.prevM = _.sbj.thisM === 0 ? 11 : _.sbj.thisM - 1;
        _.sbj.nextY = _.sbj.thisM === 11 ? _.sbj.thisY + 1 : _.sbj.thisY;
        _.sbj.nextM = _.sbj.thisM === 11 ? 0 : _.sbj.thisM + 1;
        _.sbj.dateLeng[1] = (_.sbj.thisY % 4 === 0 && _.sbj.thisY % 100 !== 0) || _.sbj.thisY % 400 === 0 ? 29 : 28;
        _.sbj.thisDateLeng = _.sbj.dateLeng[_.sbj.thisM];
        _.sbj.titleYM = _.sbj.thisY + '. ' + _.str.thisM;
        _.str.thisYM = _.sbj.thisY + _.str.thisM;
        _.str.prevYM = _.sbj.prevY + _.combineZero(_.sbj.prevM + 1);
        _.str.nextYM = _.sbj.nextY + _.combineZero(_.sbj.nextM + 1);
        _.sbj.date.setDate(1);
        _.sbj.firstDay = _.sbj.date.getDay();
    }

    Kronos.prototype.getCoreDate = function(){
        var _ = this;

        if(_.$input.attr('core')){
            _.core.input = _.$input.attr('core');
        }

        if(_.$from && _.$from.attr('core')){
            _.core.from = _.$from.attr('core');
        }

        if(_.$to && _.$to.attr('core')){
            _.core.to = _.$to.attr('core');
        }
    }

    Kronos.prototype.resetPeriod = function(){
        var _ = this;

        _.$input.val(null).attr('core', null);
        _.core.input = null, _.core.from = null, _.core.to = null;

        _.setDateClass();
    }

    Kronos.prototype.slideAnimate = function(){
        var _ = this;

        _.$animate.animate({'left' : _.sbj.outerLeft}, 300, function(){
            _.$oldInner.remove();
            _.$animate.css({'left' : 0});
            _.$newInner.removeClass('new').addClass('old').css({'left' : 0});
            _.sbj.oldY = _.sbj.thisY;
            _.sbj.oldM = _.sbj.thisM;
        });
    }
    
    Kronos.prototype.setMarkup = function(){
        var _ = this;

        _.setPositionLeft();
        _.setLayoutMarkup();
        _.setNaviMarkup();
        _.setDaysMarkup();
        _.setDateMarkup();
    }

    Kronos.prototype.setPositionLeft = function(){
        var _ = this;

        switch(true){
            case !_.sbj.oldY || _.sbj.oldY === _.sbj.thisY && _.sbj.oldM === _.sbj.thisM :
                _.sbj.innerLeft = '0px';
                _.sbj.outerLeft = '0px';
                break;
            case _.sbj.oldY < _.sbj.thisY :
                _.sbj.innerLeft = '100%';
                _.sbj.outerLeft = '-100%';
                break;
            case _.sbj.oldY > _.sbj.thisY :
                _.sbj.innerLeft = '-100%';
                _.sbj.outerLeft = '100%';
                break;
            case _.sbj.oldM < _.sbj.thisM :
                _.sbj.innerLeft = '100%';
                _.sbj.outerLeft = '-100%';
                break;
            default :
                _.sbj.innerLeft = '-100%';
                _.sbj.outerLeft = '100%';
                break;
        }
    }

    Kronos.prototype.setLayoutMarkup = function(){
        var _ = this;

        _.$oldInner = _.$animate.children('.'+_.opt.nameSpace+'-inner');
        _.$newInner = _.$animate.append('<div class="'+_.opt.nameSpace+'-inner" style="left: '+_.sbj.innerLeft+'" />').children('.'+_.opt.nameSpace+'-inner:last-child')
        _.$head = _.$newInner.append('<div class="'+_.opt.nameSpace+'-head" />').children('.'+_.opt.nameSpace+'-head');
        _.$body = _.$newInner.append('<div class="'+_.opt.nameSpace+'-body" />').children('.'+_.opt.nameSpace+'-body');
        _.$title = _.$head.append('<div class="'+_.opt.nameSpace+'-title" />').children('.'+_.opt.nameSpace+'-title');
    }

    Kronos.prototype.setNaviMarkup = function(){
        var _ = this;

        if(_.opt.select){
            _.setSelectMarkup();
        }else{
            _.$title.append('<div class="'+_.opt.nameSpace+'-title-year">'+_.sbj.thisY+_.opt.text.thisYear+'</div>');
            _.$title.append('<div class="'+_.opt.nameSpace+'-title-month">'+_.opt.text.month[_.sbj.thisM]+_.opt.text.thisMonth+'</div>');
        }

        if(_.opt.button.month){
            _.$btnPrevMonth = _.$head.append(_.node.btnPrevMonth).children('.'+_.opt.nameSpace+'-prev-month');
            _.$btnNextMonth = _.$head.append(_.node.btnNextMonth).children('.'+_.opt.nameSpace+'-next-month');
        }

        if(_.opt.button.year){
            _.$btnPrevYear = _.$head.append(_.node.btnPrevYear).children('.'+_.opt.nameSpace+'-prev-year');
            _.$btnNextYear = _.$head.append(_.node.btnNextYear).children('.'+_.opt.nameSpace+'-next-year');
        }

        if(_.opt.button.today){
            _.$btnToday = _.$head.append(_.node.btnToday).children('.'+_.opt.nameSpace+'-today');
        }
    }

    Kronos.prototype.setSelectMarkup = function(){
        var _ = this;
        
        _.node.selectYear = '<select class="'+_.opt.nameSpace+'-select-year">';
        _.sbj.selectYearStart = _.sbj.todayY+_.opt.selectYear.start;
        _.sbj.selectYearEnd = _.sbj.todayY+_.opt.selectYear.end;
        for(var i = _.sbj.selectYearEnd; i >= _.sbj.selectYearStart; i--){
            _.node.selectYear += i === _.sbj.thisY ? '<option value="'+i+'" selected>'+i+'</option>' : '<option value="'+i+'">'+i+'</option>';
        }
        _.node.selectYear += '</select>'+_.opt.text.thisYear;
        _.$selectYear = _.$title.append(_.node.selectYear).children('.'+_.opt.nameSpace+'-select-year');
        _.$selectYearOption = _.$selectYear.children('option');

        _.node.selectMonth = '<select class="'+_.opt.nameSpace+'-select-month">';
        for(var i = 1; i < 13; i++){
            _.node.selectMonth += i === (_.sbj.thisM+1) ? '<option value="'+i+'" selected>'+i+'</option>' : '<option value="'+i+'">'+i+'</option>';
        }
        _.node.selectMonth += '</select>'+_.opt.text.thisMonth;
        _.$selectMonth = _.$title.append(_.node.selectMonth).children('.'+_.opt.nameSpace+'-select-month');
        _.$selectMonthOption = _.$selectMonth.children('option');
    }

    Kronos.prototype.setDaysMarkup = function(){
        var _ = this;

        _.node.markup = '<table><thead><tr>';
        for(var i = 0; i < 7; i++){
            _.node.markup += '<th>'+_.opt.text.days[i]+'</th>';
        }
        _.node.markup += '</tr></thead>';
    }

    Kronos.prototype.setDateMarkup = function(){
        var _ = this, pmFirstDay = _.sbj.dateLeng[_.sbj.prevM] - _.sbj.firstDay;

        _.node.markup += '<tbody><tr>';

        for(var i = 1; i <= _.sbj.firstDay; i++){
            _.node.markup += '<td><button type="button" core="'+_.str.prevYM+(pmFirstDay+i)+'" title="'+_.convertFormat(_.str.prevYM+(pmFirstDay+i))+'">'+(pmFirstDay+i)+'</button></td>';
            _.sbj.weekCount++;
        }

        for(var i = 1; i <= _.sbj.thisDateLeng; i++){
            if(_.sbj.weekCount === 0){
                _.node.markup += '<tr>';
            }
            _.node.markup += '<td><button type="button" core="'+_.str.thisYM+_.combineZero(i)+'" title="'+_.convertFormat(_.str.thisYM+_.combineZero(i))+'">'+i+'</button></td>';
            _.sbj.weekCount++;
            if(_.sbj.weekCount === 7){
                _.node.markup += '</tr>';
                _.sbj.weekCount = 0;
            }
        }

        for(var i = 1; _.sbj.weekCount != 0; i++){
            if(_.sbj.weekCount === 7){
                _.node.markup += '</tr>';
                _.sbj.weekCount = 0;
            }else{
                _.node.markup += '<td><button type="button" core="'+_.str.nextYM+_.combineZero(i)+'" title="'+_.convertFormat(_.str.nextYM+_.combineZero(i))+'">'+i+'</button></td>';
                _.sbj.weekCount++;
            }
        }

        _.node.markup += '</tbody></table>';
        _.$body.html(_.node.markup);
        _.$viewer.css({'height' : _.$newInner.outerHeight()});
    }

    Kronos.prototype.setDateClass = function(){
        var _ = this;

        _.$date = _.$body.find('td').removeClass();
        _.$date.each(function(){
            this.index = $(this).index();
            this.core = $(this).find('button').attr('core');
            this.mmdd = String(this.core).substring(4, 8);

            this.Class = this.index === 0 ? 'sunday' : this.index === 6 ? 'satday' : ''; // 주말 체크
            this.Class += this.core === _.core.input
                || this.core === _.core.from
                || this.core === _.core.to
                ? ' selected' : '';
            this.Class += _.core.input && _.core.from && this.core > _.core.from && this.core < _.core.input
                || _.core.input && _.core.to && this.core < _.core.to && this.core > _.core.input
                ? ' period' : '';
            this.Class += this.core === _.core.today ? ' today' : '';
            this.Class += _.isolateCore(this.core, 'year+month') === _.str.prevYM
                || _.opt.disableWeekends && (this.index === 0 || this.index === 6)
                || _.isolateCore(this.core, 'year+month') === _.str.nextYM
                || _.core.from && this.core < _.core.from
                || _.core.to && this.core > _.core.to
                || _.opt.date.disabled.indexOf(this.core) !== -1
                || _.opt.date.disabled.indexOf(this.mmdd) !== -1
                ? ' disabled' : '';
            this.Class += _.opt.date.holiday.indexOf(this.core) !== -1
                || _.opt.date.holiday.indexOf(this.mmdd) !== -1
                ? ' holiday' : '';
            $(this).addClass(this.Class);
        });
    }

    Kronos.prototype.setVisible = function(){
        var _ = this;

        _.$outer.addClass('visible');
        _.setDatepicker();

        $(window).on('load', function(){
            if(_.$from){
                _.$from.kronos('getCoreDate');
                _.$from.kronos('setDateClass');
            }
            if(_.$to){
                _.$to.kronos('getCoreDate');
                _.$to.kronos('setDateClass');
            }
        });
    }

    Kronos.prototype.onOpenEvent = function(){
        var _ = this;

        if(!_.$outer.hasClass('open')){
            _.$outer.addClass('open');
            _.setDatepicker();
            _.onCloseEvent();
        }
    }

    Kronos.prototype.onCloseEvent = function(){
        var _ = this;

        _.$outer.on(_.keyupEvent, function(e){
            if(e.keyCode === 27){
                _.closeDatepicker();
            }
        });

        $(document).on(_.clickEvent, function(e){
            if(!$(e.target).closest(_.$outer[0]).length){
                _.closeDatepicker();
            }
        });
    }

    Kronos.prototype.closeDatepicker = function(){
        var _ = this;

        _.$animate.empty();
        _.$outer.removeClass('open');
        _.$outer.off(_.keyupEvent);
        $(document).off(_.clickEvent);
    }

    Kronos.prototype.onClickInput = function(){
        var _ = this;

        if(!_.opt.visible){
            _.$input.on({
                'click' : function(){
                    _.onOpenEvent();
                },
                'keypress' : function(e){
                    if(e.keyCode === 13){
                        _.onOpenEvent();
                    }
                }
            });
        }

        if(_.opt.button.trigger){
            _.$trigger.on({
                'click' : function(){
                    _.onOpenEvent();
                }
            });
        }
    }

    Kronos.prototype.onClickDate = function(){
        var _ = this;

        _.$date.on('click', function(){
            if(!$(this).hasClass('disabled')){
                _.$input.val(_.convertFormat(this.core)).attr({'core' : this.core});
                _.opt.onChange(this.core);
                if(_.opt.visible){
                    _.getCoreDate();
                    _.setDateClass();
                    if(_.$from){
                        _.$from.kronos('getCoreDate');
                        _.$from.kronos('setDateClass');
                    }
                    if(_.$to){
                        _.$to.kronos('getCoreDate');
                        _.$to.kronos('setDateClass');
                    }
                }else{
                    _.closeDatepicker();
                }
            }
        });
    }

    Kronos.prototype.onClickButton = function(){
        var _ = this;

        if(_.opt.button.month){
            _.$btnPrevMonth.on('click', function(){
                _.sbj.date.setMonth(_.sbj.date.getMonth()-1);
                if(_.opt.select && _.sbj.date.getFullYear() < _.sbj.selectYearStart){
                    _.sbj.date.setMonth(_.sbj.date.getMonth()+1)
                    return false;
                }else{
                    _.setDatepicker();
                }
            });

            _.$btnNextMonth.on('click', function(){
                _.sbj.date.setMonth(_.sbj.date.getMonth()+1);
                if(_.opt.select && _.sbj.date.getFullYear() > _.sbj.selectYearEnd){
                    _.sbj.date.setMonth(_.sbj.date.getMonth()-1)
                    return false;
                }else{
                    _.setDatepicker();
                }
            });
        }

        if(_.opt.button.year){
            _.$btnPrevYear.on('click', function(){
                _.sbj.date.setFullYear(_.sbj.thisY-1);
                if(_.opt.select && _.sbj.thisY <= _.sbj.selectYearStart){
                    _.sbj.date.setFullYear(_.sbj.thisY);
                    return false;
                }else{
                    _.setDatepicker();
                }
            });

            _.$btnNextYear.on('click', function(){
                _.sbj.date.setFullYear(_.sbj.thisY+1);
                if(_.opt.select && _.sbj.thisY >= _.sbj.selectYearEnd){
                    _.sbj.date.setFullYear(_.sbj.thisY);
                    return false;
                }else{
                    _.setDatepicker();
                }
            });
        }

        if(_.opt.button.today){
            _.$btnToday.on('click', function(){
                if(_.sbj.todayY === _.sbj.thisY && _.sbj.todayM === _.sbj.thisM){
                    return false;
                }else{
                    _.sbj.date.setFullYear(_.sbj.todayY);
                    _.sbj.date.setMonth(_.sbj.todayM);
                    _.setDatepicker();
                }
            });
        }
    }

    Kronos.prototype.onChangeSelect = function(){
        var _ = this;

        if(_.opt.select){
            _.$selectYear.on('change', function(){
                _.sbj.date.setFullYear($(this).val());
                _.setDatepicker();
            });

            _.$selectMonth.on('change', function(){
                _.sbj.date.setMonth($(this).val()-1);
                _.setDatepicker();
            });
        }
    }

    Kronos.prototype.init = function(){
        var _ = this;

        _.checkFormat();
        _.getTodayDate();
        _.setLayout();
        _.inputInit();
        _.onClickInput();

        if(_.opt.visible){
            _.setVisible();
        }

        _.initFlag = true;
    }

    $.fn.kronos = function(){
        var _ = this,
            o = arguments[0],
            s = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            r;

        for(var i = 0; i < l; i++){
            if(typeof o == 'object' || typeof o == 'undefined'){
                _[i].Kronos = new Kronos(_[i], o);
            }else{
                r = _[i].Kronos[o].apply(_[i].Kronos, s);
                if(typeof r != 'undefined'){
                    return r;
                }
            }
        }

        return _;
    }
}(jQuery));