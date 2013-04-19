/**
 * User: daiying.zhang
 * Date: 13-4-14
 * Time: 下午2:37
 * Email:97532151@qq.com
 * Site: http://sanjh.cn
 */
(function(a){a.fn.extend({mousewheel:function(b){return this.each(function(){if(a.browser.mozilla){this.addEventListener("DOMMouseScroll",c,false);}else{this.onmousewheel=c;}function c(f){var f=f||window.event;var g=f.detail||f.wheelDelta;if(a.browser.opera||a.browser.mozilla){g=-g;}b(g);f.returnValue=false;f.preventDefault&&f.preventDefault();return false;}});}});})(jQuery);