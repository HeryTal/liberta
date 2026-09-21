import { redirect } from "next/navigation";
import { AdminPendingList } from "@/lib/admin-pending-list";
import { getAdminSession } from "@/lib/admin-auth";
import { getPendingPublications } from "@/lib/admin-moderation";
import { AdminReportList } from "@/lib/admin-report-list";
import { getPublishedPublication } from "@/lib/publications";
import { getPendingReports } from "@/lib/reports";
import { AdminModerationLog } from "@/lib/admin-moderation-log";
import { getRecentModerationLogs } from "@/lib/moderation-log";

export const dynamic = "force-dynamic";

export default async function AdminModerationPage() {
  const session = await getAdminSession();

  if (!session.isAdmin || !session.username) {
    redirect("/admin/login");
  }

  const publications = await getPendingPublications();
  const reports = await getPendingReports();
  const logs = await getRecentModerationLogs();
  const reportsWithPublications = await Promise.all(
    reports.map(async (report) => ({
      report,
      publication: await getPublishedPublication(report.publicationId),
    })),
  );

  return (
    <main className="admin-page">
      <div className="admin-topline">
        <div>
          <p className="eyebrow">LIBERTA / FILE DE MODÉRATION</p>
          <h1>En attente.</h1>
        </div>
        <span>{session.username}</span>
      </div>
      <AdminPendingList publications={publications} />
      <section className="admin-reports-section">
        <div className="admin-section-heading">
          <p className="eyebrow">SIGNALEMENTS VISITEURS</p>
          <h2>À examiner.</h2>
        </div>
        <AdminReportList reports={reportsWithPublications} />
      </section>
      <section className="admin-reports-section">
        <div className="admin-section-heading">
          <p className="eyebrow">HISTORIQUE PRIVÉ</p>
          <h2>Décisions.</h2>
        </div>
        <AdminModerationLog logs={logs} />
      </section>
    </main>
  );
}
