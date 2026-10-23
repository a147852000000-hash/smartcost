// Compatibility bridge for imported SMART-TIME chat components.
// Does not create a session or grant access. A valid SMART-TIME session must be provided by a future unified auth flow.
export interface AuthSession { token: string; user?: { id?: string; name?: string; email?: string; avatar?: string } }
export function getStoredSession(): AuthSession | null { try { return JSON.parse(localStorage.getItem('smart_time_auth_session') || 'null'); } catch { return null; } }
export function authHeaders(): Record<string,string> { const session=getStoredSession(); return session?.token ? { Authorization: `Bearer ${session.token}` } : {}; }
