'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = displayNameHandler;

var _getMemberValuePath = require('../utils/getMemberValuePath');

var _getMemberValuePath2 = _interopRequireDefault(_getMemberValuePath);

var _getNameOrValue = require('../utils/getNameOrValue');

var _getNameOrValue2 = _interopRequireDefault(_getNameOrValue);

var _recast = require('recast');

var _recast2 = _interopRequireDefault(_recast);

var _resolveToValue = require('../utils/resolveToValue');

var _resolveToValue2 = _interopRequireDefault(_resolveToValue);

var _resolveFunctionDefinitionToReturnValue = require('../utils/resolveFunctionDefinitionToReturnValue');

var _resolveFunctionDefinitionToReturnValue2 = _interopRequireDefault(_resolveFunctionDefinitionToReturnValue);

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

const types = _recast2.default.types.namedTypes;
function displayNameHandler(documentation, path) {
  let displayNamePath = (0, _getMemberValuePath2.default)(path, 'displayName');
  if (!displayNamePath) {
    // Function and class declarations need special treatment. The name of the
    // function / class is the displayName
    if (types.ClassDeclaration.check(path.node) || types.FunctionDeclaration.check(path.node)) {
      documentation.set('displayName', (0, _getNameOrValue2.default)(path.get('id')));
    } else if (types.ArrowFunctionExpression.check(path.node) || types.FunctionExpression.check(path.node)) {
      let currentPath = path;
      while (currentPath.parent) {
        if (types.VariableDeclarator.check(currentPath.parent.node)) {
          documentation.set('displayName', (0, _getNameOrValue2.default)(currentPath.parent.get('id')));
          return;
        } else if (types.AssignmentExpression.check(currentPath.parent.node)) {
          const leftPath = currentPath.parent.get('left');
          if (types.Identifier.check(leftPath.node) || types.Literal.check(leftPath.node)) {
            documentation.set('displayName', (0, _getNameOrValue2.default)(leftPath));
            return;
          }
        }
        currentPath = currentPath.parent;
      }
    }
    return;
  }
  displayNamePath = (0, _resolveToValue2.default)(displayNamePath);

  // If display name is defined as a getter we get a function expression as
  // value. In that case we try to determine the value from the return
  // statement.
  if (types.FunctionExpression.check(displayNamePath.node)) {
    displayNamePath = (0, _resolveFunctionDefinitionToReturnValue2.default)(displayNamePath);
  }
  if (!displayNamePath || !types.Literal.check(displayNamePath.node)) {
    return;
  }
  documentation.set('displayName', displayNamePath.node.value);
}