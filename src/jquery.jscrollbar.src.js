/**
 * @fileOverview
 * @author daiying.zhang
 */

/**
 * jquery.jscrollbar
 * v2.0.0
 * http://imf2e.com
 */

;(function($, fn, pluginName){

    var DATA_NAME = 'jsb_data',
        BAR_WRAPPER_NODE = $('<div class="jscrollbar" style="overflow: hidden"></div>'),
        THUMB_NODE = '<div class="thumb"></div>',
        MAPPING = {
            x : {s  : 'width', p  : 'left', sp : 'scrollLeft', ss : 'scrollWidth'},
            y : {s  : 'height', p  : 'top', sp : 'scrollTop', ss : 'scrollHeight'}
        };

    /**
     * 初始化组件
     * @param width
     * @param height
     * @param barWidth
     */
    function init(width, height, barWidth){
        var self = this;
        self.$node.css('overflow','hidden').addClass('jscrollbar')
            .wrapInner(BAR_WRAPPER_NODE.attr('id', self.plugID).css({width:width, height:height}));
        self.$con = $('#'+self.plugID);
        addScrollbar.call(self, self.$node, width, height, barWidth);
        initEvent.call(self);
    }

    function addScrollbar($node, width, height, barWidth){
        setProp.call(this, width, height, barWidth);
        var self = this,
            type = self.bars.split(''),
            mapObj,mapObjO,
            className,
            i= 0,
            len = type.length;
        for(; i < len; i++){
            mapObj = MAPPING[className = type[i]];
            mapObjO = MAPPING['xy'.replace(className,'')].s;
            //加入滚动条背景容器
            $('<div></div>').addClass(className).data('thumbType',className)
                .css(mapObjO ,barWidth)
                //插入拖动条
                .append($(THUMB_NODE)[mapObj.s](self.thumbSize[className]).data('type', className))
                .insertAfter(self.$con.css(mapObjO, '-='+ (self.opt.position === 'outer' ? barWidth : 0)))
        }
        if(self.opt.position === 'inner'){
            $node.find('.x,.y').css('background','transparent');
        }
    }

    function setProp(width, height, barWidth){
        var self = this;
        self.bars = testXYShow.call(self, width, height, barWidth);
        var delta = self.delta = (self.bars.length - 1) * barWidth;
        var thumbSize = self.thumbSize = {x:getThumbSize.call(self, 'x'),y:getThumbSize.call(self, 'y')};

        self.maxPos = {x: width - thumbSize.x - delta, y: height - thumbSize.y - delta};
        self.maxSPos = {x: self.scrollWidth - width + delta, y: self.scrollHeight - height + delta}
    }

    /**
     * 测试x/y方向是否显示滚动条
     * @param width
     * @param height
     * @param barWidth
     * @returns {string}
     */
    function testXYShow(width, height, barWidth){
        var //node = this.node,
        //$node = this.$node,
            self = this,
            $cloneNode = self.$con.clone().appendTo('body').width(width).height(height),
            xflag = self.opt.showXBar && (self.$con[0].scrollWidth > width),
            yflag = self.opt.showYBar && (self.$con[0].scrollHeight > height),
            tmp = 0, type = '',
            bw = self.opt.position === 'outer' ? barWidth : 0;
        //todo 优化：如果设置了不显示某个滚动条，就不用检测
        if(xflag && yflag){
            //初始就有两个滚动条
            type = 'xy'
        }else if(xflag){
            //初始时只有水平滚动条
            tmp = $cloneNode.css({'height' : height - bw, 'zIndex' : -1})[0].scrollHeight;
            type = 'x' + (self.opt.showXBar && tmp > height - bw ? 'y' : '');

        }else if(yflag){
            //初始时只有垂直滚动条
            tmp = $cloneNode.css({'width' : width - bw, 'zIndex' : -1})[0].scrollWidth;
            type = (self.opt.showXBar && tmp > width - bw ? 'x' : '') + 'y'
        }

        self.scrollWidth = $cloneNode[0].scrollWidth;
        self.scrollHeight = $cloneNode[0].scrollHeight;
        $cloneNode.remove();
        return  type;
    }

    /**
     * 获取滚动条的大小
     * @param type 滚动条的类型,取值为x|y
     * @returns {number}
     */
    function getThumbSize(type){
        var mapObj = MAPPING[type];
        return Math.max(20, Math.pow(this.$con[mapObj.s]() - this.delta, 2) / this.$con[0][mapObj.ss]);
    }

    /**
     * 初始化事件
     */
    function initEvent(){
        var self = this;
        this.$node.on('mousedown','.thumb',function(eve){
            start.call(self, eve, eve.target);
            return false
        }).on('click', '.x,.y', function(eve){
                var offset = 0, target = eve.target, thumbType = $.data(target,'thumbType'), mapObj = MAPPING[thumbType];
                //点击thumb不触发
                if(target === this){
                    offset = eve['page'+thumbType.toUpperCase()] - $(target).offset()[mapObj.p];
                    self.scrollTo(thumbType, offset / self.maxPos[thumbType] * self.maxSPos[thumbType]);
                }
            })

        $(document).unbind('mouseup.jsb').bind('mouseup.jsb', function(){
            $(this).unbind('mousemove.jsb');
        });

        bindMouseWheelEvent.call(self);
        this.opt.position === 'inner' && bindMOEvent.call(this)
    }

    /**
     * 绑定鼠标悬浮事件
     */
    function bindMOEvent(){
        var $con = this.$con;
        $con.hover(
            function(){
                $con.find('.x,.y').stop().animate({opacity:1},200)
            },
            function(){
                $con.find('.x,.y').stop().animate({opacity:0},500)
            }
        ).mouseout();
    }

    function bindMouseWheelEvent(){
        var self = this,node = self.node,wheelHandle = null;
        if(this.opt.mouseEvent){
            wheelHandle = function(eve){
                eve = eve || window.event;
                var delta = eve.wheelDelta ? eve.wheelDelta / 120 : -eve.detail / 3;
                self.scrollBy(self.bars.length === 2 ? 'y' : self.bars, -delta * self.opt.mouseSpeed);
                $.event.fix(eve).preventDefault()
            }
            if(node.addEventListener){
                node.addEventListener('mousewheel', wheelHandle);
                node.addEventListener('DOMMouseScroll', wheelHandle)
            }else{
                node.onmousewheel = wheelHandle
            }
        }
    }

    function start(eve, ele){
        var start = {X: eve.pageX, Y: eve.pageY},
            self = this,
            pos = {
                X : parseInt($(ele).css('left')) || 0,
                Y : parseInt($(ele).css('top')) || 0
            };
        $(document).bind('mousemove.jsb', function(eve){
            var type = $.data(ele, 'type'),
                typeUp = type.toUpperCase(),
                mouseDelta = eve['page'+typeUp] - start[typeUp],
                cssProp = MAPPING[type].p,
                cssValue = Math.min(Math.max(0, pos[typeUp] + mouseDelta),self.maxPos[type]);
            $(ele).css(cssProp, cssValue);
            self.scroll(type)
        })
    }

    function updateScrollbar(type, $node, width, height, barWidth){
        var self = this,loc = {'x':self.getScrollPos('x'),'y':self.getScrollPos('y')};
        self.$node.find('.x,.y').remove();
        self.$con.css({width:width, height:height});
        addScrollbar.call(self, $node,width,height,barWidth);
        switch (type){
            case 'relative':
                loc.x && self.scrollTo('x', loc.x);
                loc.y && self.scrollTo('y', loc.y);
                break;
            case 'bottom':
                this.scrollTo('y', self.maxSPos.y);
                break;
            case 'right':
                this.scrollTo('x', self.maxSPos.x);
                break;
            case 'top':
            case 'left' :
            default :
                this.scroll();
                break;
        }
    }

    /**
     *
     * @param direction
     * @param sp 当前滚动的位置
     */
    function setThumbPos(direction, sp){
        var self = this,
            mapObj = MAPPING[direction],
            sp1 = sp || self.$con[0][mapObj.sp],
            pos = self.maxPos[direction] * sp1 / self.maxSPos[direction];
        self.$node.find('.' + direction + ' .thumb').css(mapObj.p, pos);
    }


    /**
     * JScrollBar构造器
     * @param $node
     * @param opt
     * @constructor
     */
    function JScrollBar($node, opt){
        var self = this;
        self.node = $node[0];
        self.$node = $node;
        self.width = $node.width();
        self.height = $node.height();
        self.opt = opt;
        self.plugID = 'jsb_' + Math.floor(Math.random() * 9E3 + 1E3);

        init.call(self, self.width, self.height, opt.width)
    }

    JScrollBar.fn = JScrollBar.prototype;

    /**
     * 更新滚动条，改变内容或者大小之后调用
     * @param {String} [type="relative"] 类型,决定滚动条更新后滚动条的新位置，可选值[relative|top|right|bottom|left]
     */
    JScrollBar.fn.update = function(type){
        var self = this,$node = self.$node;
        updateScrollbar.call(self,type, $node, self.width = $node.width(), self.height = $node.height() , self.opt.width);
        self.scroll()
    }

    /**
     * 获取滚动条的位置
     * @param {String} dir 滚动条的类型(x => 获取水平滚动条的位置 y => 获取垂直滚动条的位置)
     * @returns {Number|number}
     */
    JScrollBar.fn.getThumbLocation = function(dir){
        return parseFloat(this.$node.find('.' + dir + ' .thumb').css(MAPPING[dir].p)) || 0
    }

    /**
     * 获取滚动的位置
     * @param {String} dir 方向(x => 获取水平方向上滚动的距离 y => 获取垂直方向上滚动的距离)
     * @returns {*}
     */
    JScrollBar.fn.getScrollPos = function(dir){
        return this.$con[0][MAPPING[dir].sp]
    }

    /**
     * 根据滚动条的位置滚动内容，在改变滚动条的位置后调用
     * @param {String} direction
     */
    JScrollBar.fn.scroll = function(direction){
        if(direction === undefined){ direction = 'x'; this.scroll('y')}
        this.$con[0][MAPPING[direction].sp] =
            this.getThumbLocation(direction) / this.maxPos[direction] * this.maxSPos[direction]
    }

    /**
     * 相对当前滚动指定的距离
     * @param {String} dir  滚动方向
     * @param {Number} amount 滚动的距离
     */
    JScrollBar.fn.scrollBy = function(dir, amount){
        this.scrollTo(dir, this.$con[0][MAPPING[dir].sp] + amount);
    }

    /**
     * 滚动到指定位置
     * @param {String} direction
     * @param {Number} target
     */
    JScrollBar.fn.scrollTo = function(direction, target){
        target = Math.max(Math.min(this.maxSPos[direction], target),0);

        this.$con[0][MAPPING[direction].sp] = target;
        this.$node.trigger('scroll',[direction,target]);
        setThumbPos.call(this, direction, target)
    }

    /**
     * jQuery滚动条插件
     * @param {Object} [opt]                    配置参数
     * @param {Number} [opt.width=8]            滚动条宽度
     * @param {Number} [opt.position="inner"]   滚动条位置，可选值:inner|outer
     * @param {Number} [opt.showXBar=true]      是否显示水平滚动条(如果有)
     * @param {Number} [opt.showYBar=true]      是否显示垂直滚动条(如果有)
     * @param {Number} [opt.mouseEvent=true]    是否添加鼠标滚动事件
     * @param {Number} [opt.mouseSpeed=30]      鼠标滚动速度
     * @returns {jQuery}
     */
    fn[pluginName] = function(opt){
        if(typeof opt === 'string'){
            var obj = this.data(DATA_NAME);
            obj.scrollTo([].slice.call(arguments,1));
            return obj ? obj[opt].apply(obj, [].slice.call(arguments,1)) : this;
        }
        opt = $.extend({},{
            //default params
            'width' : 8,
            'position' : 'inner',
            'showXBar' : true,
            'showYBar' : true,
            'mouseEvent' : true,
            'mouseSpeed' : 30
        },opt);

        return this.each(function(){
            var objData = $.data(this, DATA_NAME);
            if(!objData){
                $.data(this, DATA_NAME, new JScrollBar($(this), opt))
            }
        })
    }
    fn[pluginName].version = '2.0.0';
})(jQuery, jQuery.fn, 'jscrollbar');