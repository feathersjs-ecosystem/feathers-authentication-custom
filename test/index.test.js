/* eslint-disable no-unused-expressions */

import feathers from 'feathers';
// import memory from 'feathers-memory';
import authentication from 'feathers-authentication';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import passportCustom from 'passport-custom';
import custom from '../src';

chai.use(sinonChai);

describe('feathers-authentication-custom', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib')).to.equal('function');
  });

  it('basic functionality', () => {
    expect(typeof custom).to.equal('function');
  });

  describe('initialization', () => {
    let app;

    beforeEach(() => {
      app = feathers();
      app.configure(authentication({ secret: 'supersecret' }));
    });

    it('throws an error if passport has not been registered', () => {
      expect(() => {
        app = feathers();
        app.configure(custom(() => {}));
      }).to.throw();
    });

    it('throws if a verifier function is not supplied', () => {
      expect(() => {
        app.configure(custom());
      }).to.throw();
    });

    it('throws if a Verifier class is not supplied', () => {
      expect(() => {
        app.configure(custom({ Verifier: false }));
      }).to.throw();
    });

    it('throws if a Verifier class does not implement `verify` method', () => {
      expect(() => {
        app.configure(custom({ Verifier: () => {} }));
        app.setup();
      }).to.throw();
    });

    it('passes the app and settings to the Verifier class constructor', (testDone) => {
      class Verifier {
        constructor(_app, settings) {
          expect(_app).to.equal(app);
          expect(settings.custom.foo).to.equal('bar');
          testDone();
        }
        verify() {}
      }
      const authOptions = app.get('authentication');
      authOptions.custom = { foo: 'bar' };
      app.set('authentication', authOptions);

      app.configure(custom({ Verifier }));
      app.setup();
    });
  });

  describe('passport registration', () => {
    let app;

    beforeEach(() => {
      app = feathers();
      app.configure(authentication({ secret: 'supersecret' }));
    });

    it('registers the custom passport strategy', () => {
      sinon.spy(app.passport, 'use');
      sinon.spy(passportCustom, 'Strategy');
      app.configure(custom(() => {}));
      app.setup();

      expect(app.passport.use).to.have.been.calledWith('custom');
      expect(passportCustom.Strategy).to.have.been.calledOnce;

      app.passport.use.restore();
      passportCustom.Strategy.restore();
    });

    it('registers the strategy options', () => {
      sinon.spy(app.passport, 'options');
      app.configure(custom(() => {}));
      app.setup();

      expect(app.passport.options).to.have.been.calledOnce;

      app.passport.options.restore();
    });
  });
});
