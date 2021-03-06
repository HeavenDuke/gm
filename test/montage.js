var assert = require('assert')

module.exports = function (gm, dir, finish, GM) {
    gm.source = __dirname + '/fixtures/compare_1.png';
    var a = gm.montage(__dirname + '/fixtures/favicon.png')

    var args = a.args();
    assert.equal('montage', args[0]);
    assert.equal(__dirname + '/fixtures/favicon.png', args[1]);
    assert.equal(__dirname + '/fixtures/compare_1.png', args[2]);

    if (!GM.integration)
        return finish();

    a
        .write(dir + '/montage.png', function (err) {
            finish(err);
        });
}
