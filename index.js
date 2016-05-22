
/**
 * Module dependencies.
 */

var Stream = require('stream').Stream;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// 这里让gm对象继承了EventEmitter
util.inherits(gm, EventEmitter);

/**
 * Constructor.
 *
 * @param {String|Number} path - path to img source or ReadableStream or width of img to create
 * @param {Number} [height] - optional filename of ReadableStream or height of img to create
 * @param {String} [color] - optional hex background color of created img
 */

// 这个GM根据注释能做两件事情：
// 1. load一个图片
// 2. 提供width, height 以及十六位色的background颜色，并据此创建一张图片

function gm (source, height, color) {
  var width;

  // 如果当前不是以构造函数的方式在调用gm，方法，则通过构造函数的方式返回一个gm对象
  if (!(this instanceof gm)) {
    return new gm(source, height, color);
  }

  // 让gm对象持有EvemtEmitter所持有的各项属性
  EventEmitter.call(this);

  // 设置图像处理的默认参数，参见./lib/options.js
  this._options = {};
  // 把当前对象的prototype对象的options都复写到当前对象里，采用覆盖的方式
  // 注意这里的this.options会返回当前对象，所以也可以用来赋值：this = this.options(this.__proto__.options);应该也是正确的写法
  this.options(this.__proto__._options);

  //TODO: 这里的四项参数还不知道是做什么用的，等待更新
  this.data = {};
  this._in = [];
  this._out = [];
  this._outputFormat = null;

  // 设置默认子命令为convert，这里应该指shell指令的一部分
  this._subCommand = 'convert';


  // 如果source 是Stream数据流类型的实例
  if (source instanceof Stream) {
    // 则设置gm的sourceStream属性为source
    this.sourceStream = source;
    source = height || 'unknown.jpg';

    // 如果source是缓冲对象的话
  } else if (Buffer.isBuffer(source)) {
    // 那么设置gm的sourceBuffer属性为source
    this.sourceBuffer = source;
    source = height || 'unknown.jpg';

    // 否则现在是在创建一张新的图片，如果传进来了高度
  } else if (height) {
    // 那么第一个参数赋给width，方便理解
    // 同时把source置为空字符串
    width = source;
    source = "";

    // 设置输入的尺寸
    this.in("-size", width + "x" + height);

    // 设置输入颜色
    if (color) {
      this.in("xc:"+ color);
    }
  }

  // 如果source是一个字符串，那么它是一个路径
  if (typeof source === "string") {
    // then source is a path

    // parse out gif frame brackets from filename
    // since stream doesn't use source path
    // eg. "filename.gif[0]"

    // 这里对GIF图片做处理
    // 通过正则表达式获取文件名中的帧，如果存在则把帧取出来
    var frames = source.match(/(\[.+\])$/);
    if (frames) {
      // 那么设置gm的sourceFrames为帧
      this.sourceFrames = source.substr(frames.index, frames[0].length);
      // 而设置source为去掉帧的部分
      source = source.substr(0, frames.index);
    }
  }

  this.source = source;

  this.addSrcFormatter(function (src) {
    // must be first source formatter

    // 这里设置inputFromStdin，若sourceStream与sourceBuffer都是空，则为false
    var inputFromStdin = this.sourceStream || this.sourceBuffer;

    // 这里如果这里设置inputFromStdin为true，那么返回-，否则是从路径读取，返回gm.source
    var ret = inputFromStdin ? '-' : this.source;

    // 如果source存在值，并且是gif，那么设置ret为sourceFrames的帧
    if (ret && this.sourceFrames) ret += this.sourceFrames;

    // 清空src（理论上它应该是个数组）
    src.length = 0;
    // 设置其第一项为ret
    src[0] = ret;
  });
}

/**
 * Subclasses the gm constructor with custom options.
 *
 * @param {options} options
 * @return {gm} the subclasses gm constructor
 */

// 这里用来设置gm的自定义构造方法
// 对应API文档中的var gm = require('gm').subClass({imageMagick: true});这样的写法
// 返回一个定制化的gm函数，可用作构造函数，也可用作工具函数

var parent = gm; // 由于里面定义了一个gm函数，因此parent用来存储外部的gm，以保障里面仍然可访问这个gm对象
gm.subClass = function subClass (options) {
  function gm (source, height, color) {

    // 这里的判断和上面的构造函数一样
    if (!(this instanceof parent)) {
      return new gm(source, height, color);
    }

    // 这里让自定义的对象持有gm对象所持有的各种参数
    // 意义：定义了一个子构造函数
    parent.call(this, source, height, color);
  }

  // 子对象的prototype的prototype置为gm的prototype，是一种继承
  gm.prototype.__proto__ = parent.prototype;
  // 初始化子构造函数的prototype的options，在用户根据这个子构造函数去创建对象时，继承的构造函数就会把用户自定义的这些参数挂到子对象的_options中去，从而实现自定义
  gm.prototype._options = {};
  gm.prototype.options(options);

  return gm;
}

/**
 * Augment the prototype.
 */


// 以下通过lib文件夹中的各种东西给gm对象中添加必要的组件
// 添加方式为向对应模块的module.exports导出的方法中传入gm对象的prototype，即原型来实现
// 这样得到的gm对象更便于通过inherits继承
require("./lib/options")(gm.prototype);
require("./lib/getters")(gm);
require("./lib/args")(gm.prototype);
require("./lib/drawing")(gm.prototype);
require("./lib/convenience")(gm.prototype);
require("./lib/command")(gm.prototype);
require("./lib/compare")(gm.prototype);
require("./lib/composite")(gm.prototype);
require("./lib/montage")(gm.prototype);

/**
 * Expose. 暴露部分接口
 */

module.exports = exports = gm;   // 导出gm
module.exports.utils = require('./lib/utils');  // 导出lib/utils，该模块中包含了部分工具方法
module.exports.compare = require('./lib/compare')(); //TODO: 导出lib/compare，这里不是很懂
module.exports.version = JSON.parse(
  require('fs').readFileSync(__dirname + '/package.json', 'utf8')
).version; // TODO: 导出版本，不过为什么呢？

