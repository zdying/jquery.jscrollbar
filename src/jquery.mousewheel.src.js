/**
 * User: daiying.zhang
 * Date: 13-4-10
 * Time: 下午5:28
 * Email:97532151@qq.com
 * Site: http://sanjh.cn
 */
;(function($){
    $.fn.extend({
        mousewheel:function(fn){
            return this.each(function(){
                if($.browser.mozilla){ //FireFox
                    this.addEventListener('DOMMouseScroll',f,false);
                }else{
                    this.onmousewheel = f;
                }
                function f(e){
                    var e = e || window.event;
                    var d = e.detail || e.wheelDelta;
                    if($.browser.opera || $.browser.mozilla){
                        d = -d;
                    }
                    fn(d);
                    e.returnValue = false;
                    e.preventDefault && e.preventDefault();
                    return false;
                }
            });
        }
    });
})(jQuery)