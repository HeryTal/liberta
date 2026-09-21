import { formatDate } from "@/lib/format-date";
import type { Publication } from "@/lib/publications";
import type { Report } from "@/lib/reports";
import { reviewReport } from "@/app/admin/moderation/actions";

type ReportWithPublication = {
  report: Report;
  publication: Publication | null;
};

export function AdminReportList({
  reports,
}: {
  reports: ReportWithPublication[];
}) {
  if (reports.length === 0) {
    return <div className="empty-feed">Aucun signalement en attente.</div>;
  }

  return (
    <div className="admin-report-list">
      {reports.map(({ report, publication }) => (
        <article className="admin-report-card" key={report.id}>
          <div className="feed-card-meta">
            <span>SIGNALEMENT · {report.reason.toUpperCase()}</span>
            <time>{formatDate(report.createdAt)}</time>
          </div>
          {publication ? (
            <>
              <h2>{publication.title}</h2>
              <p className="admin-content">{publication.content}</p>
            </>
          ) : (
            <p className="admin-content">La publication signalée n’est plus disponible.</p>
          )}
          {report.details ? (
            <p className="report-details">Précisions : {report.details}</p>
          ) : null}
          <form action={reviewReport} className="admin-actions">
            <input type="hidden" name="id" value={report.id} />
            <button type="submit">MARQUER COMME VU</button>
          </form>
        </article>
      ))}
    </div>
  );
}
