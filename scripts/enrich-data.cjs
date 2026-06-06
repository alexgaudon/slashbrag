#!/usr/bin/env node
// enrich-data.cjs — geocode changed data files and write lat/lng into them.
// Run via: npm run enrich
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const https = require("https");

const dataDir = path.join(__dirname, "..", "data");
const cacheFile = path.join(__dirname, "..", "src", "data", "geocode-cache.json");

// ── Nominatim geocoding ────────────────────────────────────────
function geocodeLocation(location) {
  return new Promise((resolve) => {
    const q = encodeURIComponent(location);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;
    const req = https.get(url, {
      headers: { "User-Agent": "slashbrag-directory/1.0 (alex@alexgaudon.dev)" },
      timeout: 10000,
    }, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        try {
          const data = JSON.parse(body);
          if (Array.isArray(data) && data.length > 0) {
            resolve({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── main ───────────────────────────────────────────────────────
(async function () {

const allMode = process.argv.includes("--all");

// Which data files have changed?
let changed = [];
if (allMode) {
  changed = fs.readdirSync(dataDir).filter(f => f.endsWith(".json")).map(f => `data/${f}`);
} else {
  try {
    // Tracked files with changes (staged + unstaged)
    const diffOut = execSync("git diff --name-only HEAD -- data/", {
      cwd: path.join(__dirname, ".."),
      encoding: "utf-8",
    }).trim();
    // Untracked files
    const untrackedOut = execSync("git ls-files --others --exclude-standard -- data/", {
      cwd: path.join(__dirname, ".."),
      encoding: "utf-8",
    }).trim();
    const all = [...new Set([...diffOut.split("\n"), ...untrackedOut.split("\n")])]
      .filter(f => f.endsWith(".json"));
    changed = all;
  } catch (e) {
    console.error("Could not run git — falling back to all data files.");
    changed = fs.readdirSync(dataDir).filter(f => f.endsWith(".json")).map(f => `data/${f}`);
  }
}

if (changed.length === 0) {
  console.log("No changed data files found. Nothing to enrich.");
  return;
}

// Load cache (speed: skip API for known locations)
let cache = {};
if (fs.existsSync(cacheFile)) {
  cache = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
}

// Figure out which files need geocoding
const toGeocode = []; // { file, entry, location }
for (const relPath of changed) {
  const absPath = path.join(__dirname, "..", relPath);
  if (!fs.existsSync(absPath)) continue;
  try {
    const entry = JSON.parse(fs.readFileSync(absPath, "utf-8"));
    const loc = entry.location;
    if (!loc) continue;

    // Already has lat/lng? Skip.
    if (entry.lat != null && entry.lng != null) {
      console.log(`  ✓ ${path.basename(relPath)} (already has coords)`);
      // Still add to cache for future runs
      if (!cache[loc]) {
        cache[loc] = { lat: entry.lat, lng: entry.lng };
      }
      continue;
    }

    // In cache?
    if (cache[loc]) {
      entry.lat = cache[loc].lat;
      entry.lng = cache[loc].lng;
      fs.writeFileSync(absPath, JSON.stringify(entry, null, 2) + "\n");
      console.log(`  ✓ ${path.basename(relPath)} → ${loc} (cached)`);
      continue;
    }

    toGeocode.push({ absPath, entry, loc });
  } catch (e) {
    console.error(`  ⚠ Skipping ${relPath}: ${e.message}`);
  }
}

if (toGeocode.length === 0) {
  console.log("All changed files already enriched.");
  // Still save cache (may have picked up new entries from cache misses above)
  fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
  return;
}

// Geocode
console.log(`Geocoding ${toGeocode.length} location(s) via Nominatim…`);
for (let i = 0; i < toGeocode.length; i++) {
  const { absPath, entry, loc } = toGeocode[i];
  const result = await geocodeLocation(loc);
  if (result) {
    entry.lat = result.lat;
    entry.lng = result.lng;
    cache[loc] = result;
    fs.writeFileSync(absPath, JSON.stringify(entry, null, 2) + "\n");
    console.log(`  ✓ ${path.basename(absPath)} → ${loc}`);
  } else {
    console.error(`  ⚠ No result for: "${loc}" in ${path.basename(absPath)}`);
  }
  if (i < toGeocode.length - 1) {
    await sleep(1100);
  }
}

// Save updated cache
fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
console.log("Done. Cache updated.");

})();
