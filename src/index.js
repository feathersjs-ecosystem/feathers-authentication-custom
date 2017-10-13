import Debug from 'debug';
import merge from 'lodash.merge';
import omit from 'lodash.omit';
import pick from 'lodash.pick';
import { Strategy } from 'passport-custom';

const debug = Debug('feathers-authentication-custom');
const defaults = {
  name: 'custom'
};
const KEYS = [
  'custom'
];

export default function init (options = {}) {
  return function customAuth () {
    const app = this;
    const _super = app.setup;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before feathers-authentication-custom?`);
    }

    // options must be a function or object with a Verifier property
    let isSimpleFunction = typeof options === 'function';
    let Verifier = isSimpleFunction ? options : options && options.Verifier;
    if (!Verifier) {
      throw new Error(`You must pass a custom verifier function or Verifier class to feathers-authentication-custom`);
    }

    let authOptions = app.get('auth') || app.get('authentication') || {};
    let customOptions = authOptions[options.name] || {};
    let customSettings = merge({}, defaults, pick(authOptions, KEYS), customOptions, omit(options, ['Verifier']));

    app.setup = function () {
      let result = _super.apply(this, arguments);
      let verifier = null;

      if (isSimpleFunction) {
        verifier = { app, verify: Verifier };
      } else {
        verifier = new Verifier(app, customSettings);

        if (!verifier.verify) {
          throw new Error(`Your verifier must implement a 'verify' function.`);
        }
      }

      // Register 'jwt' strategy with passport
      debug('Registering custom authentication strategy');
      app.passport.use(customSettings.name, new Strategy(verifier.verify.bind(verifier)));
      app.passport.options(customSettings.name, customSettings);

      return result;
    };
  };
}
