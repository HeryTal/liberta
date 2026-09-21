"use server";

import { revalidatePath } from "next/cache";
import { databaseName, getMongoClient } from "@/lib/db";
import type { PublicationType } from "@/lib/publications";
import { translations, type Locale } from "@/lib/translations";

export type PublicationFormState = {
  status: "idle" | "success" | "error";
  message: string;
  field?: "title" | "content" | "pseudonym" | "type";
};

const initialState: PublicationFormState = {
  status: "idle",
  message: "",
};

export async function submitPublication(
  _previousState: PublicationFormState,
  formData: FormData,
): Promise<PublicationFormState> {
  const type = readType(formData.get("type"));
  const title = readText(formData.get("title"));
  const content = readText(formData.get("content"));
  const pseudonym = readText(formData.get("pseudonym"));
  const isAnonymous = formData.get("identity") === "anonymous";
  const locale: Locale = formData.get("locale") === "mg" ? "mg" : "fr";
  const t = translations[locale];

  if (!type) {
    return { ...initialState, status: "error", message: t.chooseType, field: "type" };
  }
  if (title.length < 5 || title.length > 160) {
    return { ...initialState, status: "error", message: t.titleLength, field: "title" };
  }
  if (content.length < 30 || content.length > 10000) {
    return { ...initialState, status: "error", message: t.contentLength, field: "content" };
  }
  if (!isAnonymous && (pseudonym.length < 2 || pseudonym.length > 40)) {
    return { ...initialState, status: "error", message: t.pseudonymLength, field: "pseudonym" };
  }

  try {
    await getMongoClient()
      .db(databaseName)
      .collection("publications")
      .insertOne({
        type,
        title,
        content,
        pseudonym: isAnonymous ? null : pseudonym,
        isAnonymous,
        status: "pending_review",
        createdAt: new Date(),
        publishedAt: null,
      });

    revalidatePath("/publications");
    return {
      status: "success",
      message: t.received,
    };
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    const errorCode =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "unknown";

    console.error("[publication-submit] MongoDB insert failed", {
      name: errorName,
      code: errorCode,
    });

    if (
      error instanceof Error &&
      error.message === "MONGO_URI must be configured to access MongoDB Atlas."
    ) {
      return {
        status: "error",
        message:
          "MongoDB Atlas n’est pas configuré sur ce serveur. Ajoutez MONGO_URI dans .env.local puis redémarrez Next.js.",
      };
    }

    return {
      status: "error",
      message: t.databaseError,
    };
  }
}

function readText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function readType(value: FormDataEntryValue | null): PublicationType | null {
  if (value === "testimony" || value === "named_accusation") {
    return value;
  }
  return null;
}
