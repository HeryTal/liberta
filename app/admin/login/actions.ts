"use server";

import { redirect } from "next/navigation";
import {
  AdminAuthConfigurationError,
  getAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export type AdminLoginState = {
  status: "idle" | "error";
  message: string;
};

export async function loginAdmin(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const username = readText(formData.get("username"));
  const password = readText(formData.get("password"));

  try {
    const valid = await verifyAdminCredentials(username, password);

    if (!valid) {
      return { status: "error", message: "Identifiant ou mot de passe incorrect." };
    }

    const session = await getAdminSession();
    session.isAdmin = true;
    session.username = username;
    await session.save();
  } catch (error) {
    console.error("[admin-login] authentication failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : "Unknown error",
    });

    if (error instanceof AdminAuthConfigurationError) {
      return {
        status: "error",
        message:
          "La configuration admin est incomplète. Vérifiez SESSION_PASSWORD, ADMIN_USERNAME et ADMIN_PASSWORD_HASH_B64 dans .env.",
      };
    }

    return {
      status: "error",
      message: "La connexion administrateur n’est pas configurée ou est indisponible.",
    };
  }

  redirect("/admin/moderation");
}

function readText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}
