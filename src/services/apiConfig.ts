// Chat API remains same-origin by default. Configure VITE_CHAT_API_URL only after backend/auth integration is tested.
const RAW_BASE = (import.meta.env.VITE_CHAT_API_URL || '').trim();
export const API_BASE_URL = RAW_BASE.replace(/\\/+$/, '');
export function apiUrl(path: string): string { if (!path.startsWith('/')) path = `/${path}`; return API_BASE_URL ? `${API_BASE_URL}${path}` : path; }
export function wsUrl(path: string): string { if (!path.startsWith('/')) path = `/${path}`; if (API_BASE_URL) return `${API_BASE_URL.replace(/^http/, 'ws')}${path}`; if (typeof window === 'undefined') return path; const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'; return `${protocol}//${window.location.host}${path}`; }
