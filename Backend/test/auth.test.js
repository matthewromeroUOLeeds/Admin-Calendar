const { test } = require('node:test');
const assert = require('node:assert/strict');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { createApp } = require('../server');

const origin = 'http://localhost:5173';
const password = 'a-test-password-only';
const protectedPaths = [
    ['GET', '/ScheduleData'], ['GET', '/getSchedule/1'],
    ['GET', '/getTeachers'], ['GET', '/getClassInfo/1'], ['GET', '/getStudents'],
    ['DELETE', '/deleteClass/1'], ['POST', '/postStudent'], ['POST', '/postTeacher'],
    ['POST', '/postClass'], ['POST', '/postClassesTaken']
];

async function fixture(t, production = false) {
    const hash = await bcrypt.hash(password, 4);
    let calendarQueries = 0;
    const db = {
        promise: () => ({ query: async () => [[{ id: 1, email: 'admin@example.test', password_hash: hash }]] }),
        query: (sql, params, callback) => {
            calendarQueries++;
            (typeof params === 'function' ? params : callback)(null, [{ studentID: 1 }]);
        }
    };
    const store = new session.MemoryStore();
    const app = createApp(db, { store, secret: 'test-secret-that-is-over-thirty-two-characters', frontendUrl: origin, production });
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    t.after(() => new Promise(resolve => server.close(resolve)));
    const base = `http://127.0.0.1:${server.address().port}`;
    const send = (path, options = {}) => fetch(base + path, options);
    const login = (pw = password, extra = {}) => send('/auth/login', {
        method: 'POST', headers: { Origin: origin, 'X-Requested-With': 'AdminCalendar', 'Content-Type': 'application/json', ...extra },
        body: JSON.stringify({ email: 'admin@example.test', password: pw })
    });
    return { send, login, queries: () => calendarQueries, store };
}

test('all real calendar routes reject unauthenticated requests before querying the database', async t => {
    const { send, queries } = await fixture(t);
    for (const [method, path] of protectedPaths) {
        const result = await send(path, { method, headers: { Origin: origin, 'X-Requested-With': 'AdminCalendar' } });
        assert.equal(result.status, 401, `${method} ${path}`);
    }
    assert.equal(queries(), 0);
    assert.equal((await send('/health')).status, 200);
});

test('wrong password fails; login persists; logout invalidates the old cookie', async t => {
    const { send, login, queries } = await fixture(t);
    assert.equal((await login('wrong-password')).status, 401);
    const result = await login();
    assert.equal(result.status, 200);
    const cookie = result.headers.get('set-cookie');
    assert.match(cookie, /HttpOnly/i);
    const headers = { Cookie: cookie.split(';')[0] };
    assert.equal((await send('/auth/session', { headers })).status, 200);
    assert.equal((await send('/getStudents', { headers })).status, 200);
    assert.equal(queries(), 1);
    assert.equal((await send('/auth/logout', { method: 'POST', headers: { ...headers, Origin: origin, 'X-Requested-With': 'AdminCalendar' } })).status, 204);
    assert.equal((await send('/getStudents', { headers })).status, 401);
});

test('mutations and login require both trusted origin and custom header', async t => {
    const { send, queries } = await fixture(t);
    for (const path of ['/auth/login', '/auth/logout', '/postStudent', '/deleteClass/1']) {
        for (const headers of [{}, { Origin: 'https://attacker.example', 'X-Requested-With': 'AdminCalendar' }, { Origin: origin }]) {
            assert.equal((await send(path, { method: path.includes('delete') ? 'DELETE' : 'POST', headers })).status, 403);
        }
    }
    assert.equal(queries(), 0);
});

test('login rate limiting rejects repeated attempts', async t => {
    const { login } = await fixture(t);
    for (let i = 0; i < 10; i++) assert.equal((await login('wrong')).status, 401);
    assert.equal((await login()).status, 429);
});

test('production cookie is Secure, HttpOnly, host-only and session IDs rotate', async t => {
    const { send, login } = await fixture(t, true);
    const first = await login(password, { 'X-Forwarded-Proto': 'https' });
    const cookie = first.headers.get('set-cookie');
    assert.match(cookie, /^__Host-admin_session=/);
    assert.match(cookie, /; Secure/);
    assert.match(cookie, /; HttpOnly/);
    assert.match(cookie, /; SameSite=None/);
    assert.doesNotMatch(cookie, /; Domain=/);
    const second = await login(password, { 'X-Forwarded-Proto': 'https', Cookie: cookie.split(';')[0] });
    assert.notEqual(second.headers.get('set-cookie').split(';')[0], cookie.split(';')[0]);
    assert.equal((await send('/auth/session', { headers: { Cookie: cookie.split(';')[0] } })).status, 401);
});

test('expired sessions cannot access data', async t => {
    const { send, login, store } = await fixture(t);
    const result = await login();
    const headers = { Cookie: result.headers.get('set-cookie').split(';')[0] };
    for (const key of Object.keys(store.sessions)) {
        const value = JSON.parse(store.sessions[key]);
        value.cookie.expires = new Date(Date.now() - 1000).toISOString();
        store.sessions[key] = JSON.stringify(value);
    }
    assert.equal((await send('/getStudents', { headers })).status, 401);
});
