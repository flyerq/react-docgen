'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = buildParse;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 *
 */

const parser = require('@babel/parser');

const babelParserOptions = {
  sourceType: 'module',
  strictMode: false,
  tokens: true,
  plugins: ['jsx', 'flow', 'estree', 'doExpressions', 'objectRestSpread', 'classProperties', 'classPrivateProperties', 'classPrivateMethods', 'exportDefaultFrom', 'exportNamespaceFrom', 'asyncGenerators', 'functionBind', 'functionSent', 'dynamicImport', 'numericSeparator', 'optionalChaining', 'importMeta', 'bigInt', 'optionalCatchBinding', 'throwExpressions', ['pipelineOperator', { proposal: 'minimal' }], 'nullishCoalescingOperator']
};

function buildOptions(options = {}) {
  const parserOptions = (0, _extends3.default)({}, babelParserOptions, {
    plugins: [...babelParserOptions.plugins]
  });
  if (options.legacyDecorators) {
    parserOptions.plugins.push('decorators-legacy');
  } else {
    parserOptions.plugins.push(['decorators', { decoratorsBeforeExport: options.decoratorsBeforeExport || false }]);
  }

  return parserOptions;
}

function buildParse(options) {
  const parserOptions = buildOptions(options);

  return {
    parse(src) {
      return parser.parse(src, parserOptions);
    }
  };
}