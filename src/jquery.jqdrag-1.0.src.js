/**
 * User: daiying.zhang
 * Date: 13-4-16
 * Time: 上午11:47
 * EMail:97532151@qq.com
 * Site: http://sanjh.cn
 */
;(function($) {
    $.fn.jqdrag = function(option) {
        var //$this = this,
            defaults = {
                type: 'xy',
                trigger: 'self',
                maxX: +Infinity,
                maxY: +Infinity,
                minX: -Infinity,
                minY: -Infinity
            },
        //opt = $.extend(defaults, option),
            OBJ_NAME = 'JQDrag',
            obj = this.data(OBJ_NAME);
        if(typeof option === 'string'){
            if(obj){
                if(option === 'getObject'){
                    return obj
                }else{
                    if(obj[option]){
                        obj[option].apply(obj,Array.prototype.slice.call(arguments,1));
                    }
                    return this
                }
            }else{
                throw new Error('This object is ont available!');
            }
        }
        return this.each(function(){
            var jqd = new JQDrag($(this), $.extend({},defaults, option));
            $(this).data(OBJ_NAME,jqd);
        })
    }

    function JQDrag($obj,settings){
        this.obj = $obj;
        this.settings = settings;
        this.trigger = this.settings.trigger == 'self' ? this.obj : $(this.settings.trigger);

        var draged = false,//是否发生了拖动
            start = {x: 0, y: 0},//鼠标按下的起点
            end = {x: 0, y: 0},//鼠标移动的终点
            loc = {x: 0, y: 0},//鼠标按下时元素的位置
            targetLoc = {x: 0, y: 0},//元素目标坐标
            dis = {x: 0, y: 0},//被拖动元素的偏移
            opt = this.settings,
            _this = this.obj;

        this.trigger.live('mousedown',function(e) {
            //onbeforedrag
            if(opt.onbeforedrag) {
                if(opt.onbeforedrag.call([0]) == false) {
                    return false;
                }
            }
            //鼠标按下时的位置
            start.x = e.pageX;
            start.y = e.pageY;
            //鼠标按下时元素的位置
            loc.x = parseInt(_this.css('left')) || 0;
            loc.y = parseInt(_this.css('top')) || 0;
            $(document).bind('mousemove.jdrag', function(e) {
                //$this.clearSelection();
                if(!draged) draged = true;
                //当前鼠标的位置
                end.x = e.pageX;
                end.y = e.pageY;
                if(opt.type == 'xy') {
                    targetLoc = {
                        x: Math.min(Math.max(loc.x + end.x - start.x, opt.minX), opt.maxX),
                        y: Math.min(Math.max(loc.y + end.y - start.y, opt.minY), opt.maxY)
                    };
                    dis = {
                        x: targetLoc.x - loc.x,
                        y: targetLoc.y - loc.y
                    }
                    _this.css({
                        left: targetLoc.x + 'px',
                        top: targetLoc.y + 'px'
                    });
                } else if(opt.type == 'x') {
                    targetLoc = {
                        x: Math.min(Math.max(loc.x + end.x - start.x, opt.minX), opt.maxX),
                        y: parseInt(_this.css('top'))
                    };
                    dis = {
                        x: targetLoc.x - loc.x,
                        y: 0
                    }
                    _this.css({
                        left: targetLoc.x + 'px'
                    });
                }
                else if(opt.type == 'y') {
                    targetLoc = {
                        x: parseInt(_this.css('left')),
                        y: Math.min(Math.max(loc.y + end.y - start.y, opt.minY), opt.maxY)
                    };
                    dis = {
                        x: 0,
                        y: targetLoc.y - loc.y
                    }
                    _this.css({
                        top: targetLoc.y + 'px'
                    });
                }
                //ondrag
                if(opt.ondrag) {
                    opt.ondrag.call(_this[0], dis, targetLoc);
                }
            });
            return false;
        });
        $(document).bind('mouseup.jqdrag',function(e) {
            if(draged) {
                if(opt.ondragend) {
                    opt.ondragend.call(_this[0], dis);//将ondragend中的this指向当前被拖动的元素
                }
            }
            $(this).unbind('mousemove.jdrag');
            draged = false;
        });
    }
    JQDrag.prototype.setOption = function(obj,update){
        this.settings = $.extend(this.settings,obj);
        update && this.update();
        return this
    }
    JQDrag.prototype.update = function(obj){
        obj && this.setOption(obj);
        var obj = this.obj,
            settings = this.settings;
        obj.css({
            'left' : Math.max(settings.minX,Math.min(parseInt(obj.css('left')),settings.maxX)) + 'px',
            'top': Math.max(settings.minY,Math.min(parseInt(obj.css('top')),settings.maxY)) + 'px'
        })
        return this
    }
})(jQuery)