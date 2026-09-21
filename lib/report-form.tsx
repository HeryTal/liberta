"use client";

import { useActionState } from "react";
import {
  submitReport,
  type ReportFormState,
} from "@/app/publications/[id]/report-actions";
import { reportReasons } from "@/lib/report-reasons";
import { translations, type Locale } from "@/lib/translations";

const initialState: ReportFormState = { status: "idle", message: "" };

export function ReportForm({ publicationId, locale }: { publicationId: string; locale: Locale }) {
  const t = translations[locale];
  const [state, action, pending] = useActionState(submitReport, initialState);

  return (
    <details className="report-box">
      <summary>{t.report}</summary>
      <form action={action} className="report-form">
        <input type="hidden" name="publicationId" value={publicationId} />
        <input type="hidden" name="locale" value={locale} />
        {state.message ? (
          <p
            className={`form-message ${
              state.status === "success" ? "form-success" : "form-error"
            }`}
            role="status"
          >
            {state.message}
          </p>
        ) : null}
        {state.status !== "success" ? (
          <>
            <label htmlFor="report-reason">{t.reportReason}</label>
            <select id="report-reason" name="reason" required defaultValue="">
              <option value="" disabled>
                {t.chooseReason}
              </option>
              {reportReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <label htmlFor="report-details">{t.reportDetails}</label>
            <textarea id="report-details" name="details" rows={3} maxLength={1000} />
            <button type="submit" disabled={pending}>
              {pending ? "ENVOI..." : t.reportSend}
            </button>
          </>
        ) : null}
      </form>
    </details>
  );
}
