export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export async function apiFetch(url, options = {}) {
    const headers = new Headers(options.headers);
    headers.set('X-Requested-With', 'AdminCalendar');
    const response = await fetch(url, { ...options, headers, credentials: 'include' });
    if (response.status === 401 && !url.includes('/auth/')) {
        window.dispatchEvent(new Event('session-expired'));
        throw new Error('Your session expired. Please sign in again.');
    }
    return response;
}


