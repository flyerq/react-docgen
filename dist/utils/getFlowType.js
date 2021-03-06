'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = getFlowType;

var _getPropertyName = require('./getPropertyName');

var _getPropertyName2 = _interopRequireDefault(_getPropertyName);

var _printValue = require('./printValue');

var _printValue2 = _interopRequireDefault(_printValue);

var _recast = require('recast');

var _recast2 = _interopRequireDefault(_recast);

var _getTypeAnnotation = require('../utils/getTypeAnnotation');

var _getTypeAnnotation2 = _interopRequireDefault(_getTypeAnnotation);

var _resolveToValue = require('../utils/resolveToValue');

var _resolveToValue2 = _interopRequireDefault(_resolveToValue);

var _resolveObjectKeysToArray = require('../utils/resolveObjectKeysToArray');

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

/* eslint no-use-before-define: 0 */

const types = _recast2.default.types.namedTypes;


const flowTypes = {
  AnyTypeAnnotation: 'any',
  BooleanTypeAnnotation: 'boolean',
  MixedTypeAnnotation: 'mixed',
  NullLiteralTypeAnnotation: 'null',
  NumberTypeAnnotation: 'number',
  StringTypeAnnotation: 'string',
  VoidTypeAnnotation: 'void'
};

const flowLiteralTypes = {
  BooleanLiteralTypeAnnotation: 1,
  NumberLiteralTypeAnnotation: 1,
  StringLiteralTypeAnnotation: 1
};

const namedTypes = {
  ArrayTypeAnnotation: handleArrayTypeAnnotation,
  GenericTypeAnnotation: handleGenericTypeAnnotation,
  ObjectTypeAnnotation: handleObjectTypeAnnotation,
  UnionTypeAnnotation: handleUnionTypeAnnotation,
  NullableTypeAnnotation: handleNullableTypeAnnotation,
  FunctionTypeAnnotation: handleFunctionTypeAnnotation,
  IntersectionTypeAnnotation: handleIntersectionTypeAnnotation,
  TupleTypeAnnotation: handleTupleTypeAnnotation,
  TypeofTypeAnnotation: handleTypeofTypeAnnotation
};

function getFlowTypeWithRequirements(path) {
  const type = getFlowTypeWithResolvedTypes(path);

  type.required = !path.parentPath.node.optional;

  return type;
}

function handleKeysHelper(path) {
  let value = path.get('typeParameters', 'params', 0);
  if (types.TypeofTypeAnnotation.check(value.node)) {
    value = value.get('argument', 'id');
  } else {
    value = value.get('id');
  }
  const resolvedPath = (0, _resolveToValue2.default)(value);
  if (resolvedPath && types.ObjectExpression.check(resolvedPath.node)) {
    const keys = (0, _resolveObjectKeysToArray.resolveObjectExpressionToNameArray)(resolvedPath, true);

    if (keys) {
      return {
        name: 'union',
        raw: (0, _printValue2.default)(path),
        elements: keys.map(key => ({ name: 'literal', value: key }))
      };
    }
  }

  return null;
}

function handleArrayTypeAnnotation(path) {
  return {
    name: 'Array',
    elements: [getFlowTypeWithResolvedTypes(path.get('elementType'))],
    raw: (0, _printValue2.default)(path)
  };
}

function handleGenericTypeAnnotation(path) {
  if (path.node.id.name === '$Keys' && path.node.typeParameters) {
    return handleKeysHelper(path);
  }

  let type;
  if (types.QualifiedTypeIdentifier.check(path.node.id)) {
    const id = path.get('id');

    if (id.node.qualification.name === 'React') {
      type = {
        name: `${id.node.qualification.name}${id.node.id.name}`,
        raw: (0, _printValue2.default)(id)
      };
    } else {
      type = { name: (0, _printValue2.default)(id).replace(/<.*>$/, '') };
    }
  } else {
    type = { name: path.node.id.name };
  }

  if (path.node.typeParameters) {
    const params = path.get('typeParameters').get('params');

    type = (0, _extends3.default)({}, type, {
      elements: params.map(param => getFlowTypeWithResolvedTypes(param)),
      raw: (0, _printValue2.default)(path)
    });
  } else {
    const resolvedPath = (0, _resolveToValue2.default)(path.get('id'));
    if (resolvedPath && resolvedPath.node.right) {
      type = getFlowTypeWithResolvedTypes(resolvedPath.get('right'));
    }
  }

  return type;
}

