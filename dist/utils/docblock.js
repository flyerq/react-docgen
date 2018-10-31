'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

exports.getDocblock = getDocblock;
exports.getDoclets = getDoclets;

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

/**
 * Helper functions to work with docblock comments.
 */

const DOCLET_PATTERN = /^@(\w+)(?:$|\s((?:[^](?!^@\w))*))/gim;

function parseDocblock(str) {
  const lines = str.split('\n');
  for (let i = 0, l = lines.length; i < l; i++) {
    lines[i] = lines[i].replace(/^\s*\*\s?/, '');
  }
  return lines.join('\n').trim();
}

const DOCBLOCK_HEADER = /^\*\s/;

/**
 * Given a path, this function returns the closest preceding docblock if it
 * exists.
 */
function getDocblock(path, trailing = false) {
  let comments = [];
  let inlineComments = [];

  // 块级注释
  if (trailing && path.node.trailingComments) {
    comments = path.node.trailingComments.filter(comment => comment.type === 'CommentBlock' && DOCBLOCK_HEADER.test(comment.value));
  } else if (path.node.leadingComments) {
    comments = path.node.leadingComments.filter(comment => comment.type === 'CommentBlock' && DOCBLOCK_HEADER.test(comment.value));
  } else if (path.node.comments) {
    comments = path.node.comments.filter(comment => comment.leading && comment.type === 'CommentBlock' && DOCBLOCK_HEADER.test(comment.value));
  }

  // 行内注释
  if (trailing && path.node.trailingComments) {
    inlineComments = path.node.trailingComments.filter(comment => comment.type === 'CommentLine');
  } else if (path.node.leadingComments) {
    inlineComments = path.node.leadingComments.filter(comment => comment.type === 'CommentLine');
  } else if (path.node.comments) {
    inlineComments = path.node.comments.filter(comment => comment.leading && comment.type === 'CommentLine');
  }

  if (comments.length > 0) {
    return parseDocblock(comments[comments.length - 1].value);
  } else if (inlineComments.length > 0) {
    // 合并行内样式
    return inlineComments.map(comment => comment.value.trim()).join('\n');
  }
  return null;
}

/**
 * Given a string, this functions returns an object with doclet names as keys
 * and their "content" as values.
 */
function getDoclets(str) {
  const doclets = (0, _create2.default)(null);
  let match = DOCLET_PATTERN.exec(str);

  for (; match; match = DOCLET_PATTERN.exec(str)) {
    doclets[match[1]] = match[2] || true;
  }

  return doclets;
}