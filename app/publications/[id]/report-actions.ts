"use server";

import { revalidatePath } from "next/cache";
import { getPublishedPublication } from "@/lib/publications";
import { createReport } from "@/lib/reports";
import { reportReasons, type ReportReason } from "@/lib/report-reasons";
import { translations, type Locale } from "@/lib/translations";

export type ReportFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function submitReport(
  _previousState: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const publicationId = readText(formData.get("publicationId"));
  const reason = readText(formData.get("reason"));
  const details = readText(formData.get("details"));
  const locale: Locale = formData.get("locale") === "mg" ? "mg" : "fr";
  const t = translations[locale];

  if (!publicationId || !reportReasons.includes(reason as ReportReason)) {
    return { status: "error", message: t.invalidReason };
  }

  if (details.length > 1000) {
    return { status: "error", message: "Les précisions sont trop longues." };
  }

  const publication = await getPublishedPublication(publicationId);
  if (!publication) {
    return { status: "error", message: t.reportUnavailable };
  }

  await createReport({
    publicationId,
    reason: reason as ReportReason,
    details,
  });
  revalidatePath(`/publications/${publicationId}`);

  return {
    status: "success",
    message: t.reportSent,
  };
}

function readText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}
