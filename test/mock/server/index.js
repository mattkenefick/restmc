const express = require('express');

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Mock\Server
 * @project RestMC
 */
module.exports = function () {
    const app = express();
    const port = 3000

    app.get('/v1/user', (req, res) => {
        res.type('json').sendFile(__dirname + '/data/user.json');
    });

    app.get('/v1/user/1', (req, res) => {
        res.type('json').sendFile(__dirname + '/data/user-1.json');
    });

    return app.listen(port, () => {
        console.log(`Test server listening on port ${port}`)
    });
};
