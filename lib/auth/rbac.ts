import { SessionUser } from "./session";

export type Role = "admin" | "faturador";

export function requireAuth(user: SessionUser | null): SessionUser {
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function requireRole(
  user: SessionUser | null,
  allowedRoles: Role[]
): SessionUser {
  const authUser = requireAuth(user);
  if (!allowedRoles.includes(authUser.role)) {
    throw new Error("Forbidden");
  }
  return authUser;
}

export function requireAdmin(user: SessionUser | null): SessionUser {
  return requireRole(user, ["admin"]);
}

