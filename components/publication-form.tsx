"use client";

import { useActionState } from "react";
import {
  submitPublication,
  type PublicationFormState,
} from "@/app/publier/actions";
import { translations, type Locale } from "@/lib/translations";

const initialState: PublicationFormState = {
  status: "idle",
  message: "",
};

export function PublicationForm({ locale }: { locale: Locale }) {
  const t = translations[locale];
  const [state, formAction, isPending] = useActionState(
    submitPublication,
    initialState,
  );

  return (
    <form className="publication-form" action={formAction}>
      {state.message ? (
        <div className={`form-message form-${state.status}`} role="status">
          {state.message}
        </div>
      ) : null}

      <fieldset>
        <legend>01 / {t.publicationType}</legend>
        <label className="form-option">
          <input type="radio" name="type" value="testimony" defaultChecked />
          <span>
            <strong>{t.testimony}</strong>
            <small>{t.testimonyHelp}</small>
          </span>
        </label>
        <label className="form-option">
          <input type="radio" name="type" value="named_accusation" />
          <span>
            <strong>{t.accusation}</strong>
            <small>{t.accusationHelp}</small>
          </span>
        </label>
      </fieldset>

      <div className="form-field">
        <label htmlFor="title">{t.title}</label>
        <input id="title" name="title" required maxLength={160} placeholder="UN TITRE COURT ET PRÉCIS" />
      </div>

      <div className="form-field">
        <label htmlFor="content">{t.text}</label>
        <textarea
          id="content"
          name="content"
          required
          minLength={30}
          maxLength={10000}
          rows={10}
          placeholder="Écrivez les faits, le contexte et ce que vous souhaitez partager..."
        />
        <small>30 caractères minimum · 10 000 maximum</small>
      </div>

      <fieldset>
        <legend>02 / SIGNATURE</legend>
        <label className="form-option">
          <input type="radio" name="identity" value="anonymous" defaultChecked />
          <span>
            <strong>{t.anonymous}</strong>
            <small>{t.anonymousHelp}</small>
          </span>
        </label>
        <label className="form-option">
          <input type="radio" name="identity" value="pseudonym" />
          <span>
            <strong>{t.pseudonym}</strong>
            <small>{t.pseudonymHelp}</small>
          </span>
        </label>
      </fieldset>

      <div className="form-field">
        <label htmlFor="pseudonym">{t.optionalPseudonym}</label>
        <input id="pseudonym" name="pseudonym" maxLength={40} placeholder="VOTRE PSEUDO" />
      </div>

      <div className="form-submit">
        <p>
          Votre publication sera examinée avant d’être visible publiquement.
          Aucune adresse IP n’est enregistrée.
        </p>
        <button type="submit" disabled={isPending}>
          {isPending ? "ENVOI..." : t.sendForReview}
        </button>
      </div>
      <input type="hidden" name="locale" value={locale} />
    </form>
  );
}
