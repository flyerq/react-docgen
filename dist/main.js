'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateMarkdown = exports.utils = exports.resolver = exports.handlers = exports.defaultHandlers = exports.parse = undefined;

var _handlers = require('./handlers');

var allHandlers = _interopRequireWildcard(_handlers);

var _parse = require('./parse');

var _parse2 = _interopRequireDefault(_parse);

var _resolver = require('./resolver');

var AllResolver = _interopRequireWildcard(_resolver);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _generateMarkdown = require('./generateMarkdown');

var _generateMarkdown2 = _interopRequireDefault(_generateMarkdown);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const defaultResolver = AllResolver.findExportedComponentDefinition; /*
                                                                      * Copyright (c) 2015, Facebook, Inc.
                                                                      * All rights reserved.
                                                                      *
                                                                      *  This source code is licensed under the BSD-style license found in the
                                                                      * LICENSE file in the root directory of this source tree. An additional grant
                                                                      * of patent rights can be found in the PATENTS file in the same directory.
                                                                      *
                                                                      * 
                                                                      *
                                                                      */

const defaultHandlers = [allHandlers.propTypeHandler, allHandlers.contextTypeHandler, allHandlers.childContextTypeHandler, allHandlers.propTypeCompositionHandler, allHandlers.propDocBlockHandler, allHandlers.flowTypeHandler, allHandlers.defaultPropsHandler, allHandlers.componentDocblockHandler, allHandlers.displayNameHandler, allHandlers.componentMethodsHandler, allHandlers.componentMethodsJsDocHandler];

/**
 * See `lib/parse.js` for more information about the arguments. This function
 * simply sets default values for convenience.
 *
 * The default resolver looks for *exported* `React.createClass(def)` calls
 * and expected `def` to resolve to an object expression.
 *
 * The default `handlers` look for `propTypes` and `getDefaultProps` in the
 * provided object expression, and extract prop type information, prop
 * documentation (from docblocks), default prop values and component
 * documentation (from a docblock).
 */
function defaultParse(src, resolver, handlers, options = {}) {
  if (!resolver) {
    resolver = defaultResolver;
  }
  if (!handlers) {
    handlers = defaultHandlers;
  }

  return (0, _parse2.default)(src, resolver, handlers, options);
}

exports.parse = defaultParse;
exports.defaultHandlers = defaultHandlers;
exports.handlers = allHandlers;
exports.resolver = AllResolver;
exports.utils = utils;
exports.generateMarkdown = _generateMarkdown2.default;