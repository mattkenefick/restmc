/**
 * Mocha/ts-node require hook for test runs.
 *
 * Source files import with explicit `.js` extensions to support Node's
 * native ESM loader when consuming the ESM build. ts-node's CJS loader
 * doesn't rewrite `.js` to `.ts`, so tests fail to resolve the sources.
 *
 * This hook intercepts relative `.js` imports and, if a matching `.ts`
 * file exists on disk, routes the resolution to it. It's used only by
 * the test runner (via `.mocharc.json`); the build output is untouched.
 *
 * @package Test/Register
 * @project restmc
 */

const Module = require('module');
const fs = require('fs');
const path = require('path');

const originalResolve = Module._resolveFilename;

/**
 * Rewrite relative `.js` specifiers to `.ts` when the `.ts` file exists.
 *
 * @param string request
 * @param NodeModule parent
 * @param ...any rest
 * @return string
 */
Module._resolveFilename = function (request, parent, ...rest) {
	if (parent && typeof request === 'string' && request.startsWith('.') && request.endsWith('.js')) {
		const resolvedDir = path.dirname(parent.filename);
		const tsPath = path.resolve(resolvedDir, request.replace(/\.js$/, '.ts'));

		if (fs.existsSync(tsPath)) {
			return originalResolve.call(this, tsPath, parent, ...rest);
		}
	}

	return originalResolve.call(this, request, parent, ...rest);
};
