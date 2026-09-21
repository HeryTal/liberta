import { formatDate } from "@/lib/format-date";
import type { ModerationAction, ModerationLog } from "@/lib/moderation-log";

const actionLabels: Record<ModerationAction, string> = {
  publication_published: "PUBLICATION PUBLIÉE",
  publication_removed: "PUBLICATION RETIRÉE",
  report_reviewed: "SIGNALEMENT TRAITÉ",
};

export function AdminModerationLog({ logs }: { logs: ModerationLog[] }) {
  if (logs.length === 0) {
    return <div className="empty-feed">Aucune décision enregistrée.</div>;
  }

  return (
    <div className="moderation-log">
      {logs.map((log) => (
        <article className="moderation-log-row" key={log.id}>
          <span>{actionLabels[log.action]}</span>
          <span>CIBLE {log.targetId}</span>
          <span>PAR {log.adminUsername}</span>
          <time>{formatDate(log.createdAt)}</time>
        </article>
      ))}
    </div>
  );
}
