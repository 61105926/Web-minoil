const { test } = require('node:test');
const assert = require('node:assert/strict');
const { generateKeyPairSync } = require('node:crypto');
const jwt = require('jsonwebtoken');
require('reflect-metadata');

const issuer = 'https://auth.minoil.com.bo/realms/Minoil';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const verificationKey = publicKey.export({ type: 'spki', format: 'pem' });
// Sustituir solo la consulta remota de claves; conservar la validación JWT real.
const jwks = require('jwks-rsa');
require.cache[require.resolve('jwks-rsa')].exports = {
  ...jwks,
  passportJwtSecret(options) {
    assert.equal(options.jwksUri, `${issuer}/protocol/openid-connect/certs`);
    return (_req, _token, done) => done(null, verificationKey);
  },
};
const { JwtStrategy } = require('../dist/auth/jwt.strategy');
const { MobileJwtStrategy } = require('../dist/mobile-auth/mobile-jwt.strategy');

function authenticate(StrategyClass, token) {
  return new Promise((resolve, reject) => {
    const strategy = new StrategyClass();
    strategy.success = user => resolve({ user });
    strategy.fail = info => resolve({ error: info });
    strategy.error = reject;
    strategy.authenticate({ headers: { authorization: `Bearer ${token}` } });
  });
}

for (const StrategyClass of [JwtStrategy, MobileJwtStrategy]) {
  test(`${StrategyClass.name}: acepta Minoil y rechaza otro issuer, vencimiento y firma inválida`, async () => {
    const sign = (options = {}, key = privateKey) => jwt.sign(
      { sub: 'test-user', preferred_username: 'prueba' }, key,
      { algorithm: 'RS256', issuer, audience: 'account', expiresIn: '5m', ...options },
    );
    assert.equal((await authenticate(StrategyClass, sign())).user.userId, 'test-user');
    assert((await authenticate(StrategyClass, sign({ issuer: issuer.replace('Minoil', 'minoil') }))).error);
    assert((await authenticate(StrategyClass, sign({ expiresIn: -1 }))).error);
    const otherKey = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
    assert((await authenticate(StrategyClass, sign({}, otherKey))).error);
    if (StrategyClass === JwtStrategy) {
      assert((await authenticate(StrategyClass, sign({ audience: 'otro-cliente' }))).error);
    }
  });
}
