"use client";

export default function Error() {
  return (
    <div className="empty-feed">
      <p className="eyebrow">ERREUR / MONGODB ATLAS</p>
      <h1>Les publications sont temporairement indisponibles.</h1>
      <p>Vérifiez la connexion MongoDB Atlas puis réessayez.</p>
    </div>
  );
}
