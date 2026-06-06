#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const outDir = path.join(__dirname, "..", "public");
const outFile = path.join(outDir, "data.json");

// Derive display name from filename: alex-gaudon.json → Alex Gaudon
function filenameToName(filename) {
  const base = filename.replace(/\.json$/, "");
  return base
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Load entries
const entries = [];
if (fs.existsSync(dataDir)) {
  for (const file of fs.readdirSync(dataDir)) {
    if (!file.endsWith(".json")) continue;
    const raw = fs.readFileSync(path.join(dataDir, file), "utf-8");
    try {
      const e = JSON.parse(raw);
      if (!e.name) e.name = filenameToName(file);
      if (e.name && e.link) {
        entries.push(e);
      }
    } catch (err) {
      console.error(`Skipping ${file}: ${err.message}`);
    }
  }
}

entries.sort((a, b) => a.name.localeCompare(b.name));

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(entries));
console.log(`Wrote ${entries.length} entries to ${outFile}`);
