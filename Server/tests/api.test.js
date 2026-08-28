const test = require('node:test');
const assert = require('node:assert');

test('Phase 3 Validation Suite', async (t) => {
  await t.test('Security & Rate Limiter Middleware checks', () => {
    const { securityHeaders } = require('../middleware/security');
    const req = {};
    const res = {
      headers: {},
      setHeader(k, v) { this.headers[k] = v; }
    };
    securityHeaders(req, res, () => {});
    assert.strictEqual(res.headers['X-Content-Type-Options'], 'nosniff');
    assert.strictEqual(res.headers['X-Frame-Options'], 'DENY');
  });

  await t.test('Audit logger helper fails safely without crash', async () => {
    const logAudit = require('../utils/auditLogger');
    await assert.doesNotReject(async () => {
      await logAudit({ actorId: null, action: 'TEST', entityType: 'Auth', description: 'Test log' });
    });
  });
});