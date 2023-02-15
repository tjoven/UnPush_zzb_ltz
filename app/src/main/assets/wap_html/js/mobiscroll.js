var jQuery = Zepto;

(function ($) {

    ['width', 'height'].forEach(function(dimension) {
        var offset, Dimension = dimension.replace(/./, function(m) { return m[0].toUpperCase() });
        $.fn['outer' + Dimension] = function(margin) {
            var elem = this;
            if (elem) {
                var size = elem[0]['offset' + Dimension];
                var sides = {'width': ['left', 'right'], 'height': ['top', 'bottom']};
                sides[dimension].forEach(function(side) {
                    if (margin) size += parseInt(elem.css('margin-' + side), 10);
                });
                return size;
            }
            else {
                return null;
            }
        };
    });

    ["Left", "Top"].forEach(function(name, i) {
        var method = "scroll" + name;

        function isWindow( obj ) {
            return obj && typeof obj === "object" && "setInterval" in obj;
        }

        function getWindow( elem ) {
            return isWindow( elem ) ? elem : elem.nodeType === 9 ? elem.defaultView || elem.parentWindow : false;
        }

        $.fn[method] = function( val ) {
            var elem, win;
            if (val === undefined) {
                elem = this[0];
                if (!elem) {
                    return null;
                }
                win = getWindow(elem);
                // Return the scroll offset
                return win ? ("pageXOffset" in win) ? win[i ? "pageYOffset" : "pageXOffset"] :
                    win.document.documentElement[method] ||
                    win.document.body[method] :
                    elem[method];
            }

            // Set the scroll offset
            this.each(function() {
                win = getWindow(this);
                if (win) {
                    var xCoord = !i ? val : $(win).scrollLeft();
                    var yCoord = i ? val : $(win).scrollTop();
                    win.scrollTo(xCoord, yCoord);
                }
                else {
                    this[method] = val;
                }
            });
        }
    });

    // Fix zepto.js extend to work with undefined parameter
    $.__extend = $.extend;
    $.extend = function() {
        arguments[0] = arguments[0] || {};
        return $.__extend.apply(this, arguments);
    }

})(jQuery);
﻿/*!
 * jQuery MobiScroll v2.1
 * http://mobiscroll.com
 *
 * Copyright 2010-2011, Acid Media
 * Licensed under the MIT license.
 *
 */
