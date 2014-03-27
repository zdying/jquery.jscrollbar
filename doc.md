    /**
     * @method update   更新滚动条，改变内容或者大小之后调用
     * @param {String} [type="relative"] 类型,决定滚动条更新后滚动条的新位置，可选值[relative|top|right|bottom|left]
     */

    /**
     * @method getThumbLocation 获取滚动条的位置
     * @param {String} dir 滚动条的类型(x => 获取水平滚动条的位置 y => 获取垂直滚动条的位置)
     * @returns {Number|number}
     */

    /**
     * @method getScrollPos 获取滚动的位置
     * @param {String} dir 方向(x => 获取水平方向上滚动的距离 y => 获取垂直方向上滚动的距离)
     * @returns {*}
     */

    /**
     * @method scroll 根据滚动条的位置滚动内容，在改变滚动条的位置后调用
     * @param {String} direction
     */

    /**
     * @method scrollBy 相对当前滚动指定的距离
     * @param {String} dir  滚动方向
     * @param {Number} amount 滚动的距离
     */

    /**
     * @method scrollTo 滚动到指定位置
     * @param {String} direction
     * @param {Number} target
     */

    /**
     * @method $.fn.jscrollbar      jQuery滚动条插件方法
     * @param {Object} [opt]                    配置参数
     * @param {Number} [opt.width=8]            滚动条宽度
     * @param {Number} [opt.position="inner"]   滚动条位置，可选值:inner|outer
     * @param {Number} [opt.showXBar=true]      是否显示水平滚动条(如果有)
     * @param {Number} [opt.showYBar=true]      是否显示垂直滚动条(如果有)
     * @param {Number} [opt.mouseEvent=true]    是否添加鼠标滚动事件
     * @param {Number} [opt.mouseSpeed=30]      鼠标滚动速度
     * @returns {jQuery}
     */

    /**
     * @property $.fn.jscrollbar.version    版本号
     * @type {String}
     */