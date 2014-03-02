/**
 *
 * Version : 2.0.0
 */

;(function($){

    var DATA_NAME = 'jsb_data',
        BAR_WRAPPER_NODE = $('<div class="jscrollbar" style="overflow: hidden"></div>'),
        THUMB_NODE = '<div class="thumb"></div>',
        //bars = '', delta = 0,
        //thumbSize = null,maxPos = null,
        MAPPING = {
            x : {s  : 'width', p  : 'left', sp : 'scrollLeft', ss : 'scrollWidth'},
            y : {s  : 'height', p  : 'top', sp : 'scrollTop', ss : 'scrollHeight'}
        };

    function setProp(width, height, barWidth){
        this.bars = testXYShow.call(this, width, height, barWidth);
        var delta = this.delta = (this.bars.length - 1) * this.opt.width;
        var thumbSize = this.thumbSize = {x:getThumbSize.call(this, 'x'),y:getThumbSize.call(this, 'y')};

        this.maxPos = {x: this.width - thumbSize.x - delta, y: this.height - thumbSize.y - delta};
        this.maxSPos = {x: this.scrollWidth - this.width + delta, y: this.scrollHeight - this.height + delta}
        console.log(this.scrollHeight, this.height);
        //console.log(this.plugID, delta, this.bars);
    }

    function addScrollbar($node, width, height, barWidth){

        setProp.call(this, width, height, barWidth);

        var type = this.bars.split(''),
            mapping = {'x':'height','y':'width'},
            className,
            size = 0, i= 0,
            len = type.length;
        //console.log(type);
        for(; i < len; i++){
            //debugger;
            className = type[i];
            size = this.thumbSize[className];
            //this[mapping[className]] -= this.opt.width;
            //加入滚动条背景容器
            $('<div class="' + className + '"></div>')
                .css(mapping[className] ,barWidth)
                //插入拖动条
                .append($(THUMB_NODE)[mapping['xy'.replace(className,'')]](size).data('type', className))
                .insertAfter($node.css(mapping[className], '-='+barWidth))
        }
    }

    function getThumbSize(type){
        // this.width : this.scrollWidth = w : this.width
        var prop = {'x' : 'Width', 'y' : 'Height'}[type],
            size = this.$node[prop.toLowerCase()](),
            //delta = bars.length === 2 ? this.opt.width : 0;
            delta = this.delta;
        return Math.max(10, Math.pow(size - delta, 2) / this.node['scroll' + prop]);
    }

    function init(width, height, barWidth){
        this.$node.css('overflow','hidden').wrap(BAR_WRAPPER_NODE.attr('id', this.plugID).css({width:width, height:height}));
        addScrollbar.call(this, this.$node, width, height, barWidth);
        initEvent.call(this);
    }

    function testXYShow(width, height, barWidth){
        //if(!this.showXBar && !this.showYBar) return;

        var node = this.node,
            $node = this.$node,
            $cloneNode = $node.clone(),
            xflag = node.scrollWidth > width,
            yflag = node.scrollHeight > height,
            tmp = 0, type = '';
        //todo 优化：如果设置了不显示某个滚动条，就不用检测
        if(xflag && yflag){
            //初始就有两个滚动条
            type = 'xy'
        }else if(xflag){
            //初始时只有水平滚动条
            tmp = $cloneNode.css({'height' : height - barWidth, 'zIndex' : -1}).appendTo($('body'))[0].scrollHeight;
            type = 'x' + (tmp > height - barWidth ? 'y' : '')
        }else{
            //初始时只有垂直滚动条
            tmp = $cloneNode.css({'width' : width - barWidth, 'zIndex' : -1}).appendTo($('body'))[0].scrollWidth;
            type = (tmp > width -barWidth ? 'x' : '') + 'y'
        }

        this.scrollWidth = $cloneNode[0].scrollWidth;
        this.scrollHeight = $cloneNode[0].scrollHeight;
        $cloneNode.remove();
        return  type;
        //console.log(width, widthContent);
        //console.log(height, realHeight);
    }

    function initEvent(){
        var self = this;
        $('#'+this.plugID).on('mousedown','.thumb',function(eve){
            start.call(self, eve, eve.target);
            return false
        })

        //todo 优化event bind
        $(document).unbind('mouseup.jsb').bind('mouseup.jsb', function(){
            console.log('up');
            $(this).unbind('mousemove.jsb');
        })
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
        this.plugID = 'jsb_' + Math.floor(Math.random() * 9000 + 1000);

        //self = this;
        init.call(this, this.width, this.height, opt.width);
    }


    JScrollBar.fn = JScrollBar.prototype;

    JScrollBar.fn.update = function(type){

    }

    JScrollBar.fn.getThumbLocation = function(direction){
        var i = 0,len = direction.length,$ele = null,pos = 0;
        for(;i<len;i++){
            $ele = $('#'+this.plugID).find('.' + direction.substr(i,1) + ' .thumb');
            pos = $ele.css(direction === 'x' ? 'left' : 'top')
        }
        return parseFloat(pos)
    }

    JScrollBar.fn.scroll = function(direction){
        var pos = this.getThumbLocation(direction);
        var mapObj = MAPPING[direction];
        console.log(pos, this.maxPos[direction], this.maxSPos[direction]);
        this.node[mapObj.sp] = pos / this.maxPos[direction] * this.maxSPos[direction];
    }

    JScrollBar.fn.scrollBy = function(){

    }

    JScrollBar.fn.scrollTo = function(){

    }

    /** @name $.fn.jscrollbar
    * @param {Object} [options] 配置参数
    * @param {String} [options._color='black'] 滚动条的颜色
    * @param {Number} [options.width=12] 滚动条的宽度
    * @param {Number} [options.opacity=0.6] 滚动条的透明度(0~1)
    * @param {Number} [options.borderRadius=6] 滚动条圆角大小
    * @param {String} [options.position='outer'] 滚动条显示位置
    * @param {String} [options.showXBar=true] 是否显示水平滚动条
    * @param {String} [options.showYBar=true] 是否显示垂直滚动条
    * @param {String} [options.keyControl=true] 是否接受键盘按键(上下左右键)控制
    * @param {String} [options.keyMoveAmount=30] 键盘控制每次移动的距离(单位:px)
    * @param {String} [options.mouseScrollDirection='vertical'] 鼠标滚动时控制的滚动方向(上下滚动或者左右滚动)
    * @param {String} [options.mouseMoveAmount=30] 鼠标滚动时每次移动的距离(单位:px)
    * @returns {*}
    * @example
    * $('#ele').jscrollbar({
    *      _color:'#09F',
        *      opacity:0.7
    * })*/

    $.fn.jscrollbar = function(opt){
        opt = $.extend({},{
            //default params
            'width' : 12,
            'position' : 'outer',
            'showXBar' : true,
            'showYBar' : true,
            'keyControl' : true,
            'keyMoveAmount' : 30,
            'mouseControl' : true,
            'mouseScrollDirection' : 'vertical',
            'mouseMoveAmount' : 30
        },opt);

        return this.each(function(){
            var objData = $.data(this, DATA_NAME);
            if(!objData){
                $.data(this, DATA_NAME, new JScrollBar($(this), opt))
            }
        })
    }
    $.fn.jscrollbar.version = '2.0.0';
})(jQuery);