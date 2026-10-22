// Edge Function: meld-preek
//
// Mailt een preek (als .docx-bijlage, plus de tekst in de mail zelf) naar Anita.
// Wordt aangeroepen vanuit index.html (stuurPreekNaarAnita()) zodra een
// voorganger de preek toevoegt via de knop "Preek toevoegen & versturen".
// De ontvanger staat vast in deze functie (niet uit de aanvraag), zodat de
// functie niet als open mail-relay misbruikt kan worden.
//
// Gebruikt de Resend API, net als meld-klaar. Dezelfde secrets:
//
//   supabase secrets set --project-ref iabrbkirzsolwnuknbel \
//     RESEND_API_KEY=re_xxx \
//     RESEND_FROM="Liturgie Vrijburg <liturgie@vrijburg.nl>" \
//     PREEK_EMAIL="anita@mpo-bv.nl"
//
// - RESEND_API_KEY : API-key van Resend (gedeeld met meld-klaar).
// - RESEND_FROM    : geverifieerd afzenderadres (gedeeld met meld-klaar).
// - PREEK_EMAIL    : optioneel; overschrijft de ontvanger (kommagescheiden).
//
// Deployen: supabase functions deploy meld-preek --project-ref iabrbkirzsolwnuknbel
//
// Zonder RESEND_API_KEY antwoordt de functie met HTTP 501; de app downloadt
// dan het .docx en opent een lege mail om zelf te bijlagen.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM") || "Liturgie Vrijburg <onboarding@resend.dev>";
const PREEK_TO = (Deno.env.get("PREEK_EMAIL") || "anita@mpo-bv.nl")
  .split(",").map((s) => s.trim()).filter(Boolean);
// Een preek van enkele pagina's is ruim onder 1 MB; dit voorkomt misbruik.
const MAX_BASE64_CHARS = 2_000_000;

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Alleen POST wordt ondersteund" }, 405);
  }
  if (!RESEND_API_KEY) {
    return jsonResponse(
      {
        ok: false,
        error:
          "Niet geconfigureerd: RESEND_API_KEY ontbreekt als Edge Function secret. Zie de comment bovenin meld-preek/index.ts.",
      },
      501,
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch (_e) {
    // lege/ongeldige body: hieronder volgt een 400
  }

  const text = str(body.text);
  const datum = str(body.datum);
  const thema = str(body.thema);
  const voorganger = str(body.voorganger);
  const filename = str(body.filename).replace(/[^\w.\-]/g, "_") || "preek.docx";
  const attachment = str(body.attachment_base64);
  const subject = str(body.subject) ||
    `Preek Vrijburg – ${datum || "(datum onbekend)"}${thema ? " – " + thema : ""}`;

  if (!text) {
    return jsonResponse({ ok: false, error: "preektekst ontbreekt in de aanvraag" }, 400);
  }
  if (attachment.length > MAX_BASE64_CHARS) {
    return jsonResponse({ ok: false, error: "bijlage is te groot" }, 413);
  }

  const intro = [
    `Hierbij de preek van ${datum || "de dienst"}${thema ? " (" + thema + ")" : ""}` +
      `${voorganger ? ", door " + voorganger : ""}.`,
    attachment ? "De preek zit ook als Word-bestand in de bijlage." : "",
  ].filter(Boolean);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: PREEK_TO,
        subject,
        text: `${intro.join("\n")}\n\n---\n\n${text}`,
        ...(attachment ? { attachments: [{ filename, content: attachment }] } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return jsonResponse({ ok: false, error: `Resend-fout ${res.status}: ${detail}` }, 502);
    }
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String((err as Error)?.message || err) }, 500);
  }
});
