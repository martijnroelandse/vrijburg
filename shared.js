// Shared Supabase client + date/escaping helpers for index.html + nieuwsbrief.html.
// Load the Supabase CDN script before this file (sb reads window.supabase).

const SUPABASE_URL = 'https://iabrbkirzsolwnuknbel.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhYnJia2lyenNvbHdudWtuYmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTU4MDIsImV4cCI6MjEwMDM3MTgwMn0.ojjiiwwAwb3eITwThJPXGgOk_XynghQUNZ_snDDe6iQ';
const SUPABASE_FOTO_BUCKET = 'dienst-fotos';

const sb = (() => {
  const lib = (typeof supabase !== 'undefined') ? supabase : null;
  const create = lib?.createClient || lib?.default?.createClient;
  return create ? create(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
})();

const NL_MAANDEN = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
const NL_DAGEN = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];

function formatDatum(val) {
  if (!val) return '';
  const d = new Date(val + 'T12:00:00');
  const dag = NL_DAGEN[d.getDay()];
  return `${dag} ${d.getDate()} ${NL_MAANDEN[d.getMonth()]} ${d.getFullYear()}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
