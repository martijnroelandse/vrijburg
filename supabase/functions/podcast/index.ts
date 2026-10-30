// Edge Function: podcast
//
// Haalt de nieuwste Vrijzinnige Miniatuur op van www.vrijburg.nl en geeft de
// gegevens als JSON terug aan nieuwsbrief.html.
//
// Waarom een Edge Function: www.vrijburg.nl (Hugo, Usecue) stuurt geen
// CORS-header mee, dus een browser op liturgie.vrijburg.nl mag de site niet
// zelf uitlezen. Deze functie leest de site server-side en voegt de CORS-header
// toe. Het oude WordPress-endpoint (/wp-json/wp/v2/posts) bestaat niet meer.
//
// Werking: /laatste-podcast/ verwijst (via een HTML meta-refresh) naar de
// nieuwste podcastpagina. Die pagina bevat de afbeelding (og:image), de
// SoundCloud-link en de regels "Miniatuur 403 / Geschreven door / ...".
//
// Geen secrets nodig. Alleen www.vrijburg.nl wordt opgehaald (vaste host).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BASE = "https://www.vrijburg.nl";
const SOUNDCLOUD_USER = "https://soundcloud.com/vrijburg-amsterdam";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

async function haalHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "liturgie-vrijburg/1.0" } });
  if (!res.ok) throw new Error(`${url} gaf HTTP ${res.status}`);
  return await res.text();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;|&#x27;|&#8217;|&#8216;/g, "'")
    .replace(/&quot;|&#34;|&#8220;|&#8221;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripTags(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, "\n"),
  );
}

function metaContent(html: string, property: string): string {
  const re = new RegExp(`<meta[^>]+property=["']${property}["'][^>]*content=["']([^"']*)["']`, "i");
  return decodeEntities(html.match(re)?.[1] ?? "");
}

function bestandsnaam(url: string, fallback: string): string {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() || "") || fallback;
  } catch (_) {
    return fallback;
  }
}

// Eerste gevonden waarde per veld telt: de rest van de pagina (zijbalk,
// verwante berichten) kan dezelfde regels herhalen voor andere miniaturen.
function parsePodcastPagina(html: string, pageUrl: string) {
  const regels = stripTags(html)
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const v: Record<string, string> = {};
  const zet = (k: string, waarde: string) => { if (!v[k]) v[k] = waarde; };
  for (const regel of regels) {
    let m: RegExpMatchArray | null;
    if ((m = regel.match(/^Geschreven door\s+(.+)$/i))) zet("geschreven", m[1]);
    else if ((m = regel.match(/^Voorgelezen door\s+(.+)$/i))) zet("voorgelezen", m[1]);
    else if ((m = regel.match(/^Geluidsmontage\s+(.+)$/i))) zet("montage", m[1]);
    else if ((m = regel.match(/^Thema:\s*(.+)$/i))) zet("thema", m[1]);
    else if ((m = regel.match(/^Titel:\s*(.+)$/i))) zet("titel", m[1]);
    else if ((m = regel.match(/^Miniatuur\s+(\d+)$/i))) zet("nummer", m[1]);
    else if ((m = regel.match(/^(Foto|Illustratie):\s*(.+)$/i))) {
      zet("creditLabel", m[1]);
      zet("creditText", m[2]);
      zet("creditLine", `${m[1]}: ${m[2]}`);
    } else if ((m = regel.match(/^(\d{1,2} [a-zA-Z]+ \d{4})$/))) zet("datumTekst", m[1]);
  }

  const ogTitel = metaContent(html, "og:title");
  const titel = (v.titel || ogTitel.replace(/\s*#\s*\d+\s*$/, "")).trim();
  if (!v.nummer) {
    const m = ogTitel.match(/#\s*(\d+)/);
    if (m) v.nummer = m[1];
  }

  const sc = html.match(/https:\/\/soundcloud\.com\/vrijburg-amsterdam\/[a-zA-Z0-9\-]+(?:\/s-[A-Za-z0-9]+)?/);
  const imageUrl = metaContent(html, "og:image");
  const datum = html.match(/"datePublished":"(\d{4}-\d{2}-\d{2})/)?.[1] ?? "";

  if (!v.nummer && !sc) return null;

  return {
    nummer: v.nummer || "",
    titel,
    thema: v.thema || "",
    geschreven: v.geschreven || "",
    voorgelezen: v.voorgelezen || "",
    montage: v.montage || "",
    creditLabel: v.creditLabel || "",
    creditText: v.creditText || "",
    creditLine: v.creditLine || "",
    imageUrl,
    imageFilename: bestandsnaam(
      imageUrl,
      v.nummer ? `miniatuur-${v.nummer}.jpg` : "miniatuur-illustratie.jpg",
    ),
    datum,
    datumTekst: v.datumTekst || "",
    pageUrl,
    soundcloudUrl: sc
      ? sc[0]
      : (v.nummer ? `${SOUNDCLOUD_USER}/vrijzinnige-miniatuur-blog-${v.nummer}` : SOUNDCLOUD_USER),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    // Stap 1: /laatste-podcast/ is een HTML-doorverwijzing (meta refresh).
    const doorverwijzing = await haalHtml(`${BASE}/laatste-podcast/`);
    const pad = doorverwijzing.match(/http-equiv=["']refresh["'][^>]*url=(\/[^"'>\s]+)/i)?.[1];
    // Alleen een pad op dezelfde site volgen, nooit een andere host.
    if (!pad || pad.startsWith("//")) {
      return jsonResponse({ error: "Geen doorverwijzing naar de nieuwste podcast gevonden" }, 502);
    }

    // Stap 2: de podcastpagina zelf.
    const pageUrl = `${BASE}${pad}`;
    const podcast = parsePodcastPagina(await haalHtml(pageUrl), pageUrl);
    if (!podcast) {
      return jsonResponse({ error: "De nieuwste pagina lijkt geen Vrijzinnige Miniatuur te zijn" }, 502);
    }
    return jsonResponse({ podcast });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : String(err) }, 502);
  }
});
