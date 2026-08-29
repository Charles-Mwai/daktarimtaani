import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'daktari-mtaani-secret-key-pilot-2026-kenya';

export interface AuthSession {
  userId: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  phone: string;
  name: string;
  doctorId?: string;
  patientId?: string;
}

/** Each portal gets its own isolated cookie so logging in as a doctor
 *  in one browser tab never pollutes the patient session in another tab. */
export const ROLE_COOKIE: Record<string, string> = {
  PATIENT: 'daktari_patient_session',
  DOCTOR: 'daktari_doctor_session',
  ADMIN: 'daktari_admin_session',
};

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: AuthSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch (e) {
    return null;
  }
}

/** Read the session for the active portal based on which cookie is set.
 *  Checks PATIENT → DOCTOR → ADMIN in order and returns the first valid session. */
export async function getCurrentSession(role?: 'PATIENT' | 'DOCTOR' | 'ADMIN'): Promise<AuthSession | null> {
  const cookieStore = cookies();

  if (role) {
    // If a specific role is requested, check only that cookie
    const token = cookieStore.get(ROLE_COOKIE[role])?.value;
    if (!token) return null;
    return verifyToken(token);
  }

  // Auto-detect: check all three role cookies and return whichever is set
  for (const cookieName of Object.values(ROLE_COOKIE)) {
    const token = cookieStore.get(cookieName)?.value;
    if (token) {
      const session = verifyToken(token);
      if (session) return session;
    }
  }

  return null;
}

/** Helper to read the session from request headers (for middleware / route handlers
 *  that receive the role in the request body or query). */
export function getSessionFromRequest(req: NextRequest, role?: string): AuthSession | null {
  const cookieName = role ? ROLE_COOKIE[role] : undefined;
  if (!cookieName) return null;
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;
  return verifyToken(token);
}
