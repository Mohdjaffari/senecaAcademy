import { getSession, SessionPayload } from "./session";
import { AuthenticationError, AuthorizationError } from "../utils/errors";
import { UserRole, Permission, hasPermission } from "./permissions";

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new AuthenticationError("Authentication required. Please log in.");
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new AuthorizationError(
      `Access denied. Allowed roles: ${allowedRoles.join(", ")}.`
    );
  }
  return session;
}

export async function requirePermission(permission: Permission): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!hasPermission(session.role, permission) && !session.permissions?.includes(permission)) {
    throw new AuthorizationError(
      `Access denied. Missing required permission: '${permission}'.`
    );
  }
  return session;
}

export async function requireSchoolAccess(targetSchoolId: string): Promise<SessionPayload> {
  const session = await requireAuth();
  if (session.role === "super_admin") return session;
  if (session.schoolId !== targetSchoolId) {
    throw new AuthorizationError("Access denied to requested school tenant.");
  }
  return session;
}
