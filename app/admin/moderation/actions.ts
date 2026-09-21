"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { updatePublicationStatus } from "@/lib/admin-moderation";
import { markReportReviewed } from "@/lib/reports";
import { recordModerationAction } from "@/lib/moderation-log";

export async function moderatePublication(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = readText(formData.get("id"));
  const status = readText(formData.get("status"));

  if (status !== "published" && status !== "removed") {
    throw new Error("INVALID_MODERATION_STATUS");
  }

  await updatePublicationStatus(id, status);
  await recordModerationAction({
    action: status === "published" ? "publication_published" : "publication_removed",
    targetId: id,
    adminUsername: session.username,
  });
  revalidatePath("/admin/moderation");
  revalidatePath("/publications");
}

export async function reviewReport(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = readText(formData.get("id"));
  await markReportReviewed(id);
  await recordModerationAction({
    action: "report_reviewed",
    targetId: id,
    adminUsername: session.username,
  });
  revalidatePath("/admin/moderation");
}

function readText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}
