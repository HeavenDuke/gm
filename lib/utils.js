// 完成了本组件的解构

/**
 * Escape the given shell `arg`.
 *
 * @param {String} arg
 * @return {String}
 * @api public
 */

// 给参数加上带转义符的双引号
exports.escape = function escape(arg) {
    return '"' + String(arg).trim().replace(/"/g, '\\"') + '"';
};

// 去掉所有的双引号
exports.unescape = function escape(arg) {
    return String(arg).trim().replace(/"/g, "");
};

// 把参数列表转化为数组的形式
exports.argsToArray = function (args) {
    var arr = [];

    for (var i = 0; i <= arguments.length; i++) {
        if ('undefined' != typeof arguments[i])
            arr.push(arguments[i]);
    }

    return arr;
};

// 解析一个对象的类型，默认为object
// 其他类型：String/Array/Boolean
exports.isUtil = function (v) {
    var ty = 'object';
    switch (Object.prototype.toString.call(v)) {
        case '[object String]':
            ty = 'String';
            break;
        case '[object Array]':
            ty = 'Array';
            break;
        case '[object Boolean]':
            ty = 'Boolean';
            break;
    }
    return ty;
}