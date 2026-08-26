// Edge Function: meld-klaar
//
// Stuurt een e-mail-ping wanneer een liturgie in de Liturgie Generator wordt
// gemarkeerd als "klaar" (knop "📣 Meld: liturgie is klaar" in index.html).
// Zo weet de liturgiemaker (Gon) en het bureau (info@) meteen dát een dienst
// compleet is én wat de id (?id=...) is.
//
// Gebruikt de Resend API (https://resend.com, gratis tot 100 mails/dag,
// 3000/maand) omdat dat vanuit een Edge Function met één fetch-call werkt,
// zonder extra dependencies.
//
// Vereiste secrets (Supabase Dashboard → Edge Functions → meld-klaar →
// Secrets, of via de CLI):
//
//   supabase secrets set --project-ref iabrbkirzsolwnuknbel \
//     RESEND_API_KEY=re_xxx \
//     RESEND_FROM="Liturgie Vrijburg <liturgie@vrijburg.nl>" \
//     NOTIFY_EMAIL="gon.homburg@gmail.com,info@vrijburg.nl"
//
// - RESEND_API_KEY : API-key van Resend.
// - RESEND_FROM     : afzenderadres. Moet een domein zijn dat bij Resend is
//                      geverifieerd (of gebruik tijdelijk hun test-afzender
//                      "onboarding@resend.dev" tijdens het instellen).
// - NOTIFY_EMAIL    : optioneel extra adressen, kommagescheiden. De vaste
//                      ontvangers (Gon + info@) krijgen de mail altijd.
//
// Zolang RESEND_API_KEY niet is ingesteld antwoordt de functie met
// { ok: false, error: '...' } (HTTP 501) — de app in index.html valt dan
// automatisch terug op een kant-en-klare mailto-link, zodat de melding
// hoe dan ook verstuurd kan worden.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM") || "Liturgie Vrijburg <onboarding@resend.dev>";
const BASE_NOTIFY = ["gon.homburg@gmail.com", "info@vrijburg.nl"];
const EXTRA_NOTIFY = Deno.env.get("NOTIFY_EMAIL") || "";

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

function recipients() {
  const extra = EXTRA_NOTIFY.split(",").map((s) => s.trim()).filter(Boolean);
  return [...new Set([...BASE_NOTIFY, ...extra])];
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
          "Niet geconfigureerd: RESEND_API_KEY ontbreekt als Edge Function secret. Zie de comment bovenin meld-klaar/index.ts.",
      },
      501,
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch (_e) {
    // lege/ongeldige body: hieronder valt short_id dan weg en geven we een 400
  }

  const shortId = typeof body.short_id === "string" ? body.short_id : "";
  const datum = typeof body.datum === "string" ? body.datum : "";
  const thema = typeof body.thema === "string" ? body.thema : "";
  const liturgieUrl = typeof body.liturgie_url === "string" ? body.liturgie_url : "";
  const nieuwsbriefUrl = typeof body.nieuwsbrief_url === "string" ? body.nieuwsbrief_url : "";

  if (!shortId) {
    return jsonResponse({ ok: false, error: "short_id ontbreekt in de aanvraag" }, 400);
  }

  const datumTekst = datum || "(datum onbekend)";
  const subject = `Liturgie klaar – ${datumTekst}${thema ? " – " + thema : ""} (id=${shortId})`;
  const lines = [
    `De liturgie voor ${datumTekst}${thema ? " (" + thema + ")" : ""} is gemarkeerd als klaar.`,
    "",
    `id: ${shortId}`,
    "",
    liturgieUrl ? `Liturgie: ${liturgieUrl}` : "",
    nieuwsbriefUrl ? `Nieuwsbrief-app: ${nieuwsbriefUrl}` : "",
  ].filter((line) => line !== "");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: recipients(),
        subject,
        text: lines.join("\n"),
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
