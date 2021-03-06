'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isStatelessComponent;

var _getPropertyValuePath = require('./getPropertyValuePath');

var _getPropertyValuePath2 = _interopRequireDefault(_getPropertyValuePath);

var _isReactComponentClass = require('./isReactComponentClass');

var _isReactComponentClass2 = _interopRequireDefault(_isReactComponentClass);

var _isReactCreateClassCall = require('./isReactCreateClassCall');

var _isReactCreateClassCall2 = _interopRequireDefault(_isReactCreateClassCall);

var _isReactCreateElementCall = require('./isReactCreateElementCall');

var _isReactCreateElementCall2 = _interopRequireDefault(_isReactCreateElementCall);

var _isReactCloneElementCall = require('./isReactCloneElementCall');

var _isReactCloneElementCall2 = _interopRequireDefault(_isReactCloneElementCall);

var _isReactChildrenElementCall = require('./isReactChildrenElementCall');

var _isReactChildrenElementCall2 = _interopRequireDefault(_isReactChildrenElementCall);

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

const types = _recast2.default.types.namedTypes;


const validPossibleStatelessComponentTypes = ['Property', 'FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'];

function isJSXElementOrReactCall(path) {
  return path.node.type === 'JSXElement' || path.node.type === 'JSXFragment' || path.node.type === 'CallExpression' && (0, _isReactCreateElementCall2.default)(path) || path.node.type === 'CallExpression' && (0, _isReactCloneElementCall2.default)(path) || path.node.type === 'CallExpression' && (0, _isReactChildrenElementCall2.default)(path);
}

function resolvesToJSXElementOrReactCall(path) {
  // Is the path is already a JSX element or a call to one of the React.* functions
  if (isJSXElementOrReactCall(path)) {
    return true;
  }

  const resolvedPath = (0, _resolveToValue2.default)(path);

  // If the path points to a conditional expression, then we need to look only at
  // the two possible paths
  if (resolvedPath.node.type === 'ConditionalExpression') {
    return resolvesToJSXElementOrReactCall(resolvedPath.get('consequent')) || resolvesToJSXElementOrReactCall(resolvedPath.get('alternate'));
  }

  // If the path points to a logical expression (AND, OR, ...), then we need to look only at
  // the two possible paths
  if (resolvedPath.node.type === 'LogicalExpression') {
    return resolvesToJSXElementOrReactCall(resolvedPath.get('left')) || resolvesToJSXElementOrReactCall(resolvedPath.get('right'));
  }

  // Is the resolved path is already a JSX element or a call to one of the React.* functions
  // Only do this if the resolvedPath actually resolved something as otherwise we did this check already
  if (resolvedPath !== path && isJSXElementOrReactCall(resolvedPath)) {
    return true;
  }

  // If we have a call expression, lets try to follow it
  if (resolvedPath.node.type === 'CallExpression') {
    let calleeValue = (0, _resolveToValue2.default)(resolvedPath.get('callee'));

    if (returnsJSXElementOrReactCall(calleeValue)) {
      return true;
    }

    let resolvedValue;

    const namesToResolve = [calleeValue.get('property')];

    if (calleeValue.node.type === 'MemberExpression') {
      if (calleeValue.get('object').node.type === 'Identifier') {
        resolvedValue = (0, _resolveToValue2.default)(calleeValue.get('object'));
      } else if (types.MemberExpression.check(calleeValue.node)) {
        do {
          calleeValue = calleeValue.get('object');
          namesToResolve.unshift(calleeValue.get('property'));
        } while (types.MemberExpression.check(calleeValue.node));

        resolvedValue = (0, _resolveToValue2.default)(calleeValue.get('object'));
      }
    }

    if (resolvedValue && types.ObjectExpression.check(resolvedValue.node)) {
      const resolvedMemberExpression = namesToResolve.reduce((result, nodePath) => {
        if (!nodePath) {
          return result;
        }

        if (result) {
          result = (0, _getPropertyValuePath2.default)(result, nodePath.node.name);
          if (result && types.Identifier.check(result.node)) {
            return (0, _resolveToValue2.default)(result);
          }
        }
        return result;
      }, resolvedValue);

      if (!resolvedMemberExpression || returnsJSXElementOrReactCall(resolvedMemberExpression)) {
        return true;
      }
    }
  }

  return false;
}

function returnsJSXElementOrReactCall(path) {
  let visited = false;

  // early exit for ArrowFunctionExpressions
  if (path.node.type === 'ArrowFunctionExpression' && path.get('body').node.type !== 'BlockStatement' && resolvesToJSXElementOrReactCall(path.get('body'))) {
    return true;
  }

  let scope = path.scope;
  // If we get a property we want the function scope it holds and not its outer scope
  if (path.node.type === 'Property') {
    scope = path.get('value').scope;
  }

  _recast2.default.visit(path, {
    visitReturnStatement(returnPath) {
      // Only check return statements which are part of the checked function scope
      if (returnPath.scope !== scope) return false;

      if (resolvesToJSXElementOrReactCall(returnPath.get('argument'))) {
        visited = true;
        return false;
      }

      this.traverse(returnPath);
    }
  });

  return visited;
}

/**
 * Returns `true` if the path represents a function which returns a JSXElement
 */
function isStatelessComponent(path) {
  const node = path.node;

  if (validPossibleStatelessComponentTypes.indexOf(node.type) === -1) {
    return false;
  }

  if (node.type === 'Property') {
    if ((0, _isReactCreateClassCall2.default)(path.parent) || (0, _isReactComponentClass2.default)(path.parent)) {
      return false;
    }
  }

  if (returnsJSXElementOrReactCall(path)) {
    return true;
  }

  return false;
}