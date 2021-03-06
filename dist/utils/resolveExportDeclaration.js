'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resolveExportDeclaration;

var _recast = require('recast');

var _recast2 = _interopRequireDefault(_recast);

var _resolveToValue = require('./resolveToValue');

var _resolveToValue2 = _interopRequireDefault(_resolveToValue);

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
 */

const _types = _recast2.default.types.namedTypes;
function resolveExportDeclaration(path, types = _types) {
  const definitions = [];
  if (path.node.default) {
    definitions.push(path.get('declaration'));
  } else if (path.node.declaration) {
    if (types.VariableDeclaration.check(path.node.declaration)) {
      path.get('declaration', 'declarations').each(declarator => definitions.push(declarator));
    } else {
      definitions.push(path.get('declaration'));
    }
  } else if (path.node.specifiers) {
    path.get('specifiers').each(specifier => definitions.push(specifier.node.id ? specifier.get('id') : specifier.get('local')));
  }
  return definitions.map(definition => (0, _resolveToValue2.default)(definition));
}