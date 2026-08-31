#!/usr/bin/env node
/** Kleine regressietests voor Gon-feedback 26 aug 2026 (aanhef, collecte, adressen). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const collectes = JSON.parse(fs.readFileSync(path.join(root, 'collectes.json'), 'utf8'));
const planning = JSON.parse(fs.readFileSync(path.join(root, 'dienstplanning.json'), 'utf8'));

function extractFns(...names) {
  const parts = names.map(name => {
    const re = new RegExp(`function ${name}\\([\\s\\S]*?\\n\\}`);
    const m = html.match(re);
    if (!m) throw new Error(`Functie ${name} niet gevonden in index.html`);
    return m[0];
  });
  return new Function(`${parts.join('\n')}; return { ${names.join(', ')} };`)();
}

const { gastAanhef } = extractFns('gastAanhef');

const aanhefCases = [
  ['Rienk Lanooij', 'Geachte heer/mevrouw Lanooij,'],
  ['Rienk', 'Beste Rienk,'],
  ['ds. Rienk Lanooij', 'Geachte heer/mevrouw Lanooij,'],
  ['Rachelle van Andel en Rosaliene Israël', 'Geachte Rachelle van Andel en Rosaliene Israël,'],
  ['', 'Geachte heer/mevrouw,'],
  ['[naam]', 'Geachte heer/mevrouw,'],
];
for (const [input, expected] of aanhefCases) {
  const got = gastAanhef(input);
  if (got !== expected) {
    throw new Error(`gastAanhef(${JSON.stringify(input)}) → ${JSON.stringify(got)}, verwacht ${JSON.stringify(expected)}`);
  }
}

if (html.includes("entry.type === 'gemeente' ? 'diaconie'")) {
  throw new Error('Collecte-omkering staat nog in index.html');
}
if (!html.includes("allowed.includes(type) ? type : 'diaconie'")) {
  throw new Error('Letterlijke c2_type-toewijzing ontbreekt');
}

const sept13 = collectes.find(c => c.dag === 13 && c.maand === 'September');
if (!sept13 || sept13.type !== 'bijzonder' || !sept13.c2_naam?.includes('Colombia')) {
  throw new Error('13 september moet type bijzonder (Colombia) hebben in collectes.json');
}
const okt25 = collectes.find(c => c.dag === 25 && c.maand === 'Oktober');
if (!okt25 || okt25.type !== 'bijzonder' || !okt25.c2_naam?.includes('Colombia')) {
  throw new Error('25 oktober moet type bijzonder (Colombia) hebben in collectes.json');
}

const dienst = planning.find(d => d.datum === '2026-08-30');
if (!dienst) throw new Error('Dienst 2026-08-30 ontbreekt');
if (dienst.lector !== 'Gert van Drimmelen') {
  throw new Error(`Lector 30 aug is "${dienst.lector}", verwacht Gert van Drimmelen`);
}

if (!html.includes('gon.homburg@gmail.com') || !html.includes('info@vrijburg.nl')) {
  throw new Error('Klaar-mail adressen Gon/info@ ontbreken');
}
if (html.includes('bureau@vrijburg.nl')) {
  throw new Error('bureau@vrijburg.nl staat nog in index.html');
}

const { parseLiedlijstTekst, buildLiedContentFromCouplets } = extractFns(
  'formatVerseListNl',
  'parseLiedlijstTekst',
  'buildLiedContentFromCouplets',
);
const songs = parseLiedlijstTekst('217:1\nLicht dat ons aanstoot\n\n217:3\nLicht in onze ogen\n');
if (!songs.has('217') || songs.get('217').length !== 2) {
  throw new Error('parseLiedlijstTekst gaf niet 2 coupletten voor 217');
}
const content = buildLiedContentFromCouplets('217', songs.get('217'));
if (!content.includes('Licht dat ons aanstoot') || !content.startsWith('Lied 217:')) {
  throw new Error('buildLiedContentFromCouplets miste couplettekst');
}

console.log('✓ Gon-aug26 tests ok');
