// gm - Copyright Aaron Heckmann <aaron.heckmann+github@gmail.com> (MIT Licensed)


var gm = require('../')
    , dir = __dirname + '/imgs'

var image = gm(dir + '/original.png')
image.sizePromise().done(function (result) {
	console.dir(result);
})


