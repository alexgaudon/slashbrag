#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const entriesDir = path.join(__dirname, "..", "src", "data", "entries");
const cacheFile = path.join(__dirname, "..", "src", "data", "geocode-cache.json");
const outDir = path.join(__dirname, "..", "public");
const outFile = path.join(outDir, "data.json");

// Load cache
let cache = {};
if (fs.existsSync(cacheFile)) {
  cache = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
}

// Load entries
const entries = [];
if (fs.existsSync(entriesDir)) {
  for (const file of fs.readdirSync(entriesDir)) {
    if (!file.endsWith(".json")) continue;
    const raw = fs.readFileSync(path.join(entriesDir, file), "utf-8");
    try {
      const e = JSON.parse(raw);
      if (e.name && e.link) {
        if (e.location && cache[e.location]) {
          e.lat = cache[e.location].lat;
          e.lng = cache[e.location].lng;
        }
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
