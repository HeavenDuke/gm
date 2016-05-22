// montage - 图像蒙太奇
// TODO: 把几张图片拼贴到一张图片上，每张图片下方会出现图片的名字
/**
 * Montage images next to each other using the `montage` command in graphicsmagick.
 *
 * gm('/path/to/image.jpg')
 * .montage('/path/to/second_image.jpg')
 * .geometry('+100+150')
 * .write('/path/to/montage.png', function(err) {
 *   if(!err) console.log("Written montage image.");
 * });
 *
 * @param {String} other  Path to the image that contains the changes.
 */

module.exports = exports = function (proto) {
    proto.montage = function (other) {
        this.in(other);

        this.subCommand("montage");

        // 这个return this 用来拉链
        // 因此每次调用montage方法将只加入一张图到拼贴组中
        // 如果想加入多张，可以多调用几次
        return this;
    }
}
