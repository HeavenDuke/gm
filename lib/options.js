// 完成了本组件的解构
// 用来设置gm对象的原型对象的_options
module.exports = exports = function (proto) {
    proto._options = {};

    /**
     *
     * @param options 一个json对象，用来设置的属性列表
     * @returns {proto}
     */
    proto.options = function setOptions(options) {
        // keys - options中所有属性的键
        // i - options中属性的数目
        // key - 当前属性值
        var keys = Object.keys(options)
            , i = keys.length
            , key


        // 遍历所有的属性，把它们写到gm对象的_options中，名字采用一样的名字，因此如果this._options中存在于options相同的key的属性，则将会被覆盖
        while (i--) {
            key = keys[i];
            this._options[key] = options[key];
        }

        return this;
    }
}
