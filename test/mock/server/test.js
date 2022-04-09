const Server = require('./index');

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Mock\Server
 * @project RestMC
 */
module.exports = {
    /**
     * Adds hooks to mocha/chai to start/stop a server before the
     * testing begins. Usage looks like:
     *
     *     configureServer(before, after);
     *
     * @param Function before
     * @param Function after
     * @return void
     */
    configureServer: function (before, after) {
        let app;

        before(function () {
            app = Server();
        });

        after(function () {
            app.close();
        });
    }
}
