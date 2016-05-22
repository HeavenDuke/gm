// 完成了本组件的解构

/**
 * Extend proto
 */

// 更进一步调用convenience子组件的四部分去为gm对象增加成员方法和参数
module.exports = function (proto) {
    require("./convenience/thumb")(proto);  // 缩略图
    require("./convenience/morph")(proto);      //
    require("./convenience/sepia")(proto);      //
    require("./convenience/autoOrient")(proto); // 图像自动横纵旋转
}
