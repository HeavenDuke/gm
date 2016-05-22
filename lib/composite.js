// composite
// 完成了本组件的解构

/**
 * Composite images together using the `composite` command in graphicsmagick.
 *
 * gm('/path/to/image.jpg')
 * .composite('/path/to/second_image.jpg')
 * .geometry('+100+150')
 * .write('/path/to/composite.png', function(err) {
 *   if(!err) console.log("Written composite image.");
 * });
 *
 * @param {String} other  Path to the image that contains the changes.
 * @param {String} [mask] Path to the image with opacity informtion. Grayscale.
 */

// composite 指令用来把两张图片合成为一张
// other - 另一张图片的路径
// TODO: mask - 还不懂这是什么 - http://www.graphicsmagick.org/composite.html
module.exports = exports = function (proto) {
    proto.composite = function (other, mask) {
        // 把other加入到input中来
        this.in(other);

        // If the mask is defined, add it to the output.
        if (typeof mask !== "undefined")
            this.out(mask);


        // 设置子命令为composite
        this.subCommand("composite");

        // 这个return this 用来拉链
        // 因此每次调用composite方法将仅仅合成一张
        // 如果想多来几次的话，可以多调用几次
        return this;
    }
}
