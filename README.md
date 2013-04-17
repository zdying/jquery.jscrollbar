jquery.jscrollbar
========================
jquery.jscrollbar 是一个基于jQuery的滚动条插件，支持水平滚动条和垂直滚动条，支持鼠标键盘事件
------------------------

### 主要功能
1. 支持水平滚动条
2. 支持垂直滚动条
3. 自动判断水平滚动条和垂直滚动条是否显示
4. 支持外部调用来滚动内容
5. 支持滚动条部分样式自定义
6. 支持键盘方向键控制
7. 支持鼠标滚动(需要mousewheel插件)
8. 支持滚动条显示位置设置(外部|悬浮)
9. 支持手动更新界面

### 依赖的库
1. jQuery (http://jquery.com/)
2. jquery.jqdrag (https://github.com/daiying-zhang/jquery.jqdrag)
3. jquery.mousewheel (插件已经包含在本项目中，文件：jquery.mousewheel.min.js)

### 示例代码
    $(function(){
            $('#test1,#test2').jscrollbar({
                width:12, //滚动条宽度
                color:'orange', //滚动条颜色
                opacity:0.7, //透明度
                position:'inner', //滚动条位置
                mouseScrollDirection:'horizontal' //鼠标滚动时滚动的方向
            });

            var jsb2 = $('#test2').jscrollbar('getObject');

            setTimeout(function(){
                $('#test2 img').css({width:'4000px'});
                    //滚动实例的链式调用，无法使用jQuery操作DOM的方法 [不推荐]
                    jsb2.updateUI()
                         .scrollTo('x',100)
                         .scrollBy('x',50);

                    //jQuery的链式调用，可以使用jQuery操作DOM的方法  [推荐]
                    $('#test1').jscrollbar('scrollBy','x',10)
                               .jscrollbar('scrollTo','x',300)
                               .animate({'opacity':0.8},1000);
            },2000)
    });

### E-Mail

97532151@qq.com

### Site

http://sanjh.cn