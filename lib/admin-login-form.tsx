"use client";

import { useActionState } from "react";
import { loginAdmin, type AdminLoginState } from "@/app/admin/login/actions";

const initialState: AdminLoginState = { status: "idle", message: "" };

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, initialState);

  return (
    <form className="admin-login-form" action={action}>
      {state.message ? (
        <div className="form-message form-error" role="alert">
          {state.message}
        </div>
      ) : null}
      <div className="form-field">
        <label htmlFor="username">Identifiant administrateur</label>
        <input id="username" name="username" required autoComplete="username" />
      </div>
      <div className="form-field">
        <label htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <button className="admin-submit" type="submit" disabled={pending}>
        {pending ? "VÉRIFICATION..." : "OUVRIR LA MODÉRATION ↗"}
      </button>
    </form>
  );
}
