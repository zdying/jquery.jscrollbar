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
     * })
     */
    $.fn.jscrollbar = function(options){
        var //$this = this,
            defaults = {
                color : 'black', //滚动条颜色
                width : 12,
                opacity: 0.6,
                borderRadius: 6,
                position: 'outer', // 滚动条的位置
                keyControl:true,
                mouseScrollDirection:'vertical',
                keyMoveAmount:30,
                mouseMoveAmount:30
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
        //this.contentScrollHeight = this.$sbContent[0].scrollHeight;

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
                .wrapInner('<div class="sb-Content" style="overflow:hidden;position:relative"></div>');
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
                    'background:'+color+';opacity:0.2;filter:alpha(opacity=20);width:100%'+
                    ';height:'+
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
                    'background:'+color+';opacity:0.2;filter:alpha(opacity=20);width:'+width+'px;height:100%'+
                    ';right:0;top:0"></div>')
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
                    amount = (data<0 ? 1 : -1) * _this.opts.mouseMoveAmount,
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
                    ';position:absolute;z-index:1;border-radius:' + opts.borderRadius+
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
                    },
                    ondragend:function(){
                        _this._triggerEvent('x','finished')
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
                    },
                    ondragend:function(){
                        _this._triggerEvent('y','finished')
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
                if((showYBar!==false) && (_this.scrollHeight > _this.$sbContent.height())){
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
                                    _this.scrollBy('x',-_this.opts.keyMoveAmount);
                                    break;
                                case 38 :
                                    _this.scrollBy('y',-_this.opts.keyMoveAmount);
                                    break;
                                case 39 :
                                    _this.scrollBy('x',_this.opts.keyMoveAmount);
                                    break;
                                case 40 :
                                    _this.scrollBy('y',_this.opts.keyMoveAmount);
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
         * 获取当前滚动信息
         * @returns {{x: *, y: *}}
         */
        getScrollPos : function(){
            var sb = this.$sbContent[0];
            return {x:sb.scrollLeft,y:sb.scrollTop}
        },
        /**
         * 根据滚动信息设置滚动条的位置
         * @returns {*}
         */
        setBarLoc : function(){
            var sp = this.getScrollPos(),
                barX = this.barX,
                barY = this.barY;

            barX && barX.css({
                    'left':this.barXmaxX * sp.x / (this.scrollWidth - this.width)
                });

            barY && barY.css({
                    'top':this.barYmaxY * sp.y / (this.scrollHeight - this.height)
                });
            return this
        },
        /**
         * 内容区域滚动一定距离
         * @param {String} direction 滚动方向,可接受的值['x','y'(默认值),'xy']
         * @param {Number} amount 滚动数目(默认:10)
         */
        scrollBy : function(direction, amount){
            this.scrollTo(direction,this.getScrollPos()[direction] + amount);
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
            var //sp = this.getScrollPos(),
                d = direction == 'x' ? 'scrollLeft' : 'scrollTop';
            this.$sbContent[d](target);
            this.setBarLoc();
            this._triggerEvent(direction,'scroll');
            return this
        },
        /**
         * 触发事件
         * @param direction
         * @param type
         */
        _triggerEvent : function(direction,type, obj){
            if(obj){
                this.obj.trigger(type,[obj]);
                return
            }
            var percent = direction == 'x' ? +(parseFloat(this.barX.css('left'),10) /this.barXmaxX * 100).toFixed(2)
                :+(parseFloat(this.barY.css('top'),10) /this.barYmaxY * 100).toFixed(2);
            this.obj.trigger(type,[{
                direction:direction,percent:percent,
                scrollWidth:this.scrollWidth, scrollHeight:this.scrollHeight
            }]);
        },

        /**
         * 更新UI
         */
        updateUI : function() {
            //重新计算各参数

            //宽度、高度
            this.width = this.obj.width();
            this.height = this.obj.height();

            //设置内容区域的大小
            this.$sbContent.css({'width':this.barY?this.width-this.opts.width:this.width,
                'height':this.barX?this.height-this.opts.width:this.height});
            //滚动高度、滚动宽度
            this.scrollWidth = this.$sbContent[0].scrollWidth;
            this.scrollHeight = this.$sbContent[0].scrollHeight;
            //滚动条“长度”
            this.barXWidth = Math.min(this.width - this.opts.width - 10,
                Math.max(10, this.width * this.width / this.scrollWidth));
            this.barYHeight = Math.min(this.height - this.opts.width - 10,
                Math.max(10, this.height * this.height / this.scrollHeight));

            //this.contentScrollHeight = this.$sbContent[0].scrollHeight;

            if(this.barX){
                //计算水平滚动条最大滚动位置
                this.barXmaxX = this.width - this.barXWidth -
                    ((this.opts.position==='inner' || !this.opts.showYBar) ? 0 : this.opts.width);
                //设置滚动条的宽度
                this.barX.css({
                    'width':this.barXWidth
                });
                //设置水平滚动条最大的拖动位置
                this.barX.jqdrag('setOption',{'maxX':this.barXmaxX})
            }
            if(this.barY){
                this.barYmaxY = this.height - this.barYHeight -
                    ((this.opts.position === 'inner' || !this.opts.showXBar)?0:this.opts.width);
                this.barY.css({
                    'height':this.barYHeight
                });
                this.barY.jqdrag('setOption',{'maxY':this.barYmaxY})
            }
            //设置滚动条的位置
            return this.setBarLoc()
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
                p = this.$sbContent,
                _this = this,
                location = 0,
                percent = 0;
            //上下滚动元素内容

            if(/y/.test(direction) && this.barY){
                /*
                 * scrollTop的计算方法：
                 * scrollTop = (滚动高度 - 实际显示高度) * 滚动条Top / barYmaxY
                 */
                percent = (!barYLoc?barYLocTop:parseFloat(this.barY.css('top'))) /
                    this.barYmaxY;
                location = (p[0].scrollHeight - p.height()) * percent;

                p.stop().animate({
                    'scrollTop': location
                },duration,function(){
                    _this._triggerEvent('y','scroll',{
                        direction:"y",percent:+(percent * 100).toFixed(2),
                        scrollWidth:_this.scrollWidth, scrollHeight:_this.scrollHeight
                    });
                });
            }
            //左右滚动元素内容
            if(/x/.test(direction) && this.barX){
                /*
                 * scrollLeft的计算方法：
                 * scrollLeft = (滚动宽度 - 实际显示宽度) * 滚动条Left / barXmaxX
                 */
                percent = (!barXLoc?barXLocLeft:parseFloat(this.barX.css('left'))) /
                    this.barXmaxX;
                location = (this.scrollWidth - this.width) * percent;
                p.stop().animate({
                    'scrollLeft': location
                },duration,function(){
                    _this._triggerEvent('x','scroll',{
                        direction:"x",precent:+(percent * 100).toFixed(2),
                        scrollWidth:_this.scrollWidth, scrollHeight:_this.scrollHeight
                    });
                });
            }
        }
    }
})(jQuery)