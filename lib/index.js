'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.actions = exports.startPlugin = undefined;

var _startPlugin = require('./startPlugin');

var _startPlugin2 = _interopRequireDefault(_startPlugin);

var _actions = require('./actions');

var actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.startPlugin = _startPlugin2.default;
exports.actions = actions;