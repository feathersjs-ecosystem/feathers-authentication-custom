import feathers from 'feathers';
import authentication from 'feathers-authentication';
import hooks from 'feathers-hooks';
import custom from '../src';
import { expect } from 'chai';

describe('integration', () => {
  let app, user, req;

  beforeEach(() => {
    user = { name: 'David' };
    req = {
      query: {},
      body: {},
      headers: {},
      cookies: {}
    };

    app = feathers();
    app.configure(hooks())
      .configure(authentication({ secret: 'supersecret' }));
  });

  it('works with a simple verifier function', () => {
    app.configure(custom((req, done) => {
      done(null, user);
    }));

    app.setup();

    return app.authenticate('custom')(req).then(result => {
      expect(result.success).to.equal(true);
      expect(result.data.user.name).to.equal(user.name);
    });
  });

  it('exposes the app on `this` for simple verifier functions', (testDone) => {
    app.configure(custom(function (req, done) {
      expect(this.app).to.equal(app);
      testDone();
    }));

    app.setup();

    app.authenticate('custom')(req).catch(testDone);
  });

  it('works with a verifier class', () => {
    class Verifier {
      verify (req, done) {
        done(null, user);
      }
    }
    app.configure(custom({ Verifier }));

    app.setup();

    return app.authenticate('custom')(req).then(result => {
      expect(result.success).to.equal(true);
      expect(result.data.user.name).to.equal(user.name);
    });
  });
});
