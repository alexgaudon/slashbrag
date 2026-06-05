#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const entriesDir = path.join(__dirname, "..", "data", "entries");
const outFile = path.join(__dirname, "..", "public", "data.json");

const entries = [];

if (fs.existsSync(entriesDir)) {
  for (const file of fs.readdirSync(entriesDir)) {
    if (!file.endsWith(".json")) continue;
    const raw = fs.readFileSync(path.join(entriesDir, file), "utf-8");
    try {
      const entry = JSON.parse(raw);
      if (entry.name && entry.link) {
        entries.push(entry);
      }
    } catch (e) {
      console.error(`Skipping ${file}: ${e.message}`);
    }
  }
}

// Sort alphabetically by name
entries.sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(outFile, JSON.stringify(entries, null, 2));
console.log(`Built data.json with ${entries.length} entries`);
