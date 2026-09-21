export const reportReasons = [
  "Contenu inapproprié",
  "Accusation non vérifiée",
  "Donnée personnelle",
  "Autre problème",
] as const;

export type ReportReason = (typeof reportReasons)[number];
