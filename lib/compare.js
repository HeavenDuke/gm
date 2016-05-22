// compare

// 完成了本组件的解构

var spawn = require('child_process').spawn; // 这个用来生成一个新进程，并向里面传递参数

/**
 * Compare two images uses graphicsmagicks `compare` command.
 *
 * gm.compare(img1, img2, 0.4, function (err, equal, equality) {
 *   if (err) return handle(err);
 *   console.log('The images are equal: %s', equal);
 *   console.log('There equality was %d', equality);
 * });
 *
 * @param {String} orig Path to an image.
 * @param {String} compareTo Path to another image to compare to `orig`.
 * @param {Number|Object} [options] Options object or the amount of difference to tolerate before failing - defaults to 0.4
 * @param {Function} cb(err, Boolean, equality, rawOutput)
 */

module.exports = exports = function (proto) {
    // orig - 原图的路径
    // compareTo - 另一张图的路径
    // options - 容忍阈值或者其他参数，阈值默认为0.4
    //TODO: cb - 回调函数 - 可以修改为generator的点
    function compare(orig, compareTo, options, cb) {

        // 判断是不是使用了ImageMagick
        var isImageMagick = this._options && this._options.imageMagick;
        // 获取应用路径
        var appPath = this._options && this._options.appPath || '';
        // 如果使用的是ImageMagick，那么bin目录的位置为appPath+compare，否则为appPath+gm;
        var bin = isImageMagick
            ? appPath + 'compare'
            : appPath + 'gm';
        // 参数列表为-metric mse orig compareTo
        var args = ['-metric', 'mse', orig, compareTo];
        // 如果没有使用ImageMagick，则还要在参数列表开头加上compare
        if (!isImageMagick) {
            args.unshift('compare');
        }
        // 容忍度默认为0.4
        var tolerance = 0.4;
        // outputting the diff image
        // 如果options是一个对象而不是一个数字
        if (typeof options === 'object') {

            // 用来指定标注不同像素点时使用的颜色
            // 这里把颜色的数值转化成字符串形式，如果已经是字符串形式，就无所谓了
            if (options.highlightColor && options.highlightColor.indexOf('"') < 0) {
                options.highlightColor = '"' + options.highlightColor + '"';
            }

            //是否把判断结果（就是标注了差异位点的图片）保存到文件中
            if (options.file) {
                // 如果file参数不是字符串，那么抛出异常
                if (typeof options.file !== 'string') {
                    throw new TypeError('The path for the diff output is invalid');
                }
                //graphicsmagick defaults to red，如果不自定义这个参数，那么默认的标注颜色为红色
                // 如果要求设置highlightColor
                if (options.highlightColor) {
                    args.push('-highlight-color');
                    args.push(options.highlightColor);
                }
                // 高亮风格，分为如下几种：
                // Assign - 用高亮色替换原始像素点
                // TODO: Threshold - 没懂
                // TODO: Tint - 没懂
                // XOR - 在存在差异的像素点上将其颜色于高亮色取异或
                if (options.highlightStyle) {
                    args.push('-highlight-style')
                    args.push(options.highlightStyle)
                }
                // 对于ImageMagick， 文件名是最后一个参数，而对于GraphicsMagick，file的格式是-file <filename>
                if (!isImageMagick) {
                    args.push('-file');
                }
                args.push(options.file);
            }

            // 如果options.tolerance不为空
            if (typeof options.tolerance != 'undefined') {
                // 如果tolerance不是一个数字，那么要抛出异常
                if (typeof options.tolerance !== 'number') {
                    throw new TypeError('The tolerance value should be a number');
                }
                //否则tolerance设置为options中的tolerance
                tolerance = options.tolerance;
            }
        } else {
            // For ImageMagick diff file is required but we don't care about it, so null it out
            if (isImageMagick) {
                args.push('null:');
            }

            // TODO: 如果options是一个方法，即tolerance没有被提供，那么我们设置callback为options - 如果用yield或许不需要回调函数了
            if (typeof options == 'function') {
                cb = options; // tolerance value not provided, flip the cb place
            } else {
                // 否则options是一个数字，就是tolerance
                tolerance = options
            }
        }

        // spawn用来生成一个shell（算是吧）
        // bin是这个shell的起始路径，相当于指令
        // TODO: Note - args是给这个shell传递的指令后面跟着的一长串东西
        var proc = spawn(bin, args);
        var stdout = ''; // 初始化标准输出
        var stderr = ''; // 初始化标准错误输出
        // 获取ImageMagick或者GM的输出
        proc.stdout.on('data', function (data) {
            stdout += data
        });
        // 获取ImageMagick或者GM的错误输出
        proc.stderr.on('data', function (data) {
            stderr += data
        });
        proc.on('close', function (code) {
            // ImageMagick returns err code 2 if err, 0 if similar, 1 if dissimilar
            // 如果使用了ImageMagick
            if (isImageMagick) {
                // 如果返回0，那么是相似的
                // TODO: 这里similarity为0，难道只要相似就返回0吗？
                if (code === 0) {
                    // 调用回调函数:
                    // err - null
                    // equal - true
                    // similarity - 0
                    // raw - stdout
                    return cb(null, 0 <= tolerance, 0, stdout);
                }
                else if (code === 1) {
                    // 如果返回了1，那么是不相似的
                    // err - null
                    // stdout - stderr
                    err = null;
                    stdout = stderr;
                } else {
                    // 否则认定输出为2
                    // err - stderr
                    return cb(stderr);
                }
            } else {
                // GraphicsMagick 只在返回的code为0的时候是正常的，否则认定为出错
                if (code !== 0) {
                    // err - stderr
                    return cb(stderr);
                }
            }
            // Since ImageMagick similar gives err code 0 and no stdout, there's really no matching
            // Otherwise, output format for IM is `12.00 (0.123)` and for GM it's `Total: 0.123`

            // 对于ImageMagick == 1 或者 GraphicsMagick == 0的两种情况：
            // 用正则表达式去获取匹配比例
            // ImageMagick - /\((\d+\.?[\d\-\+e]*)\)/m - 12.00(0.123)这样的格式，抓取括号里面的内容
            // GraphicsMagick - /Total: (\d+\.?\d*)/m - 抓取Total: 0.123这样的正则表达式中，括号里面的内容
            // TODO: Note - 正则表达式的exec ： 返回一个数组，首先是匹配整个正则表达式的部分，然后是匹配圆括号里的部分
            var regex = isImageMagick ? /\((\d+\.?[\d\-\+e]*)\)/m : /Total: (\d+\.?\d*)/m;


            var match = regex.exec(stdout);
            // 如果没找到匹配，说明出错啦，抛出异常并调用回调函数
            if (!match) {
                err = new Error('Unable to parse output.\nGot ' + stdout);
                return cb(err);
            }

            // 相似度通过把match[1]转化为Float类型实现，这里match[1]是正则匹配中圆括号匹配的字符串部分
            var equality = parseFloat(match[1]);
            // 最终调用回调函数
            // err - null
            // equal - equality是否在阈值范围内
            // similarity - equality相似度
            // raw - stdout
            // orig - 原始图片路径
            // compareTo - 相较图片路径
            cb(null, equality <= tolerance, equality, stdout, orig, compareTo);
        });
    }

    // 这四行代码说明compare既可以写在gm里面，也可以单独拿来用
    if (proto) {
        proto.compare = compare;
    }
    return compare;
};

