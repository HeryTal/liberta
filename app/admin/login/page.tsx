import { AdminLoginForm } from "@/lib/admin-login-form";
import { getLocale } from "@/lib/locale";
import { translations } from "@/lib/translations";

export default async function AdminLoginPage() {
  const t = translations[await getLocale()];
  return (
    <main className="admin-page">
      <div className="admin-heading">
        <p className="eyebrow">{t.privateAccess}</p>
        <h1>{t.moderation}</h1>
        <p>{t.authorized}</p>
      </div>
      <AdminLoginForm />
    </main>
  );
}