function handleObjectTypeAnnotation(path) {
  const type = {
    name: 'signature',
    type: 'object',
    raw: (0, _printValue2.default)(path),
    signature: { properties: [] }
  };

  path.get('callProperties').each(param => {
    type.signature.constructor = getFlowTypeWithResolvedTypes(param.get('value'));
  });

  path.get('indexers').each(param => {
    type.signature.properties.push({
      key: getFlowTypeWithResolvedTypes(param.get('key')),
      value: getFlowTypeWithRequirements(param.get('value'))
    });
  });

  path.get('properties').each(param => {
    type.signature.properties.push({
      key: (0, _getPropertyName2.default)(param),
      value: getFlowTypeWithRequirements(param.get('value'))
    });
  });

  return type;
}

function handleUnionTypeAnnotation(path) {
  return {
    name: 'union',
    raw: (0, _printValue2.default)(path),
    elements: path.get('types').map(subType => getFlowTypeWithResolvedTypes(subType))
  };
}

function handleIntersectionTypeAnnotation(path) {
  return {
    name: 'intersection',
    raw: (0, _printValue2.default)(path),
    elements: path.get('types').map(subType => getFlowTypeWithResolvedTypes(subType))
  };
}

function handleNullableTypeAnnotation(path) {
  const typeAnnotation = (0, _getTypeAnnotation2.default)(path);

  if (!typeAnnotation) return null;

  const type = getFlowTypeWithResolvedTypes(typeAnnotation);
  type.nullable = true;

  return type;
}

function handleFunctionTypeAnnotation(path) {
  const type = {
    name: 'signature',
    type: 'function',
    raw: (0, _printValue2.default)(path),
    signature: {
      arguments: [],
      return: getFlowTypeWithResolvedTypes(path.get('returnType'))
    }
  };

  path.get('params').each(param => {
    const typeAnnotation = (0, _getTypeAnnotation2.default)(param);
    if (!typeAnnotation) return;

    type.signature.arguments.push({
      name: param.node.name ? param.node.name.name : '',
      type: getFlowTypeWithResolvedTypes(typeAnnotation)
    });
  });

  return type;
}

function handleTupleTypeAnnotation(path) {
  const type = {
    name: 'tuple',
    raw: (0, _printValue2.default)(path),
    elements: []
  };

  path.get('types').each(param => {
    type.elements.push(getFlowTypeWithResolvedTypes(param));
  });

  return type;
}

function handleTypeofTypeAnnotation(path) {
  return getFlowTypeWithResolvedTypes(path.get('argument'));
}

let visitedTypes = {};

function getFlowTypeWithResolvedTypes(path) {
  const node = path.node;
  let type;

  const isTypeAlias = types.TypeAlias.check(path.parentPath.node);
  // When we see a typealias mark it as visited so that the next
  // call of this function does not run into an endless loop
  if (isTypeAlias) {
    if (visitedTypes[path.parentPath.node.id.name] === true) {
      // if we are currently visiting this node then just return the name
      // as we are starting to endless loop
      return { name: path.parentPath.node.id.name };
    } else if (typeof visitedTypes[path.parentPath.node.id.name] === 'object') {
      // if we already resolved the type simple return it
      return visitedTypes[path.parentPath.node.id.name];
    }
    // mark the type as visited
    visitedTypes[path.parentPath.node.id.name] = true;
  }

  if (types.FlowType.check(node)) {
    if (node.type in flowTypes) {
      type = { name: flowTypes[node.type] };
    } else if (node.type in flowLiteralTypes) {
      type = { name: 'literal', value: node.raw || `${node.value}` };
    } else if (node.type in namedTypes) {
      type = namedTypes[node.type](path);
    }
  }

  if (isTypeAlias) {
    // mark the type as unvisited so that further calls can resolve the type again
    visitedTypes[path.parentPath.node.id.name] = type;
  }

  if (!type) {
    type = { name: 'unknown' };
  }

  return type;
}

/**
 * Tries to identify the flow type by inspecting the path for known
 * flow type names. This method doesn't check whether the found type is actually
 * existing. It simply assumes that a match is always valid.
 *
 * If there is no match, "unknown" is returned.
 */
function getFlowType(path) {
  visitedTypes = {};
  return getFlowTypeWithResolvedTypes(path);
}