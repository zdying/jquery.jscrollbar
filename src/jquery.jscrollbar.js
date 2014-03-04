/**
 * Version : 2.0.0
 */

;(function($){

    var DATA_NAME = 'jsb_data',
        BAR_WRAPPER_NODE = $('<div class="jscrollbar" style="overflow: hidden"></div>'),
        THUMB_NODE = '<div class="thumb"></div>',
        MAPPING = {
            x : {s  : 'width', p  : 'left', sp : 'scrollLeft', ss : 'scrollWidth'},
            y : {s  : 'height', p  : 'top', sp : 'scrollTop', ss : 'scrollHeight'}
        };

    function setProp(width, height, barWidth){
        this.bars = testXYShow.call(this, width, height, barWidth);
        var delta = this.delta = this.opt.position === 'outer' ? (this.bars.length - 1) * this.opt.width : 0;
        var thumbSize = this.thumbSize = {x:getThumbSize.call(this, 'x'),y:getThumbSize.call(this, 'y')};

        this.maxPos = {x: width - thumbSize.x - delta, y: height - thumbSize.y - delta};
        this.maxSPos = {x: this.scrollWidth - width + delta, y: this.scrollHeight - height + delta}
    }

    function addScrollbar($node, width, height, barWidth){
        setProp.call(this, width, height, barWidth);
        var type = this.bars.split(''),
            //mapping = {'x':'height','y':'width'},
            //mapping = MAPPING,
            mapObj,mapObjO,
            className,
            size = 0, i= 0,
            len = type.length,
            thumbCon = null;
        for(; i < len; i++){
            className = type[i];
            size = this.thumbSize[className];
            mapObj = MAPPING[className];
            mapObjO = MAPPING['xy'.replace(className,'')].s;
            //加入滚动条背景容器
            $('<div class="' + className + '"></div>').data('thumbType',className)
                //.css(mapping[className] ,barWidth)
                .css(mapObjO ,barWidth)
                //插入拖动条
                .append($(THUMB_NODE)[mapObj.s](size).data('type', className))
                .insertAfter($node.css(mapObjO, '-='+ (this.opt.position === 'outer' ? barWidth : 0)))
        }
    }

    function updateScrollbar(type, $node, width, height, barWidth){
        var loc = {'x':this.getScrollPos('x'),'y':this.getScrollPos('y')};
        this.$con.find('.x,.y').remove();
        $node.css({width:width, height:height});
        addScrollbar.call(this, $node,width,height,barWidth);
        switch (type){
            case 'relative':
                loc.x && this.scrollTo('x', loc.x);
                loc.y && this.scrollTo('y', loc.y);
                break;
            case 'bottom':
                this.scrollTo('y', this.maxSPos.y);
                break;
            case 'right':
                this.scrollTo('x', this.maxSPos.x);
                break;
            case 'top':
            default :
                this.scroll();
                break;
        }
    }

    function getThumbSize(type){
       /* var prop = {'x' : 'Width', 'y' : 'Height'}[type],
            size = this.$node[prop.toLowerCase()](),
            delta = this.delta;*/
        var mapObj = MAPPING[type];
        //return Math.max(10, Math.pow(this.$node[mapObj.s]() - this.delta, 2) / this.node[mapObj.ss]);
        return Math.max(10, Math.pow(this.$node[mapObj.s]() - this.delta, 2) / this.node[mapObj.ss]);
    }

    function init(width, height, barWidth){
        this.$node.css('overflow','hidden').wrap(BAR_WRAPPER_NODE.attr('id', this.plugID).css({width:width, height:height}));
        this.$con = $('#'+this.plugID);
        addScrollbar.call(this, this.$node, width, height, barWidth);
        initEvent.call(this);
    }

    function testXYShow(width, height, barWidth){
        var node = this.node,
            $node = this.$node,
            $cloneNode = $node.clone().appendTo('body').width(width).height(height),
            xflag = this.opt.showXBar && (node.scrollWidth > width),
            yflag = this.opt.showYBar && (node.scrollHeight > height),
            tmp = 0, type = '',
            bw = this.opt.position === 'outer' ? barWidth : 0;
            //bw = barWidth;
        //todo 优化：如果设置了不显示某个滚动条，就不用检测
        if(xflag && yflag){
            //初始就有两个滚动条
            type = 'xy'
        }else if(xflag){
            //初始时只有水平滚动条
            tmp = $cloneNode.css({'height' : height - bw, 'zIndex' : -1})[0].scrollHeight;
            type = 'x' + (this.opt.showXBar && tmp > height - bw ? 'y' : '');

        }else if(yflag){
            //初始时只有垂直滚动条
            tmp = $cloneNode.css({'width' : width - bw, 'zIndex' : -1})[0].scrollWidth;
            type = (this.opt.showXBar && tmp > width - bw ? 'x' : '') + 'y'
        }

        this.scrollWidth = $cloneNode[0].scrollWidth;
        this.scrollHeight = $cloneNode[0].scrollHeight;
        $cloneNode.remove();
        return  type;
    }

    function initEvent(){
        var self = this;
        this.$con.on('mousedown','.thumb',function(eve){
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

        //todo 优化event bind
        $(document).unbind('mouseup.jsb').bind('mouseup.jsb', function(){
            $(this).unbind('mousemove.jsb');
        });

        bindMouseWheelEvent.call(this);
        //bindClickEvent.call(this);
    }

    /*function bindClickEvent(){
        //scrollby height / 1.14
        var self = this;
        this.$con.on('click', '.x,.y', function(eve){
            var offset = 0, target = eve.target, thumbType = $.data(target,'thumbType'), mapObj = MAPPING[thumbType];
            //点击thumb不触发
            if(target === this){
                offset = eve['page'+thumbType.toUpperCase()] - $(target).offset()[mapObj.p];
                self.scrollTo(thumbType, offset / self.maxPos[thumbType] * self.maxSPos[thumbType]);
            }
        })
    }*/

    function bindMouseWheelEvent(){
        var node = this.node,self = this,wheelHandle = null;
        if(this.opt.mouseevent){
            wheelHandle = function(eve){
                eve = eve || window.event;
                var delta = eve.wheelDelta ? eve.wheelDelta / 120 : -eve.detail / 3;
                self.scrollBy(self.bars.length === 2 ? 'y' : self.bars, -delta * self.opt.mouseSpeed);
                $.event.fix(eve).preventDefault()
            }
            if(node.addEventListener){
                node.addEventListener('mousewheel', wheelHandle);
                node.addEventListener('DOMMouseScroll', wheelHandle);
            }else{
                node.onmousewheel = wheelHandle;
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
            var type = $.data(ele, 'type').toUpperCase(),
                mouseDelta = eve['page'+type] - start[type],
                cssProp = type === 'X' ? 'left' : 'top',
                cssValue = Math.min(Math.max(0, pos[type] + mouseDelta),self.maxPos[type.toLowerCase()]);
            $(ele).css(cssProp, cssValue);
            self.scroll(type.toLowerCase())
        })
    }

    /**
     *
     * @param direction
     * @param sp 当前滚动的位置
     */
    function setThumbPos(direction, sp){
        var mapObj = MAPPING[direction],
            sp1 = sp || this.node[mapObj.sp],
            pos = this.maxPos[direction] * sp1 / this.maxSPos[direction];
        this.$con.find('.' + direction + ' .thumb').css(mapObj.p, pos);
    }


    function JScrollBar($node, opt){
        /**
         * 添加滚动条的元素
         * @type {jQuery}
         */
        this.node = $node[0];
        this.$node = $node;
        this.width = $node.width();
        this.height = $node.height();
        this.opt = opt;
        this.plugID = 'jsb_' + Math.floor(Math.random() * 9E3 + 1E3);

        //self = this;
        init.call(this, this.width, this.height, opt.width);
    }


    JScrollBar.fn = JScrollBar.prototype;

    JScrollBar.fn.update = function(type){
        var $node = this.$node;
        updateScrollbar.call(this,type, $node, this.width, this.height , this.opt.width);
        this.scroll();
    }

    JScrollBar.fn.getThumbLocation = function(direction){
        var i = 0,len = direction.length,$ele = null,pos = 0;
        for(;i<len;i++){
            $ele = $('#'+this.plugID).find('.' + direction.substr(i,1) + ' .thumb');
            pos = $ele.css(direction === 'x' ? 'left' : 'top')
        }
        return parseFloat(pos) || 0
    }

    JScrollBar.fn.getScrollPos = function(dir){
        return this.node[MAPPING[dir].sp]
    }

    JScrollBar.fn.scroll = function(direction){
        if(direction === undefined){ direction = 'x'; this.scroll('y')}
        var pos = this.getThumbLocation(direction);
        var mapObj = MAPPING[direction];
        console.log(pos, this.maxPos[direction], this.maxSPos[direction]);
        this.node[mapObj.sp] = pos / this.maxPos[direction] * this.maxSPos[direction];
    }

    JScrollBar.fn.scrollBy = function(direction, amount){
        var target = this.node[MAPPING[direction].sp];
        this.scrollTo(direction, target + amount);
    }

    JScrollBar.fn.scrollTo = function(direction, target){
        target = Math.max(Math.min(this.maxSPos[direction], target),0);
        this.node[MAPPING[direction].sp] = target;
        setThumbPos.call(this, direction, target)
    }

    $.fn.jscrollbar = function(opt){
        opt = $.extend({},{
            //default params
            'width' : 12,
            'position' : 'outer',
            'showXBar' : true,
            'showYBar' : true,
            'mouseevent' : true,
            'mouseSpeed' : 30
        },opt);

        console.log(opt);

        return this.each(function(){
            var objData = $.data(this, DATA_NAME);
            if(!objData){
                $.data(this, DATA_NAME, new JScrollBar($(this), opt))
            }
        })
    }
    $.fn.jscrollbar.version = '2.0.0';
})(jQuery);