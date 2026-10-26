type AuthResult = { ok: boolean; message?: string; emailSent?: boolean };
const demoNotice = "وضع المعاينة: ربط المصادقة الفعلية لم يُفعّل في هذه النسخة.";
export async function forgotPassword(_email: string): Promise<AuthResult> { return { ok: false, message: demoNotice }; }
export async function loginWithIdentifier(_identifier: string, _password: string): Promise<any> { throw new Error(demoNotice); }
export async function registerWithEmail(_name: string, _username: string, _email: string, _password: string, _challenge?: string): Promise<any> { throw new Error(demoNotice); }
export async function resetPassword(_email: string, _code: string, _password: string, _challenge?: string): Promise<any> { throw new Error(demoNotice); }
export async function selectLoginRole(_ticket: string, _role: string): Promise<any> { throw new Error(demoNotice); }
