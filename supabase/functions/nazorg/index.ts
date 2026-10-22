// Edge Function: nazorg
//
// Verwerkt de laatste stap van de liturgie-generator ("Preek & feedback"):
//
// - type "preek":    bewaart de preek in tabel `dienst_nazorg` en mailt hem
//                    (tekst + .docx-bijlage) naar de ontvanger uit het secret
//                    PREEK_EMAIL.
// - type "feedback": bewaart de feedbackantwoorden in `dienst_nazorg`.
//
// Waarom een Edge Function en niet rechtstreeks vanuit de browser: de tabel
// `diensten` is leesbaar voor iedereen met een link; preek en feedback horen
// daar niet in. `dienst_nazorg` (migratie 003) heeft geen anon-toegang; deze
// functie schrijft met de service role (automatisch beschikbaar in Edge
// Functions). Het ontvangersadres staat alleen als secret, niet in de repo of
// op de website.
//
// Secrets (Supabase Dashboard → Edge Functions → Secrets, of CLI):
//
//   supabase secrets set --project-ref iabrbkirzsolwnuknbel \
//     PREEK_EMAIL="<adres>" RESEND_API_KEY=re_xxx \
//     RESEND_FROM="Liturgie Vrijburg <liturgie@vrijburg.nl>"
//
// Optioneel FEEDBACK_EMAIL: krijgt een mail bij elke nieuwe feedback.
// RESEND_API_KEY / RESEND_FROM worden gedeeld met meld-klaar. Zonder
// RESEND_API_KEY of PREEK_EMAIL antwoordt type "preek" met HTTP 501 (de preek
// is dan wél al bewaard); de app downloadt dan het .docx en opent een lege mail.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM") || "Liturgie Vrijburg <onboarding@resend.dev>";
const PREEK_TO = (Deno.env.get("PREEK_EMAIL") || "")
  .split(",").map((s) => s.trim()).filter(Boolean);
// Optioneel: ontvanger(s) van een mail-melding bij nieuwe feedback (de ontwikkelaar).
const FEEDBACK_TO = (Deno.env.get("FEEDBACK_EMAIL") || "")
  .split(",").map((s) => s.trim()).filter(Boolean);
const MAX_BASE64_CHARS = 2_000_000;
const MAX_TEXT_CHARS = 200_000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// Upsert op short_id; alleen de meegestuurde kolommen worden bijgewerkt.
async function bewaar(shortId: string, velden: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/dienst_nazorg?on_conflict=short_id`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ short_id: shortId, ...velden, bijgewerkt_op: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`Opslaan mislukt (${res.status}): ${await res.text()}`);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Alleen POST wordt ondersteund" }, 405);
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch (_e) { /* 400 hieronder */ }

  const type = str(body.type);
  const shortId = str(body.short_id);
  if (!/^[A-Za-z0-9_-]{3,32}$/.test(shortId)) {
    return jsonResponse({ ok: false, error: "short_id ontbreekt of is ongeldig" }, 400);
  }

  try {
    if (type === "feedback") {
      const fb = (typeof body.feedback === "object" && body.feedback) ? body.feedback as Record<string, unknown> : {};
      const feedback: Record<string, string> = {};
      for (const k of ["gemak", "tijd", "verbeter", "overig"]) feedback[k] = str(fb[k]).slice(0, 5000);
      await bewaar(shortId, { feedback });

      // Melding aan de ontwikkelaar; een mislukte mail mag het opslaan niet laten falen.
      if (RESEND_API_KEY && FEEDBACK_TO.length > 0) {
        const datum = str(body.datum);
        const thema = str(body.thema);
        const voorganger = str(body.voorganger);
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: RESEND_FROM,
              to: FEEDBACK_TO,
              subject: `Feedback liturgie-generator – ${datum || shortId}`,
              text: [
                `Dienst: ${datum || "(onbekend)"}${thema ? " – " + thema : ""} (id=${shortId})`,
                voorganger ? `Voorganger: ${voorganger}` : "",
                "",
                `Gemak (1-5): ${feedback.gemak || "-"}`,
                `Tijd: ${feedback.tijd || "-"}`,
                `Wat kon beter: ${feedback.verbeter || "-"}`,
                `Overig: ${feedback.overig || "-"}`,
              ].filter((l, i) => l !== "" || i > 1).join("\n"),
            }),
          });
        } catch (_e) { /* feedback is al bewaard */ }
      }
      return jsonResponse({ ok: true });
    }

    if (type === "preek") {
      const text = str(body.text);
      if (!text) return jsonResponse({ ok: false, error: "preektekst ontbreekt" }, 400);
      if (text.length > MAX_TEXT_CHARS) return jsonResponse({ ok: false, error: "preek is te lang" }, 413);
      const attachment = str(body.attachment_base64);
      if (attachment.length > MAX_BASE64_CHARS) return jsonResponse({ ok: false, error: "bijlage is te groot" }, 413);

      await bewaar(shortId, { preek: text });

      if (!RESEND_API_KEY || PREEK_TO.length === 0) {
        return jsonResponse(
          { ok: false, error: "Niet geconfigureerd: RESEND_API_KEY of PREEK_EMAIL ontbreekt (preek is wel bewaard)" },
          501,
        );
      }

      const datum = str(body.datum);
      const thema = str(body.thema);
      const voorganger = str(body.voorganger);
      const filename = str(body.filename).replace(/[^\w.\-]/g, "_") || "preek.docx";
      const subject = str(body.subject) ||
        `Preek Vrijburg – ${datum || "(datum onbekend)"}${thema ? " – " + thema : ""}`;
      const intro = [
        `Hierbij de preek van ${datum || "de dienst"}${thema ? " (" + thema + ")" : ""}` +
          `${voorganger ? ", door " + voorganger : ""}.`,
        attachment ? "De preek zit ook als Word-bestand in de bijlage." : "",
      ].filter(Boolean);

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: PREEK_TO,
          subject,
          text: `${intro.join("\n")}\n\n---\n\n${text}`,
          ...(attachment ? { attachments: [{ filename, content: attachment }] } : {}),
        }),
      });
      if (!res.ok) {
        return jsonResponse({ ok: false, error: `Resend-fout ${res.status}: ${await res.text()}` }, 502);
      }
      await bewaar(shortId, { preek_verstuurd_op: new Date().toISOString() });
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: false, error: "onbekend type" }, 400);
  } catch (err) {
    return jsonResponse({ ok: false, error: String((err as Error)?.message || err) }, 500);
  }
});
