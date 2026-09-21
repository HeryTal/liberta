import argon2 from "argon2";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export type AdminSession = {
  isAdmin?: boolean;
  username?: string;
};

export class AdminAuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthConfigurationError";
  }
}

function getSessionOptions(): SessionOptions {
  const sessionPassword = process.env.SESSION_PASSWORD;

  if (!sessionPassword || sessionPassword.length < 32) {
    throw new AdminAuthConfigurationError(
      "SESSION_PASSWORD must contain at least 32 characters.",
    );
  }

  return {
    cookieName: "liberta_admin",
    password: sessionPassword ?? "development-only-session-password-change-me-32",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    },
  };
}

export async function getAdminSession() {
  return getIronSession<AdminSession>(await cookies(), getSessionOptions());
}

export async function requireAdmin(): Promise<
  AdminSession & { isAdmin: true; username: string }
> {
  const session = await getAdminSession();

  if (!session.isAdmin || !session.username) {
    throw new Error("ADMIN_AUTH_REQUIRED");
  }

  return {
    ...session,
    isAdmin: true,
    username: session.username,
  };
}

export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const passwordHash = decodePasswordHash();

  const missing = [
    !expectedUsername && "ADMIN_USERNAME",
    !passwordHash && "ADMIN_PASSWORD_HASH_B64",
  ].filter((name): name is string => Boolean(name));

  if (missing.length > 0) {
    throw new AdminAuthConfigurationError(
      `Missing admin environment variables: ${missing.join(", ")}`,
    );
  }

  function decodePasswordHash(): string | null {
    const encoded = process.env.ADMIN_PASSWORD_HASH_B64;

    if (encoded) {
      try {
        const decoded = Buffer.from(encoded, "base64").toString("utf8");
        return decoded.startsWith("$argon2id$") ? decoded : null;
      } catch {
        return null;
      }
    }

    const legacyHash = process.env.ADMIN_PASSWORD_HASH;
    return legacyHash?.startsWith("$argon2id$") ? legacyHash : null;
  }

  if (!expectedUsername || !passwordHash) {
    throw new AdminAuthConfigurationError("Admin authentication is incomplete.");
  }

  return username === expectedUsername && (await argon2.verify(passwordHash, password));
}
