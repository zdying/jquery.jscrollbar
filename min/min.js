(function (e) {
    function n(a, b, c, h) {
        var f = this.$con.clone().appendTo("body").width(b).height(c), l = this.opt.showXBar && this.$con[0].scrollWidth > b, m = this.opt.showYBar && this.$con[0].scrollHeight > c, k = 0, k = "", d = "outer" === this.opt.position ? h : 0;
        l && m ? k = "xy" : l ? (k = f.css({height: c - d, zIndex: -1})[0].scrollHeight, k = "x" + (this.opt.showXBar && k > c - d ? "y" : "")) : m && (k = f.css({width: b - d, zIndex: -1})[0].scrollWidth, k = (this.opt.showXBar && k > b - d ? "x" : "") + "y");
        this.scrollWidth = f[0].scrollWidth;
        this.scrollHeight = f[0].scrollHeight;
        f.remove();
        this.bars = k;
        f = this.delta = (this.bars.length - 1) * h;
        l = this.thumbSize = {x: p.call(this, "x"), y: p.call(this, "y")};
        this.maxPos = {x: b - l.x - f, y: c - l.y - f};
        this.maxSPos = {x: this.scrollWidth - b + f, y: this.scrollHeight - c + f};
        b = this.bars.split("");
        m = 0;
        for (d = b.length; m < d; m++)c = g[l = b[m]], f = g["xy".replace(l, "")].s, e("<div></div>").addClass(l).data("thumbType", l).css(f, h).append(e(q)[c.s](this.thumbSize[l]).data("type", l)).insertAfter(this.$con.css(f, "-=" + ("outer" === this.opt.position ? h : 0)));
        "inner" === this.opt.position && a.find(".x,.y").css("background", "transparent")
    }

    function p(a) {
        a = g[a];
        return Math.max(20, Math.pow(this.$con[a.s]() - this.delta, 2) / this.$con[0][a.ss])
    }

    function r() {
        var a = this;
        this.$node.on("mousedown", ".thumb",function (b) {
            s.call(a, b, b.target);
            return!1
        }).on("click", ".x,.y", function (b) {
            var c = 0, c = b.target, h = e.data(c, "thumbType"), f = g[h];
            c === this && (c = b["page" + h.toUpperCase()] - e(c).offset()[f.p], a.scrollTo(h, c / a.maxPos[h] * a.maxSPos[h]))
        });
        e(document).unbind("mouseup.jsb").bind("mouseup.jsb", function () {
            e(this).unbind("mousemove.jsb")
        });
        t.call(this);
        "inner" === this.opt.position && u.call(this)
    }

    function u() {
        var a = this.$con;
        a.hover(function () {
            a.find(".x,.y").stop().animate({opacity: 1}, 200)
        },function () {
            a.find(".x,.y").stop().animate({opacity: 0}, 500)
        }).mouseout()
    }

    function t() {
        var a = this.node, b = this, c = null;
        this.opt.mouseEvent && (c = function (a) {
            a = a || window.event;
            b.scrollBy(2 === b.bars.length ? "y" : b.bars, -(a.wheelDelta ? a.wheelDelta / 120 : -a.detail / 3) * b.opt.mouseSpeed);
            e.event.fix(a).preventDefault()
        }, a.addEventListener ? (a.addEventListener("mousewheel", c), a.addEventListener("DOMMouseScroll", c)) : a.onmousewheel = c)
    }

    function s(a, b) {
        var c = {X: a.pageX, Y: a.pageY}, h = this, f = {X: parseInt(e(b).css("left")) || 0, Y: parseInt(e(b).css("top")) || 0};
        e(document).bind("mousemove.jsb", function (a) {
            var d = e.data(b, "type"), k = d.toUpperCase(), n = g[d].p;
            a = Math.min(Math.max(0, f[k] + (a["page" + k] - c[k])), h.maxPos[d]);
            e(b).css(n, a);
            h.scroll(d)
        })
    }

    function d(a, b) {
        this.node = a[0];
        this.$node = a;
        this.width = a.width();
        this.height = a.height();
        this.opt = b;
        this.plugID = "jsb_" + Math.floor(9E3 * Math.random() + 1E3);
        var c = this.width, d = this.height, f = b.width;
        this.$node.css("overflow", "hidden").addClass("jscrollbar").wrapInner(v.attr("id", this.plugID).css({width: c, height: d}));
        this.$con = e("#" + this.plugID);
        n.call(this, this.$node, c, d, f);
        r.call(this)
    }

    var v = e('<div class="jscrollbar" style="overflow: hidden"></div>'), q = '<div class="thumb"></div>', g = {x: {s: "width", p: "left", sp: "scrollLeft", ss: "scrollWidth"}, y: {s: "height", p: "top", sp: "scrollTop", ss: "scrollHeight"}};
    d.fn = d.prototype;
    d.fn.update = function (a) {
        var b = this.$node, c = this.width = b.width(), d = this.height = b.height(), f = this.opt.width, e = this.getScrollPos("x"), g = this.getScrollPos("y");
        this.$node.find(".x,.y").remove();
        this.$con.css({width: c, height: d});
        n.call(this, b, c, d, f);
        switch (a) {
            case "relative":
                e && this.scrollTo("x", e);
                g && this.scrollTo("y", g);
                break;
            case "bottom":
                this.scrollTo("y", this.maxSPos.y);
                break;
            case "right":
                this.scrollTo("x", this.maxSPos.x);
                break;
            default:
                this.scroll()
        }
        this.scroll()
    };
    d.fn.getThumbLocation = function (a) {
        return parseFloat(this.$node.find("." + a + " .thumb").css(g[a].p)) || 0
    };
    d.fn.getScrollPos = function (a) {
        return this.$con[0][g[a].sp]
    };
    d.fn.scroll = function (a) {
        void 0 === a && (a = "x", this.scroll("y"));
        this.$con[0][g[a].sp] = this.getThumbLocation(a) / this.maxPos[a] * this.maxSPos[a]
    };
    d.fn.scrollBy = function (a, b) {
        this.scrollTo(a, this.$con[0][g[a].sp] + b)
    };
    d.fn.scrollTo = function (a, b) {
        b = Math.max(Math.min(this.maxSPos[a], b), 0);
        this.$con[0][g[a].sp] = b;
        this.$node.trigger("scroll", [a, b]);
        var c = g[a], d = this.maxPos[a] * (b || this.$con[0][c.sp]) / this.maxSPos[a];
        this.$node.find("." + a + " .thumb").css(c.p, d)
    };
    e.fn.jscrollbar = function (a) {
        if ("string" === typeof a) {
            var b = this.data("jsb_data");
            b.scrollTo([].slice.call(arguments, 1));
            return b ? b[a].apply(b, [].slice.call(arguments, 1)) : this
        }
        a = e.extend({}, {width: 8, position: "inner", showXBar: !0, showYBar: !0, mouseEvent: !0, mouseSpeed: 30}, a);
        return this.each(function () {
            e.data(this, "jsb_data") || e.data(this, "jsb_data", new d(e(this), a))
        })
    };
    e.fn.jscrollbar.version = "2.0.0"
})(jQuery);