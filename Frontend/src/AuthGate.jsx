import { useEffect, useState } from 'react';
import { API_URL, apiFetch } from './api';
import './styles/Auth.css';

export default function AuthGate({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        async function restoreSession() {
            try {
                const response = await apiFetch(`${API_URL}/auth/session`);
                if (response.ok) {
                    const data = await response.json();
                    if (active) setAdmin(data.admin);
                } else if (response.status !== 401) {
                    throw new Error('Session check failed');
                }
            } catch {
                if (active) setError('Cannot reach the server. Please try signing in again.');
            } finally {
                if (active) setLoading(false);
            }
        }
        function expire() {
            setAdmin(null);
            setError('Your session expired. Please sign in again.');
        }
        restoreSession();
        window.addEventListener('session-expired', expire);
        return () => { active = false; window.removeEventListener('session-expired', expire); };
    }, []);

    async function login(event) {
        event.preventDefault();
        setBusy(true);
        setError('');
        try {
            const response = await apiFetch(`${API_URL}/auth/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Unable to sign in');
            // Verify the browser accepted the cookie before mounting any calendar components.
            const check = await apiFetch(`${API_URL}/auth/session`);
            if (!check.ok) throw new Error('The browser blocked the session cookie. Use the same-origin deployment described in AUTH_SETUP.md.');
            setPassword('');
            setAdmin(data.admin);
        } catch (err) {
            setError(err.message || 'Unable to sign in');
        } finally { setBusy(false); }
    }

    async function logout() {
        setBusy(true);
        setError('');
        try {
            const response = await apiFetch(`${API_URL}/auth/logout`, { method: 'POST' });
            if (!response.ok) throw new Error('Unable to log out. Please try again.');
            setAdmin(null);
        } catch (err) { setError(err.message); }
        finally { setBusy(false); }
    }

    if (loading) return <main className="auth-page" role="status">Checking your session…</main>;
    if (admin) return <>
        <header className="auth-bar"><span>Signed in as {admin.email}</span>
            <button type="button" disabled={busy} onClick={logout}>Log out</button></header>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {children}
    </>;
    return <main className="auth-page">
        <form className="auth-card" onSubmit={login}>
            <h1>Admin Calendar</h1>
            <p>Sign in to manage your classes, students and teachers.</p>
            <label htmlFor="admin-email">Email</label>
            <input id="admin-email" type="email" autoComplete="username" required
                maxLength={254} value={email} onChange={e => setEmail(e.target.value)} />
            <label htmlFor="admin-password">Password</label>
            <input id="admin-password" type="password" autoComplete="current-password" required
                maxLength={72} value={password} onChange={e => setPassword(e.target.value)} />
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
    </main>;
}
