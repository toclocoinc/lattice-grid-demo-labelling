// Turns the UCI SMS Spam Collection into sms.json, the one data file the page loads.
// Usage:  node tools/prepare.mjs SMSSpamCollection > sms.json
// Download the source from https://archive.ics.uci.edu/dataset/228/sms+spam+collection
// (zip -> SMSSpamCollection). The file is Windows-1252 text, one "label<TAB>text" per line;
// this decodes it to UTF-8 and numbers the lines 1..n. Deterministic: same input, same bytes.
import { readFileSync } from 'node:fs';

const raw = new TextDecoder('windows-1252').decode(readFileSync(process.argv[2]));
const rows = raw.split('\n').filter((line) => line.trim() !== '').map((line, i) => {
  const tab = line.indexOf('\t');
  return { id: i + 1, uci: line.slice(0, tab), text: line.slice(tab + 1).replace(/\r$/, '') };
});
process.stdout.write(JSON.stringify(rows) + '\n');
