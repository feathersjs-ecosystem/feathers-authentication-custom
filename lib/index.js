'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _lodash = require('lodash.merge');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.omit');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.pick');

var _lodash6 = _interopRequireDefault(_lodash5);

var _passportCustom = require('passport-custom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('feathers-authentication-custom');
var defaults = {
  name: 'custom'
};
var KEYS = ['custom'];

function init() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return function customAuth() {
    var app = this;
    var _super = app.setup;

    if (!app.passport) {
      throw new Error('Can not find app.passport. Did you initialize feathers-authentication before feathers-authentication-custom?');
    }

    // options must be a function or object with a Verifier property
    var isSimpleFunction = typeof options === 'function';
    var Verifier = isSimpleFunction ? options : options && options.Verifier;
    if (!Verifier) {
      throw new Error('You must pass a custom verifier function or Verifier class to feathers-authentication-custom');
    }

    var authOptions = app.get('auth') || app.get('authentication') || {};
    var customOptions = authOptions[options.name] || {};
    var customSettings = (0, _lodash2.default)({}, defaults, (0, _lodash6.default)(authOptions, KEYS), customOptions, (0, _lodash4.default)(options, ['Verifier']));

    app.setup = function () {
      var result = _super.apply(this, arguments);
      var verifier = null;

      if (isSimpleFunction) {
        verifier = { app: app, verify: Verifier };
      } else {
        verifier = new Verifier(app, customSettings);

        if (!verifier.verify) {
          throw new Error('Your verifier must implement a \'verify\' function.');
        }
      }

      // Register 'jwt' strategy with passport
      debug('Registering custom authentication strategy');
      app.passport.use(customSettings.name, new _passportCustom.Strategy(verifier.verify.bind(verifier)));
      app.passport.options(customSettings.name, customSettings);

      return result;
    };
  };
}
module.exports = exports['default'];