/**
 * User: daiying.zhang
 * Date: 13-4-15
 * Time: 下午7:09
 * Email: 97532151@qq.com
 * Site: http://sanjh.cn
 */
;(function($){
    /**
     <p>创建一个滚动条，用户只需要传入需要滚动的元素，支持垂直滚动条和水平滚动条</p>
     <p>需要滚动的元素只需要设置好用于显示的区域大小(width/height)以及overflow=hidden属性。</p>
     * @name $.fn.jscrollbar
     * @param {Object} [options] 配置参数
     * @param {String} [options._color='black'] 滚动条的颜色
     * @param {Number} [options.width=12] 滚动条的宽度
     * @param {Number} [options.opacity=0.6] 滚动条的透明度(0~1)
     * @param {String} [options.position='outer'] 滚动条显示位置
     * @param {String} [options.showXBar=true] 是否显示水平滚动条
     * @param {String} [options.showYBar=true] 是否显示垂直滚动条
     * @param {String} [options.keyControl=true] 是否接受键盘按键(上下左右键)控制
     * @param {String} [options.mouseScrollDirection='vertical'] 鼠标滚动时控制的滚动方向(上下滚动或者左右滚动)
     * @returns {*}
     * @example
     * $('#ele').jscrollbar({
     *      _color:'#09F',
     *      opacity:0.7
     * })
     */
    $.fn.jscrollbar = function(options){
        var //$this = this,
            defaults = {
                color : 'black', //滚动条颜色
                width : 12,
                opacity: 0.6,
                position: 'outer', // 滚动条的位置
                keyControl:true,
                mouseScrollDirection:'vertical'
            },
            OBJ_NAME = 'jscrollbar',
            obj = this.data(OBJ_NAME);
        if(typeof options === 'string'){
            if(obj){ //实例已经被创建
                if(options === 'getObject'){  //获取实例
                    return obj;
                }else{
                    if(obj[options]){ //调用实例的方法
                        obj[options].apply(obj,Array.prototype.slice.call(arguments,1));
                    }
                    return this //返回jQuery对象
                }
            }else{
                throw new Error('This object is not available!');
            }
        }
        return this.each(function(){
            var jsb = new JScrollBar($(this),$.extend({},defaults,options));
            $(this).data(OBJ_NAME,jsb);
        });

    }

    function JScrollBar($obj,opts){

        this.obj = $obj;
        this.opts = opts;

        var _this = this;
        setPosition();
        this.width =  $obj.width();
        this.height = $obj.height();

        this.scrollWidth = $obj[0].scrollWidth;
        this.scrollHeight = $obj[0].scrollHeight;

        /*
         *  计算滚动条的长度:
         *  滚动条长度:元素宽度(高度) = 元素可见宽度(高度):元素滚动宽度(宽度)
         *  ==> 滚动条长度 = 元素宽度(高度) * 元素可见宽度(高度) / 元素滚动宽度(宽度)
         */

        this.barXWidth = Math.min(this.width - this.opts.width - 10,
            Math.max(10, this.width * this.width / this.scrollWidth));
        this.barYHeight = Math.min(this.height - this.opts.width - 10,
            Math.max(10, this.height * this.height / this.scrollHeight));

        this.$sbContent = initContentArea();
        this.contentScrollHeight = this.$sbContent[0].scrollHeight;

        this.barX = undefined;
        this.barY = undefined;
        this.barXmaxX = 0;
        this.barYmaxY = 0;
        this.barXB = null;
        this.barYB = null;

        //========
        initBar();
        barAminate();
        bindKeyControl();
        addMouseWheelEvent();
        //========


        /**
         * 构造内容区域
         * @return {*}
         */
        function initContentArea() {
            //console.log('==构造内容区域==');
            _this.obj.css({'overflow':'hidden'})
                .wrapInner('<div class="sb-Content" style="overflow:hidden;"></div>');
            var $sbContent = _this.obj.children('.sb-Content').scrollTop(0).scrollLeft(0);
            //Fuck FireFox
            if($.browser.mozilla){
                $(document).ready(function(){
                    $sbContent.scrollTop(0);
                });
            }
            return $sbContent;
        }

        /**
         * 初始化滚动条背景
         * @return {*}
         */
        function initBarBg(type){
            //console.log('==初始化滚动条背景==');
            var color = _this.opts.color,
                width = _this.opts.width;
            if(/x/i.test(type)){
                _this.barXB = $('<div style="position:absolute;font-size:0;' +
                    'background:'+color+';opacity:0.2;filter:alpha(opacity=20);width:'+
                    _this.width+'px;height:'+
                    width+'px;left:0;bottom:0;"></div>')
                    .appendTo(_this.obj)
                    .bind('mousedown',function(e){
                        var barXLocLeft = Math.max(
                            Math.min(
                                e.pageX - $(this).offset().left - _this.barX.width()/2,
                                _this.barXmaxX //最大值
                            ),
                            0);
                        _this.barX.stop().animate({left: barXLocLeft},300);
                        _this._updateContentLoc({direction:'x','barXLocLeft':barXLocLeft,'duration':300});
                        return false;
                    });
            }
            if(/y/i.test(type)){
                _this.barYB = $('<div style="font-size:0;position:absolute;' +
                    'background:'+color+';opacity:0.2;filter:alpha(opacity=20);width:'+width+'px;height:'+
                    _this.height+'px;right:0;top:0"></div>')
                    .appendTo(_this.obj)
                    .bind('mousedown',function(e){
                        var barYLocTop = Math.max(
                            Math.min(
                                e.pageY - $(this).offset().top - _this.barY.height()/2,
                                _this.barYmaxY //最大值
                            ),
                            0);
                        _this.barY.stop().animate({top: barYLocTop},300);
                        _this._updateContentLoc({direction:'y','barYLocTop':barYLocTop,'duration':300});
                        return false;
                    });
            }

        }

        /**
         * 滚动区域鼠标滚动事件
         */
        function addMouseWheelEvent(){
            //console.log('==添加区域鼠标滚动事件==');
            _this.obj.mousewheel && (_this.obj.mousewheel(function(data){
                //console.log('Has mouseWheel plug');
                var //pos = $this.getPosition((data<0 ? 1 : -1) * 10),
                    pos = {'horizontal':'x','vertical':'y'},
                    amount = (data<0 ? 1 : -1) * 20,
                    direction = _this.opts.mouseScrollDirection,
                    showXBar = _this.opts.showXBar,
                    showYBar = _this.opts.showYBar;
                //修正mouseScrollDirection的值
                if(direction == 'horizontal' && !showXBar && showYBar){
                    direction = 'vertical';
                }
                if(direction == 'vertical' && !showYBar && showXBar){
                    direction = 'horizontal';
                }
                _this.scrollBy(pos[direction],amount);
            }));
        }

        /**
         * 修改被滚动区域的position属性
         */
        function setPosition(){
            //console.log('==修改被滚动区域的position属性==');
            var $thisPosition = _this.obj.css({'overflow':'auto'}).css('position');
            if(/(static)/ig.test($thisPosition)){
                _this.obj.css({position:'relative'});
            }
        }


        /**
         * 添加滚动条
         */
        function addBar(type){
            //console.log('_this.opts.width:',_this.opts);
            var width = _this.opts.width,
                position = _this.opts.position,
                cssAttr = {},
                opacity = _this.opts.opacity,
                barStyle = '<div class="jq-scrollbar" style="font-size:0;border-radius:6px;background:'+_this.opts.color+
                    ';position:absolute;z-index:1' +
                    ';opacity:'+opacity+';filter:alpha(opacity='+opacity*100+');';
            if(/x/i.test(type)){
                _this.opts.showXBar = true;
                _this.barX = this.barX = $(barStyle +
                    'bottom:0;left:0' +
                    ';width:'+_this.barXWidth+'px;height:'+width+'px;"></div>')
                    .appendTo(_this.obj);
                //设置内容区域的大小
                if(position === 'outer') {
                    cssAttr.height = (_this.height - width) + 'px';
                    initBarBg('x');
                }else{
                    cssAttr.height = _this.height + 'px';
                }
            }else if(/y/i.test(type)){
                _this.opts.showYBar = true;
                _this.barY = $(barStyle +
                    ';right:0;top:0' +
                    ';width:'+width+'px;height:'+_this.barYHeight+'px;"></div>')
                    .appendTo(_this.obj);
                //设置内容区域的大小
                if(position === 'outer') {
                    cssAttr.width = (_this.width - width) + 'px';
                    initBarBg('y');
                }else{
                    //else if(position === 'inner'){
                    cssAttr.width = _this.width + 'px';
                }
            }
            _this.$sbContent.css(cssAttr);
        }

        /**
         * 滚动条添加拖动功能
         * @param type
         */
        function dragBar(type){
            if(/x/i.test(type) && _this.barX){
                _this.barX.jqdrag({
                    type : 'x', //水平方向拖动
                    maxX : _this.barXmaxX, //不能超过元素右边界
                    minX : 0, //不能超出元素左边界
                    ondrag:function(){
                        _this._updateContentLoc({direction:'x'});
                    }
                });
            }
            if(/y/.test(type) && _this.barY){
                _this.barY.jqdrag({
                    type:'y', //垂直方向移动
                    maxY:_this.barYmaxY, //不能超过元素的下边界
                    minY:0, //不能超过元素的上边界
                    ondrag:function(){
                        _this._updateContentLoc({direction:'y'});
                    }
                });
            }
        }

        /**
         * 初始化滚动条
         */
        function initBar(){
            //console.log('    ==初始化滚动条==');
            var showXBar = _this.opts.showXBar;
            var showYBar = _this.opts.showYBar;
            if((showXBar!==false) && (_this.scrollWidth > _this.width)){
                addBar('x');
                if((showYBar!==false) && (_this.contentScrollHeight > _this.$sbContent.height())){
                    addBar('y');
                }
            }
            if((showYBar!==false) && (typeof _this.barY === 'undefined') &&
                (_this.scrollHeight > _this.height)){
                addBar('y');
                if((showXBar!==false) && (typeof _this.barX === 'undefined') &&
                    (_this.$sbContent[0].scrollWidth > _this.$sbContent.width())){
                    addBar('x');
                }
            }
            //设置一些参数
            if(!opts.showYBar){
                _this.$sbContent.css({'width':_this.width+'px'});
            }
            if(!opts.showXBar){
                _this.$sbContent.css({'height':_this.height+'px'});
            }

            _this.barX && (_this.barXmaxX = _this.width - _this.barX.width() -
                ((opts.position==='inner' || !_this.opts.showYBar) ? 0 : _this.opts.width));
            _this.barY && (_this.barYmaxY = _this.height - _this.barY.height() -
                ((opts.position === 'inner' || !_this.opts.showXBar)?0:_this.opts.width));

            dragBar('xy');
        }

        /**
         * 滚动条背景动画
         */
        function barAminate(){
            //console.log('==滚动条背景动画==')
            var position = _this.opts.position,
                opacity = _this.opts.opacity,
                o0 = {opacity:0},
                oo = {'opacity':opacity};
            if(position === 'outer'){
            }else{
                //else if(position === 'inner'){
                var $sb = _this.obj.find('.jq-scrollbar').animate(o0,1000);
                _this.obj.hover(
                    function(){
                        $sb.stop().animate(oo,500);
                    },
                    function(){
                        $sb.stop().animate(o0,1000);
                    }
                );
            }
        }

        /**
         * 绑定键盘控制事件
         */
        function bindKeyControl(){
            if(_this.opts.keyControl){
                _this.$sbContent.hover(
                    function(){
                        $(document).bind('keydown.jsb',function(e){
                            //左:37  右:39 上: 38  下:40
                            var code = e.keyCode;
                            switch(code){
                                case 37 :
                                    _this.scrollBy('x',-20);
                                    break;
                                case 38 :
                                    _this.scrollBy('y',-20);
                                    break;
                                case 39 :
                                    _this.scrollBy('x',20);
                                    break;
                                case 40 :
                                    _this.scrollBy('y',20);
                                    break;
                            }
                            /(37|38|39|40)/.test(code) && e.preventDefault();
                        });
                    },
                    function(){
                        $(document).unbind('keydown.jsb');
                    }
                );
            }
        }
    }

    JScrollBar.prototype = {
        /**
         * 获取滚动条当前的位置，可以设置偏移量
         * @param moveAmount
         * @returns {{x: number, y: number}}
         */
        getPosition : function(moveAmount){
            var x = this.barX ? Math.max(0,Math.min(parseInt(this.barX.css('left')) + (moveAmount||0), this.barXmaxX)) : 0,
                y = this.barY ? Math.max(0,Math.min(parseInt(this.barY.css('top')) + (moveAmount||0), this.barYmaxY)) : 0
            return { x: x, y: y}
        },
        /**
         * 内容区域滚动一定距离
         * @param {String} direction 滚动方向,可接受的值['x','y'(默认值),'xy']
         * @param {Number} amount 滚动数目(默认:10)
         */
        scrollBy : function(direction, amount){
            //console.log(direction, amount,this);
            !direction && (direction = 'y');
            !amount && (amount = 10);
            var p = this.$sbContent;
            amount = Math.round(direction === 'x'? (this.width - this.barXWidth) * amount / (p[0].scrollWidth - p.width()) :
                (this.height - this.barYHeight) * amount / (p[0].scrollHeight - p.height())
            );
            var pos = this.getPosition(amount);
            if(this.barX && direction == 'x'){
                this.barX.css({
                    left: pos.x + 'px'
                });
                this._updateContentLoc({direction:'x'});
            }else if(this.barY && direction == 'y'){
                this.barY.css({
                    top: pos.y + 'px'
                });
                this._updateContentLoc({direction:'y'});
            }
            return this
        },

        /**
         * 滚动到指定位置
         * @name scrollTo
         * @constructor
         * @param {String} direction
         * @param {Number} target
         */
        scrollTo : function(direction,target){
            this.scrollBy(direction,target - (direction=='x'?this.$sbContent.scrollLeft():this.$sbContent.scrollTop()));
            return this
        },

        /**
         * 更新UI
         */
        updateUI : function() {
            this.scrollWidth = this.$sbContent[0].scrollWidth;
            this.scrollHeight = this.$sbContent[0].scrollHeight;

            this.barXWidth = Math.min(this.width - this.opts.width - 10,
                Math.max(10, this.width * this.width / this.scrollWidth));
            this.barYHeight = Math.min(this.height - this.opts.width - 10,
                Math.max(10, this.height * this.height / this.scrollHeight));

            this.contentScrollHeight = this.$sbContent[0].scrollHeight;

            if(this.barX){
                this.barX.css({
                    'width':this.barXWidth
                });
                this.barXmaxX = this.width - this.barXWidth -
                    ((this.opts.position==='inner' || !this.opts.showYBar) ? 0 : this.opts.width);
                this.barX.jqdrag('setOption',{'maxX':this.barXmaxX})
            }
            if(this.barY){
                this.barY.css({
                    'height':this.barYHeight
                });
                this.barYmaxY = this.height - this.barY.height() -
                    ((this.opts.position === 'inner' || !this.opts.showXBar)?0:this.opts.width);
                this.barY.jqdrag('setOption',{'maxY':this.barYmaxY})
            }
            return this
        },

        /**
         * 更新滚动UI，用于改变滚动条的位置后
         * @param {Object} [opts] 配置参数
         */
        _updateContentLoc : function(opts){
            //console.log('==更新滚动UI==');
            var opts = $.extend(
                    {
                        direction : 'xy'
                        ,duration : 0
                    },
                    opts
                ),
                direction = opts.direction,
                barXLocLeft = opts.barXLocLeft,
                barYLocTop = opts.barYLocTop,
                barXLoc = typeof barXLocLeft === 'undefined',
                barYLoc = typeof barYLocTop === 'undefined',
                duration = opts.duration,
                p = this.$sbContent;
            //上下滚动元素内容

            if(/y/.test(direction) && this.barY){
                /*
                 * scrollTop的计算方法：
                 * scrollTop = (滚动高度 - 实际显示高度) * 滚动条Top / barYmaxY
                 */
                p.stop().animate({
                    'scrollTop': (p[0].scrollHeight - p.height()) *
                        (!barYLoc?barYLocTop:parseInt(this.barY.css('top'))) /
                        this.barYmaxY
                },duration);
            }
            //左右滚动元素内容
            if(/x/.test(direction) && this.barX){
                /*
                 * scrollLeft的计算方法：
                 * scrollLeft = (滚动宽度 - 实际显示宽度) * 滚动条Left / barXmaxX
                 */
                p.stop().animate({
                    'scrollLeft': (p[0].scrollWidth - p.width()) *
                        (!barXLoc?barXLocLeft:parseInt(this.barX.css('left'))) /
                        this.barXmaxX
                },duration);
            }
        }
    }
})(jQuery)