(function ($) {
    function Scroller(elm, settings) {
   		if(!settings.sys_render){
   			$(elm).on('click',function(){
   				var me = this;
   				sys_renderDatePicker(settings.preset,this.id);
   			});
   			return ;
   		}
        var that = this,
            e = elm,
            elm = $(e),
            theme,
            lang,
            s = $.extend({}, defaults),
            m,
            dw,
            warr = [],
            iv = {},
            input = elm.is('input'),
            visible = false;

        // Private functions

        function isReadOnly(wh) {
            if ($.isArray(s.readonly)) {
                var i = $('.dwwl', dw).index(wh);
                return s.readonly[i];
            }
            else
                return s.readonly;
        }

        function generateWheelItems(wIndex) {
            var html = '',
                hi = s.height,
                i = 0;
            for (var j in warr[wIndex]) {
                html += '<li class="dw-v" data-val="' + j + '" style="height:' + hi + 'px;line-height:' + hi + 'px;">' + warr[wIndex][j] + '</li>';
            }
            return html;
        }

        function getDocHeight() {
            var body = document.body,
                html = document.documentElement;
            return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        }

        function setGlobals(t) {
            min = $('li.dw-v', t).eq(0).index();
            max = $('li.dw-v', t).eq(-1).index();
            index = $('ul', dw).index(t);
            h = s.height;
            inst = that;
        }

        function formatHeader(v) {
            var t = s.headerText;
            return t ? (typeof (t) == 'function' ? t.call(e, v) : t.replace(/{value}/i, v)) : '';
        }

        function read() {
            that.temp = ((input && that.val !== null && that.val != elm.val()) || that.values === null) ? s.parseValue(elm.val() ? elm.val() : '', that) : that.values.slice(0);
            that.setValue(true);
        }

        function scrollToPos(time, orig, index, manual, dir) {
            // Call validation event
            s.validate.call(e, dw, index, time);

            // Set scrollers to position
            $('.dww ul', dw).each(function (i) {
                var t = $(this),
                    cell = $('li[data-val="' + that.temp[i] + '"]', t),
                    x = cell.index(),
                    v = scrollToValid(cell, x, i, dir),
                    sc = i == index || index === undefined;
                //if (v != t.data('pos'))
                that.scroll($(this), v, sc ? time : 0.2, orig, i);
            });

            // Reformat value if validation changed something
            that.change(manual);
        }

        function scrollToValid(cell, val, i, dir) {
            // Process invalid cells
            if (!cell.hasClass('dw-v')) {
                var cell1 = cell,
                    cell2 = cell,
                    dist1 = 0,
                    dist2 = 0;
                while (cell1.prev().length && !cell1.hasClass('dw-v')) {
                    cell1 = cell1.prev();
                    dist1++;
                }
                while (cell2.next().length && !cell2.hasClass('dw-v')) {
                    cell2 = cell2.next();
                    dist2++;
                }
                // If we have direction (+/- or mouse wheel), the distance does not count
                if (((dist2 < dist1 && dist2 && !dir == 1) || !dist1 || !cell1.hasClass('dw-v') || dir == 1) && cell2.hasClass('dw-v')) {
                    cell = cell2;
                    val = val + dist2;
                }
                else {
                    cell = cell1;
                    val = val - dist1;
                }
                that.temp[i] = cell.attr('data-val');
            }
            return val;
        }

        function position() {

            if (s.display == 'inline')
                return;

            function countWidth() {
                $('.dwc', dw).each(function () {
                    if ($(this).css('display') != 'none') {
                        w = $(this).outerWidth(true);
                        totalw += w;
                        minw = (w > minw) ? w : minw;
                    }
                });
                w = totalw > ww ? minw : totalw;
                w = $('.dwwr', dw).width(w + 1).outerWidth();
                h = d.outerHeight();
            }

            var totalw = 0,
                minw = 0,
                ww = $(window).width(),
                wh = window.innerHeight,
                st = $(window).scrollTop(),
                d = $('.dw', dw),
                w,
                t,
                l,
                h,
                ew,
                css = {},
                needScroll,
                elma = s.anchor === undefined ? elm : s.anchor;

            wh = wh ? wh : $(window).height();

            if (s.display == 'modal') {
                countWidth();
                l = (ww - w) / 2;
                t = st + (wh - h) / 2;
            }
            else if (s.display == 'bubble') {
                countWidth();
                var p = elma.offset(),
                    poc = $('.dw-arr', dw),
                    pocw = $('.dw-arrw-i', dw),
                    wd = d.outerWidth();

                // horizontal positioning
                ew = elma.outerWidth();
                l = p.left - (d.outerWidth(true) - ew) / 2;
                l = l > (ww - wd) ? (ww - (wd + 20)) : l;
                l = l >= 0 ? l : 20;

                // vertical positioning
                t = p.top - (d.outerHeight() + 3); // above the input
                if ((t < st) || (p.top > st + wh)) { // if doesn't fit above or the input is out of the screen
                    d.removeClass('dw-bubble-top').addClass('dw-bubble-bottom');
                    t = p.top + elma.outerHeight() + 3; // below the input
                    needScroll = ((t + d.outerHeight(true) > st + wh) || (p.top > st + wh));
                }
                else
                    d.removeClass('dw-bubble-bottom').addClass('dw-bubble-top');

                t = t >= st ? t : st;

                // Calculate Arrow position
                var pl = p.left + ew / 2 - (l + (wd - pocw.outerWidth()) / 2);

                // Limit Arrow position to [0, pocw.width] intervall
                if (pl > pocw.outerWidth())
                    pl = pocw.outerWidth();
                poc.css({ left: pl });
            }
            else {
                css.width = '100%';
                if (s.display == 'top') {
                    t = st;
                }
                else if (s.display == 'bottom') {
                    t = st + wh - d.outerHeight();
                    t = t >= 0 ? t : 0;
                }
            }
            css.top = t;
            css.left = l;
            d.css(css);

            $('.dwo, .dw-persp').height(0).height(getDocHeight());
            if (needScroll)
                $(window).scrollTop(t + d.outerHeight(true) - wh);
        }


        function plus(t) {
            var p = +t.data('pos'),
                val = p + 1;
            calc(t, val > max ? min : val, 1);
        }

        function minus(t) {
            var p = +t.data('pos'),
                val = p - 1;
            calc(t, val < min ? max : val, 2);
        }

        // Public functions

        /**
        * Enables the scroller and the associated input.
        */
        that.enable = function () {
            s.disabled = false;
            if (input)
                elm.prop('disabled', false);
        }

        /**
        * Disables the scroller and the associated input.
        */
        that.disable = function () {
            s.disabled = true;
            if (input)
                elm.prop('disabled', true);
        }

        /**
        * Scrolls target to the specified position
        * @param {Object} t - Target wheel jQuery object.
        * @param {Number} val - Value.
        * @param {Number} [time] - Duration of the animation, optional.
        */
        that.scroll = function (t, val, time, orig, index) {
            var px = (m - val) * s.height;
            t.attr('style', (time ? (prefix + '-transition:all ' + time.toFixed(1) + 's ease-out;') : '') + (has3d ? (prefix + '-transform:translate3d(0,' + px + 'px,0);') : ('top:' + px + 'px;')));

            function getVal(t, b, c, d) {
                return c * Math.sin(t / d * (Math.PI / 2)) + b;
            }

            clearInterval(iv[index]);

            if (time && orig !== undefined) {
                var i = 0;
                iv[index] = setInterval(function () {
                    i += 0.1;
                    t.data('pos', Math.round(getVal(i, orig, val - orig, time)));
                    if (i >= time) {
                        clearInterval(iv[index]);
                        t.data('pos', val).closest('.dwwl').removeClass('dwa');
                    }
                }, 100);
            }
            else
                t.data('pos', val);
        }

        /**
        * Gets the selected wheel values, formats it, and set the value of the scroller instance.
        * If input parameter is true, populates the associated input element.
        * @param {Boolean} [fill] - Also set the value of the associated input element. Default is true.
        * @param {Boolean} [temp] - If true, then only set the temporary value.(only scroll there but not set the value)
        */
        that.setValue = function (sc, fill, time, temp) {
            if (!temp)
                that.values = that.temp.slice(0);
            if (visible && sc) scrollToPos(time);
            if (fill) {
                var v = s.formatResult(that.temp);
                that.val = v;
                if (input)
                    elm.val(v).trigger('change');
            }
        }

        /**
        * Checks if the current selected values are valid together.
        * In case of date presets it checks the number of days in a month.
        * @param {Integer} i - Currently changed wheel index, -1 if initial validation.
        */
        that.validate = function (time, orig, i, dir) {
            scrollToPos(time, orig, i, true, dir);
        }

        /**
        *
        */
        that.change = function (manual) {
            var v = s.formatResult(that.temp);
            if (s.display == 'inline')
                that.setValue(false, manual);
            else
                $('.dwv', dw).html(formatHeader(v));
            if (manual)
                s.onChange.call(e, v, that);
        }

        /**
        * Hides the scroller instance.
        */
        that.hide = function (prevAnim) {
            // If onClose handler returns false, prevent hide
            if (s.onClose.call(e, that.val, that) === false) return false;

            // Re-enable temporary disabled fields
            $('.dwtd').prop('disabled', false).removeClass('dwtd');
            elm.blur();

            // Hide wheels and overlay
            if (dw) {
                if (s.display != 'inline' && s.animate && !prevAnim) {
                    $('.dw', dw).addClass('dw-' + s.animate + ' dw-out');
                    setTimeout(function () {
                        dw.remove();
                        dw = null;
                    }, 350);
                }
                else {
                    dw.remove();
                    dw = null;
                }
                visible = false;
                // Stop positioning on window resize
                $(window).unbind('.dw');
            }
        }

        /**
        * Changes the values of a wheel, and scrolls to the correct position
        * @param {Number} wIndex - index of the wheel
        */
        that.changeWheel = function () {
            if (dw) {
                var i = 0,
                    al = arguments.length;
                for (var j in s.wheels) {
                    for (var k in s.wheels[j]) {
                        if ($.inArray(i,arguments)> -1 ) {
                            warr[i] = s.wheels[j][k];
                            var ul = $('ul', dw).eq(i);
                            ul.html(generateWheelItems(i));
                            if (!--al){
                                position();
                                scrollToPos();
                                return;
                            }
                        }
                        i++;
                    }
                }
            }
        }

        /**
        * Shows the scroller instance.
        */
        that.show = function (prevAnim) {
            if (s.disabled || visible) return false;

            if (s.display == 'top')
                s.animate = 'slidedown';
            if (s.display == 'bottom')
                s.animate = 'slideup';

            // Parse value from input
            read();

            s.onBeforeShow.call(e, dw, that);

            // Create wheels
            var l = 0,
                hi = s.height,
                mAnim = '',
                persPS = '',
                persPE = '';

            if (s.animate && !prevAnim) {
                persPS = '<div class="dw-persp">';
                persPE = '</div>';
                mAnim = 'dw-' + s.animate + ' dw-in';
            }
            // Create wheels containers
            var html = '<div class="' + s.theme + ' dw-' + s.display + '">' + (s.display == 'inline' ? '<div class="dw dwbg dwi"><div class="dwwr">' : persPS + '<div class="dwo"></div><div class="dw dwbg ' + mAnim + '"><div class="dw-arrw"><div class="dw-arrw-i"><div class="dw-arr"></div></div></div><div class="dwwr">' + (s.headerText ? '<div class="dwv"></div>' : ''));

            for (var i = 0; i < s.wheels.length; i++) {
                html += '<div class="dwc' + (s.mode != 'scroller' ? ' dwpm' : ' dwsc') + (s.showLabel ? '' : ' dwhl') + '"><div class="dwwc dwrc"><table cellpadding="0" cellspacing="0"><tr>';
                // Create wheels
                for (var label in s.wheels[i]) {
                    warr[l] = s.wheels[i][label];
                    html += '<td><div class="dwwl dwrc dwwl' + l + '">' + (s.mode != 'scroller' ? '<div class="dwwb dwwbp" style="height:' + hi + 'px;line-height:' + hi + 'px;"><span>+</span></div><div class="dwwb dwwbm" style="height:' + hi + 'px;line-height:' + hi + 'px;"><span>&ndash;</span></div>' : '') + '<div class="dwl">' + label + '</div><div class="dww dwrc" style="height:' + (s.rows * hi) + 'px;min-width:' + s.width + 'px;"><ul>';
                    // Create wheel values
                    html += generateWheelItems(l);
                    html += '</ul><div class="dwwo"></div></div><div class="dwwol"></div></div></td>';
                    l++;
                }
                html += '</tr></table></div></div>';
            }
            html += (s.display != 'inline' ? '<div class="dwbc' + (s.button3 ? ' dwbc-p' : '') + '"><span class="dwbw dwb-s"><span class="dwb">' + s.setText + '</span></span>' + (s.button3 ? '<span class="dwbw dwb-n"><span class="dwb">' + s.button3Text + '</span></span>' : '') + '<span class="dwbw dwb-c"><span class="dwb">' + s.cancelText + '</span></span></div>' + persPE : '<div class="dwcc"></div>') + '</div></div></div>';
            dw = $(html);

            scrollToPos();

            // Show
            s.display != 'inline' ? dw.appendTo('body') : elm.is('div') ? elm.html(dw) : dw.insertAfter(elm);
            visible = true;


            if (s.display != 'inline') {
                // Init buttons
                $('.dwb-s span', dw).click(function () {
                    that.hide();
                    that.setValue(false, true);
                    s.onSelect.call(e, that.val, that);
                    return false;
                });

                $('.dwb-c span', dw).click(function () {
                    that.hide();
                    s.onCancel.call(e, that.val, that);
                    return false;
                });

                if (s.button3)
                    $('.dwb-n span', dw).click(s.button3);

                // prevent scrolling if not specified otherwise
                if (s.scrollLock)
                    dw.bind('touchmove', function (e) {
                        e.preventDefault();
                    });

                // Disable inputs to prevent bleed through (Android bug)
                $('input,select').each(function () {
                    if (!$(this).prop('disabled'))
                        $(this).addClass('dwtd');
                });
                $('input,select').prop('disabled', true);

                // Set position
                position();
                $(window).bind('resize.dw', position);
            }

            // Events
            dw.delegate('.dwwl', 'DOMMouseScroll mousewheel', function (e) {
                if (!isReadOnly(this)) {
                    e.preventDefault();
                    e = e.originalEvent;
                    var delta = e.wheelDelta ? (e.wheelDelta / 120) : (e.detail ? (-e.detail / 3) : 0),
                        t = $('ul', this),
                        p = +t.data('pos'),
                        val = Math.round(p - delta);
                    setGlobals(t);
                    calc(t, val, delta < 0 ? 1 : 2);
                }
            }).delegate('.dwb, .dwwb', START_EVENT, function (e) {
                // Active button
                $(this).addClass('dwb-a');
            }).delegate('.dwwb', START_EVENT, function (e) {
                var w = $(this).closest('.dwwl');
                if (!isReadOnly(w) && !w.hasClass('dwa')) {
                    // + Button
                    e.preventDefault();
                    e.stopPropagation();
                    var t = w.find('ul'),
                        func = $(this).hasClass('dwwbp') ? plus : minus;
                    click = true;
                    setGlobals(t);
                    clearInterval(timer);
                    timer = setInterval(function () { func(t); }, s.delay);
                    func(t);
                }
            }).delegate('.dwwl', START_EVENT, function (e) {
                // Prevent scroll
                e.preventDefault();
                // Scroll start
                if (!isReadOnly(this) && !click && s.mode != 'clickpick') {
                    move = true;
                    target = $('ul', this);
                    target.closest('.dwwl').addClass('dwa');
                    pos = +target.data('pos');
                    setGlobals(target);
                    clearInterval(iv[index]);
                    start = getY(e);
                    startTime = new Date();
                    stop = start;
                    that.scroll(target, pos);
                }
            })

            s.onShow.call(e, dw, that);

            // Theme init
            theme.init(dw, that);
        }

        /**
        * Scroller initialization.
        */
        that.init = function (ss) {
            // Get theme defaults
            theme = $.extend({ defaults: {}, init: empty }, $.scroller.themes[ss.theme ? ss.theme : s.theme]);

            // Get language defaults
            lang = $.scroller.i18n[ss.lang ? ss.lang : s.lang];

            $.extend(s, theme.defaults, lang, settings, ss);

            that.settings = s;

            m = Math.floor(s.rows / 2);

            var preset = $.scroller.presets[s.preset];

            elm.unbind('.dw');

            if (preset) {
                var p = preset.call(e, that);
                $.extend(s, p, settings, ss);
                // Extend core methods
                $.extend(methods, p.methods);
            }

            if (elm.data('dwro') !== undefined)
                e.readOnly = bool(elm.data('dwro'));

            if (visible)
                that.hide();

            if (s.display == 'inline') {
                that.show();
            }
            else {
                read();
                if (input && s.showOnFocus) {
                    // Set element readonly, save original state
                    elm.data('dwro', e.readOnly);
                    e.readOnly = true;
                    // Init show datewheel
                    elm.bind('focus.dw', function () { that.show(); });
                }
            }
        }

        that.values = null;
        that.val = null;
        that.temp = null;

        that.init(settings);
    }

    function testProps(props) {
        for (var i in props)
            if (mod[props[i]] !== undefined)
                return true;
        return false;
    }

    function testPrefix() {
        var prefixes = ['Webkit', 'Moz', 'O', 'ms'];
        for (var p in prefixes) {
            if (testProps([prefixes[p] + 'Transform']))
                return '-' + prefixes[p].toLowerCase();
        }
        return '';
    }

    function getInst(e) {
        return scrollers[e.id];
    }

    function getY(e) {
        return e.changedTouches || (e.originalEvent && e.originalEvent.changedTouches) ? (e.originalEvent ? e.originalEvent.changedTouches[0].pageY : e.changedTouches[0].pageY) : e.pageY;

    }

    function bool(v) {
        return (v === true || v == 'true');
    }

    function calc(t, val, dir, anim, orig) {
        val = val > max ? max : val;
        val = val < min ? min : val;

        var cell = $('li', t).eq(val);

        // Set selected scroller value
        inst.temp[index] = cell.attr('data-val');

        // Validate
        inst.validate(anim ? (val == orig ? 0.1 : Math.abs((val - orig) * 0.1)) : 0, orig, index, dir);
    }

    var scrollers = {},
        timer,
        empty = function () { },
        h,
        min,
        max,
        inst, // Current instance
        date = new Date(),
        uuid = date.getTime(),
        move,
        click,
        target,
        index,
        start,
        stop,
        startTime,
        endTime,
        pos,
        mod = document.createElement('modernizr').style,
        has3d = testProps(['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']) && 'webkitPerspective' in document.documentElement.style,
        prefix = testPrefix(),
        START_EVENT = 'touchstart mousedown',
        MOVE_EVENT = 'touchmove mousemove',
        END_EVENT = 'touchend mouseup',
        defaults = {
            // Options
            width: 50,
            height: 40,
            rows: 3,
            delay: 300,
            disabled: false,
            readonly: false,
            showOnFocus: true,
            showLabel: true,
            wheels: [],
            theme: '',
            headerText: '{value}',
            display: 'inline',
            mode: 'mix',
            preset: 'date',
            lang: 'en-US',
            setText: '确定',
            cancelText: '取消',
            scrollLock: true,
            // Events
            onBeforeShow: empty,
            onShow: empty,
            onClose: empty,
            onSelect: empty,
            onCancel: empty,
            onChange: empty,
            formatResult: function (d) {
                var out = '';
                for (var i = 0; i < d.length; i++) {
                    out += (i > 0 ? ' ' : '') + d[i];
                }
                return out;
            },
            parseValue: function (val, inst) {
                var w = inst.settings.wheels,
                    val = val.split(' '),
                    ret = [],
                    j = 0;
                for (var i = 0; i < w.length; i++) {
                    for (var l in w[i]) {
                        if (w[i][l][val[j]] !== undefined)
                            ret.push(val[j])
                        else
                        // Select first value from wheel
                            for (var v in w[i][l]) {
                                ret.push(v);
                                break;
                            }
                        j++;
                    }
                }
                return ret;
            },
            validate: empty
        },

        methods = {
            init: function (options) {
                if (options === undefined) options = {};
                return this.each(function () {
                    if (!this.id) {
                        uuid += 1;
                        this.id = 'scoller' + uuid;
                    }
                    scrollers[this.id] = new Scroller(this, options);
                });
            },
            enable: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) inst.enable();
                });
            },
            disable: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) inst.disable();
                });
            },
            isDisabled: function () {
                var inst = getInst(this[0]);
                if (inst)
                    return inst.settings.disabled;
            },
            option: function (option, value) {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        var obj = {};
                        if (typeof option === 'object')
                            obj = option;
                        else
                            obj[option] = value;
                        inst.init(obj);
                    }
                });
            },
            setValue: function (d, fill, time, temp) {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.temp = d;
                        inst.setValue(true, fill, time, temp);
                    }
                });
            },
            getInst: function () {
                return getInst(this[0]);
            },
            getValue: function () {
                var inst = getInst(this[0]);
                if (inst)
                    return inst.values;
            },
            show: function () {
                var inst = getInst(this[0]);
                if (inst)
                    return inst.show();
            },
            hide: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst)
                        inst.hide();
                });
            },
            destroy: function () {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.hide();
                        $(this).unbind('.dw');
                        delete scrollers[this.id];
                        if ($(this).is('input'))
                            this.readOnly = bool($(this).data('dwro'));
                    }
                });
            }
        };

    $(document).bind(MOVE_EVENT, function (e) {
        if (move) {
            e.preventDefault();
            stop = getY(e);
            var val = pos + (start - stop) / h;
            val = val > (max + 1) ? (max + 1) : val;
            val = val < (min - 1) ? (min - 1) : val;
            inst.scroll(target, val);
        }
    });

    $(document).bind(END_EVENT, function (e) {
        if (move) {
            e.preventDefault();
            var time = new Date() - startTime,
                val = pos + (start - stop) / h;
            val = val > (max + 1) ? (max + 1) : val;
            val = val < (min - 1) ? (min - 1) : val;

            if (time < 300) {
                var speed = (stop - start) / time;
                var dist = (speed * speed) / (2 * 0.0006);
                if (stop - start < 0) dist = -dist;
            }
            else {
                var dist = stop - start;
            }
            calc(target, Math.round(pos - dist / h), 0, true, Math.round(val));
            move = false;
            target = null;
        }
        if (click) {
            clearInterval(timer);
            click = false;
        }
        $('.dwb-a').removeClass('dwb-a');
    });

    $.fn.scroller = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Unknown method');
        }
    }

    $.scroller = {
        /**
        * Set settings for all instances.
        * @param {Object} o - New default settings.
        */
        setDefaults: function (o) {
            $.extend(defaults, o);
        },
        presets: {},
        themes: {},
        i18n: {}
    };

})(jQuery);
(function ($) {

    var date = new Date(),
        defaults = {
            dateFormat: 'yy-mm-dd',
            dateOrder: 'yymmdd',
            timeWheels: 'HHii',
            timeFormat: 'HH:ii:ss',
            startYear: date.getFullYear() - 70,
            endYear: date.getFullYear() + 5,
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            dayNames: ['周日', '周一;', '周二;', '周三', '周四', '周五', '周六'],
            dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
            shortYearCutoff: '+10',
            monthText: '月',
            dayText: '日',
            yearText: '年',
            hourText: '小时',
            minuteText: '分',
            secText: '秒',
            ampmText: '&nbsp;',
            nowText: '当前',
            showNow: false,
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1,
            separator: ' '
        },
        preset = function (inst) {
            var that = $(this),
                html5def = {},
                format;
            // Force format for html5 date inputs (experimental)
            if (that.is('input')) {
                switch (that.attr('type')) {
                    case 'date':
                        format = 'yy-mm-dd';
                        break;
                    case 'datetime':
                        format = 'yy-mm-dd HH:ii:ss';
                        break;
                    case 'datetime-local':
                        format = 'yy-mm-dd HH:ii:ss';
                        break;
                    case 'month':
                        format = 'yy-mm';
                        html5def.dateOrder = 'mmyy';
                        break;
                    case 'time':
                        format = 'HH:ii:ss';
                        break;
                }
                // Check for min/max attributes
                var min = that.attr('min'),
                    max = that.attr('max');
                if (min)
                    html5def.minDate = $.scroller.parseDate(format, min);
                if (max)
                    html5def.maxDate = $.scroller.parseDate(format, max);
            }

            // Set year-month-day order
            var s = $.extend({}, defaults, html5def, inst.settings),
                offset = 0,
                wheels = [],
                ord = [],
                o = {},
                f = { y: 'getFullYear', m: 'getMonth', d: 'getDate', h: getHour, i: getMinute, s: getSecond, ap: getAmPm },
                p = s.preset,
                dord = s.dateOrder,
                tord = s.timeWheels,
                regen = dord.match(/D/),
                ampm = tord.match(/a/i),
                hampm = tord.match(/h/),
                hformat = p == 'datetime' ? s.dateFormat + s.separator + s.timeFormat : p == 'time' ? s.timeFormat : s.dateFormat,
                defd = new Date(),
                stepH = s.stepHour,
                stepM = s.stepMinute,
                stepS = s.stepSecond,
                mind = s.minDate ? s.minDate : new Date(s.startYear, 0, 1),
                maxd = s.maxDate ? s.maxDate : new Date(s.endYear, 11, 31, 23, 59, 59);

            format = format ? format : hformat;

            if (p.match(/date/i)) {

                // Determine the order of year, month, day wheels
                $.each(['y', 'm', 'd'], function (i, v) {
                    var i = dord.search(new RegExp(v, 'i'));
                    if (i > -1)
                        ord.push({ o: i, v: v });
                });
                ord.sort(function (a, b) { return a.o > b.o ? 1 : -1; });
                $.each(ord, function (i, v) {
                    o[v.v] = i;
                });

                var w = {};
                for (var k = 0; k < 3; k++) {
                    if (k == o.y) {
                        offset++;
                        w[s.yearText] = {};
                        var start = mind.getFullYear(),
                            end = maxd.getFullYear();
                        for (var i = start; i <= end; i++)
                            w[s.yearText][i] = dord.match(/yy/i) ? i : (i + '').substr(2, 2);
                    }
                    else if (k == o.m) {
                        offset++;
                        w[s.monthText] = {};
                        for (var i = 0; i < 12; i++)
                            w[s.monthText][i] =
                                dord.match(/MM/) ? s.monthNames[i] :
                                dord.match(/M/) ? s.monthNamesShort[i] :
                                dord.match(/mm/) && i < 9 ? '0' + (i + 1) : i + 1;
                    }
                    else if (k == o.d) {
                        offset++;
                        w[s.dayText] = {};
                        for (var i = 1; i < 32; i++)
                            w[s.dayText][i] = dord.match(/dd/i) && i < 10 ? '0' + i : i;
                    }
                }
                wheels.push(w);
            }

            if (p.match(/time/i)) {

                // Determine the order of hours, minutes, seconds wheels
                ord = [];
                $.each(['h', 'i', 's'], function (i, v) {
                    var i = tord.search(new RegExp(v, 'i'));
                    if (i > -1)
                        ord.push({ o: i, v: v });
                });
                ord.sort(function (a, b) {
                    return a.o > b.o ? 1 : -1;
                });
                $.each(ord, function (i, v) {
                    o[v.v] = offset + i;
                });

                var w = {};
                for (var k = offset; k < offset + 3; k++) {
                    if (k == o.h) {
                        offset++;
                        w[s.hourText] = {};
                        for (var i = 0; i < (hampm ? 12 : 24); i += stepH)
                            w[s.hourText][i] = hampm && i == 0 ? 12 : tord.match(/hh/i) && i < 10 ? '0' + i : i;
                    }
                    else if (k == o.i) {
                        offset++;
                        w[s.minuteText] = {};
                        for (var i = 0; i < 60; i += stepM)
                            w[s.minuteText][i] = tord.match(/ii/) && i < 10 ? '0' + i : i;
                    }
                    else if (k == o.s) {
                        offset++;
                        w[s.secText] = {};
                        for (var i = 0; i < 60; i += stepS)
                            w[s.secText][i] = tord.match(/ss/) && i < 10 ? '0' + i : i;
                    }
                }

                if (ampm) {
                    o.ap = offset++; // ampm wheel order
                    var upper = tord.match(/A/);
                    w[s.ampmText] = { 0: upper ? 'AM' : 'am', 1: upper ? 'PM' : 'pm' };
                }
                wheels.push(w);
            }

            function get(d, i, def) {
                if (o[i] !== undefined)
                    return +d[o[i]];
                if (def !== undefined)
                    return def;
                return defd[f[i]] ? defd[f[i]]() : f[i](defd);
            }

            function step(v, step) {
                return Math.floor(v / step) * step;
            }

            function getHour(d) {
                var hour = d.getHours();
                hour = hampm && hour >= 12 ? hour - 12 : hour;
                return step(hour, stepH);
            }

            function getMinute(d) {
                return step(d.getMinutes(), stepM);
            }

            function getSecond(d) {
                return step(d.getSeconds(), stepS);
            }

            function getAmPm(d) {
                return ampm && d.getHours() > 11 ? 1 : 0;
            }

            function getDate(d) {
                var hour = get(d, 'h', 0);
                return new Date(get(d, 'y'), get(d, 'm'), get(d, 'd', 1), get(d, 'ap') ? hour + 12 : hour, get(d, 'i', 0), get(d, 's', 0));
            }

            inst.setDate = function (d, fill, time, temp) {
                // Set wheels
                for (var i in o)
                    this.temp[o[i]] = d[f[i]] ? d[f[i]]() : f[i](d);
                this.setValue(true, fill, time, temp);
            }

            inst.getDate = function (d) {
                return getDate(d);
            }

            return {
                button3Text: s.showNow ? s.nowText : undefined,
                button3: s.showNow ? function () { inst.setDate(new Date(), false, 0.3, true); } : undefined,
                wheels: wheels,
                headerText: function (v) {
                    return $.scroller.formatDate(hformat, getDate(inst.temp), s);
                },
                /**
                * Builds a date object from the wheel selections and formats it to the given date/time format
                * @param {Array} d - An array containing the selected wheel values
                * @return {String} - The formatted date string
                */
                formatResult: function (d) {
                    return $.scroller.formatDate(format, getDate(d), s);
                },
                /**
                * Builds a date object from the input value and returns an array to set wheel values
                * @return {Array} - An array containing the wheel values to set
                */
                parseValue: function (val) {
                    var d = new Date(),
                        result = [];
                    try {
                        d = $.scroller.parseDate(format, val, s);
                    }
                    catch (e) {
                    }
                    // Set wheels
                    for (var i in o)
                        result[o[i]] = d[f[i]] ? d[f[i]]() : f[i](d);
                    return result;
                },
                /**
                * Validates the selected date to be in the minDate / maxDate range and sets unselectable values to disabled
                * @param {Object} dw - jQuery object containing the generated html
                * @param {Integer} [i] - Index of the changed wheel, not set for initial validation
                */
                validate: function (dw, i) {
                    var temp = inst.temp, //.slice(0),
                        mins = { y: mind.getFullYear(), m: 0, d: 1, h: 0, i: 0, s: 0, ap: 0 },
                        maxs = { y: maxd.getFullYear(), m: 11, d: 31, h: step(hampm ? 11 : 23, stepH), i: step(59, stepM), s: step(59, stepS), ap: 1 },
                    //w = (mind || maxd) ? ['y', 'm', 'd', 'ap', 'h', 'i', 's'] : ((i == o.y || i == o.m || i === undefined) ? ['d'] : []), // Validate day only, if no min/max date set
                        minprop = true,
                        maxprop = true;
                    $.each(['y', 'm', 'd', 'ap', 'h', 'i', 's'], function (x, i) {
                        if (o[i] !== undefined) {
                            var min = mins[i],
                                max = maxs[i],
                                maxdays = 31,
                                val = get(temp, i),
                                t = $('ul', dw).eq(o[i]),
                                y, m;
                            if (i == 'd') {
                                y = get(temp, 'y'),
                                m = get(temp, 'm');
                                maxdays = 32 - new Date(y, m, 32).getDate();
                                max = maxdays;
                                if (regen)
                                    $('li', t).each(function () {
                                        var that = $(this),
                                            d = that.data('val'),
                                            w = new Date(y, m, d).getDay(),
                                            str = dord.replace(/[my]/gi, '').replace(/dd/, d < 10 ? '0' + d : d).replace(/d/, d);
                                        that.html(str.match(/DD/) ? str.replace(/DD/, s.dayNames[w]) : str.replace(/D/, s.dayNamesShort[w]) );
                                    });
                            }
                            if (minprop && mind) {
                                min = mind[f[i]] ? mind[f[i]]() : f[i](mind);
                            }
                            if (maxprop && maxd) {
                                max = maxd[f[i]] ? maxd[f[i]]() : f[i](maxd);
                            }
                            if (i != 'y') {
                                var i1 = $('li[data-val="' + min + '"]', t).index(),
                                    i2 = $('li[data-val="' + max + '"]', t).index();
                                $('li', t).removeClass('dw-v').slice(i1, i2 + 1).addClass('dw-v');
                                if (i == 'd') { // Hide days not in month
                                    $('li', t).removeClass('dw-h').slice(maxdays).addClass('dw-h');
                                }
                            }
                            if (val < min)
                                val = min;
                            if (val > max)
                                val = max;
                            if (minprop)
                                minprop = val == min;
                            if (maxprop)
                                maxprop = val == max;
                            // Disable some days
                            if (s.invalid && i == 'd') {
                                var idx = [];
                                // Disable exact dates
                                if (s.invalid.dates)
                                    $.each(s.invalid.dates, function (i, v) {
                                        if (v.getFullYear() == y && v.getMonth() == m) {
                                            idx.push(v.getDate() - 1);
                                        }
                                    });
                                // Disable days of week
                                if (s.invalid.daysOfWeek) {
                                    var first = new Date(y, m, 1).getDay();
                                    $.each(s.invalid.daysOfWeek, function (i, v) {
                                        for (var j = v - first; j < maxdays; j += 7)
                                            if (j >= 0)
                                                idx.push(j);
                                    });
                                }
                                // Disable days of month
                                if (s.invalid.daysOfMonth)
                                    $.each(s.invalid.daysOfMonth, function (i, v) {
                                        v = (v + '').split('/');
                                        if (v[1]) {
                                            if (v[0] - 1 == m)
                                                idx.push(v[1] - 1);
                                        }
                                        else
                                            idx.push(v[0] - 1);
                                    });
                                $.each(idx, function (i, v) {
                                    $('li', t).eq(v).removeClass('dw-v');
                                });
                            }

                            // Set modified value
                            temp[o[i]] = val;
                        }
                    });
                },
                methods: {
                    /**
                    * Returns the currently selected date.
                    * @param {Boolean} temp - If true, return the currently shown date on the picker, otherwise the last selected one
                    * @return {Date}
                    */
                    getDate: function (temp) {
                        var inst = $(this).scroller('getInst');
                        if (inst)
                            return inst.getDate(temp ? inst.temp : inst.values);
                    },
                    /**
                    * Sets the selected date
                    * @param {Date} d - Date to select.
                    * @param {Boolean} [fill] - Also set the value of the associated input element. Default is true.
                    * @return {Object} - jQuery object to maintain chainability
                    */
                    setDate: function (d, fill, time, temp) {
                        if (fill == undefined) fill = false;
                        return this.each(function () {
                            var inst = $(this).scroller('getInst');
                            if (inst)
                                inst.setDate(d, fill, time, temp);
                        });
                    }
                }
            }
        };

    $.scroller.presets.date = preset;
    $.scroller.presets.datetime = preset;
    $.scroller.presets.time = preset;

    /**
    * Format a date into a string value with a specified format.
    * @param {String} format - Output format.
    * @param {Date} date - Date to format.
    * @param {Object} settings - Settings.
    * @return {String} - Returns the formatted date string.
    */
    $.scroller.formatDate = function (format, date, settings) {
        if (!date) return null;
        var s = $.extend({}, defaults, settings),
        // Check whether a format character is doubled
            look = function (m) {
                var n = 0;
                while (i + 1 < format.length && format.charAt(i + 1) == m) { n++; i++; };
                return n;
            },
        // Format a number, with leading zero if necessary
            f1 = function (m, val, len) {
                var n = '' + val;
                if (look(m))
                    while (n.length < len)
                        n = '0' + n;
                return n;
            },
        // Format a name, short or long as requested
            f2 = function (m, val, s, l) {
                return (look(m) ? l[val] : s[val]);
            },
            output = '',
            literal = false;
        for (var i = 0; i < format.length; i++) {
            if (literal)
                if (format.charAt(i) == "'" && !look("'"))
                    literal = false;
                else
                    output += format.charAt(i);
            else
                switch (format.charAt(i)) {
                case 'd':
                    output += f1('d', date.getDate(), 2);
                    break;
                case 'D':
                    output += f2('D', date.getDay(), s.dayNamesShort, s.dayNames);
                    break;
                case 'o':
                    output += f1('o', (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000, 3);
                    break;
                case 'm':
                    output += f1('m', date.getMonth() + 1, 2);
                    break;
                case 'M':
                    output += f2('M', date.getMonth(), s.monthNamesShort, s.monthNames);
                    break;
                case 'y':
                    output += (look('y') ? date.getFullYear() : (date.getYear() % 100 < 10 ? '0' : '') + date.getYear() % 100);
                    break;
                case 'h':
                    var h = date.getHours();
                    output += f1('h', (h > 12 ? (h - 12) : (h == 0 ? 12 : h)), 2);
                    break;
                case 'H':
                    output += f1('H', date.getHours(), 2);
                    break;
                case 'i':
                    output += f1('i', date.getMinutes(), 2);
                    break;
                case 's':
                    output += f1('s', date.getSeconds(), 2);
                    break;
                case 'a':
                    output += date.getHours() > 11 ? 'pm' : 'am';
                    break;
                case 'A':
                    output += date.getHours() > 11 ? 'PM' : 'AM';
                    break;
                case "'":
                    if (look("'"))
                        output += "'";
                    else
                        literal = true;
                    break;
                default:
                    output += format.charAt(i);
            }
        }
        return output;
    }

    /**
    * Extract a date from a string value with a specified format.
    * @param {String} format - Input format.
    * @param {String} value - String to parse.
    * @param {Object} settings - Settings.
    * @return {Date} - Returns the extracted date.
    */
    $.scroller.parseDate = function (format, value, settings) {
        var def = new Date();
        if (!format || !value) return def;
        value = (typeof value == 'object' ? value.toString() : value + '');

        var s = $.extend({}, defaults, settings),
            shortYearCutoff = s.shortYearCutoff,
            year = def.getFullYear(),
            month = def.getMonth() + 1,
            day = def.getDate(),
            doy = -1,
            hours = def.getHours(),
            minutes = def.getMinutes(),
            seconds = 0, //def.getSeconds(),
            ampm = -1,
            literal = false,
        // Check whether a format character is doubled
            lookAhead = function (match) {
                var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
                if (matches)
                    iFormat++;
                return matches;
            },
        // Extract a number from the string value
            getNumber = function (match) {
                lookAhead(match);
                var size = (match == '@' ? 14 : (match == '!' ? 20 :
                    (match == 'y' ? 4 : (match == 'o' ? 3 : 2))));
                var digits = new RegExp('^\\d{1,' + size + '}');
                var num = value.substr(iValue).match(digits);
                if (!num)
                    return 0;
                //throw 'Missing number at position ' + iValue;
                iValue += num[0].length;
                return parseInt(num[0], 10);
            },
        // Extract a name from the string value and convert to an index
            getName = function (match, s, l) {
                var names = (lookAhead(match) ? l : s);
                for (var i = 0; i < names.length; i++) {
                    if (value.substr(iValue, names[i].length).toLowerCase() == names[i].toLowerCase()) {
                        iValue += names[i].length;
                        return i + 1;
                    }
                }
                return 0;
                //throw 'Unknown name at position ' + iValue;
            },
        // Confirm that a literal character matches the string value
            checkLiteral = function () {
                //if (value.charAt(iValue) != format.charAt(iFormat))
                //throw 'Unexpected literal at position ' + iValue;
                iValue++;
            },
            iValue = 0;

        for (var iFormat = 0; iFormat < format.length; iFormat++) {
            if (literal)
                if (format.charAt(iFormat) == "'" && !lookAhead("'"))
                    literal = false;
                else
                    checkLiteral();
            else
                switch (format.charAt(iFormat)) {
                case 'd':
                    day = getNumber('d');
                    break;
                case 'D':
                    getName('D', s.dayNamesShort, s.dayNames);
                    break;
                case 'o':
                    doy = getNumber('o');
                    break;
                case 'm':
                    month = getNumber('m');
                    break;
                case 'M':
                    month = getName('M', s.monthNamesShort, s.monthNames);
                    break;
                case 'y':
                    year = getNumber('y');
                    break;
                case 'H':
                    hours = getNumber('H');
                    break;
                case 'h':
                    hours = getNumber('h');
                    break;
                case 'i':
                    minutes = getNumber('i');
                    break;
                case 's':
                    seconds = getNumber('s');
                    break;
                case 'a':
                    ampm = getName('a', ['am', 'pm'], ['am', 'pm']) - 1;
                    break;
                case 'A':
                    ampm = getName('A', ['am', 'pm'], ['am', 'pm']) - 1;
                    break;
                case "'":
                    if (lookAhead("'"))
                        checkLiteral();
                    else
                        literal = true;
                    break;
                default:
                    checkLiteral();
            }
        }
        if (year < 100)
            year += new Date().getFullYear() - new Date().getFullYear() % 100 +
                (year <= (typeof shortYearCutoff != 'string' ? shortYearCutoff : new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10)) ? 0 : -100);
        if (doy > -1) {
            month = 1;
            day = doy;
            do {
                var dim = 32 - new Date(year, month - 1, 32).getDate();
                if (day <= dim)
                    break;
                month++;
                day -= dim;
            } while (true);
        }
        hours = (ampm == -1) ? hours : ((ampm && hours < 12) ? (hours + 12) : (!ampm && hours == 12 ? 0 : hours));
        var date = new Date(year, month - 1, day, hours, minutes, seconds);
        if (date.getFullYear() != year || date.getMonth() + 1 != month || date.getDate() != day)
            throw 'Invalid date';
        return date;
    }

})(jQuery);
