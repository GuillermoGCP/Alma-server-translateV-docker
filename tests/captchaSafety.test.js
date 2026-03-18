import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as routes from '../src/routes/index.js';
import * as controllers from '../src/controllers/index.js';

describe('Captcha Removal Safety', () => {
  it('should not export captcha router', () => {
    assert.strictEqual(routes.captcha, undefined, 'Captcha router should be removed from routes index');
  });

  it('should not export captcha controllers', () => {
    assert.strictEqual(controllers.generateCaptcha, undefined, 'generateCaptcha should be removed from controllers index');
    assert.strictEqual(controllers.validateCaptcha, undefined, 'validateCaptcha should be removed from controllers index');
  });

  it('should still export essential routers', () => {
    assert.notStrictEqual(routes.contact, undefined);
    assert.notStrictEqual(routes.forms, undefined);
    assert.notStrictEqual(routes.login, undefined);
  });
});
