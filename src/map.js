// ── map.js — Full-page non-interactive underlay ──────────────
(async function () {

var mapEl = document.getElementById("map");
if (!mapEl) return;

// ── fetch data ──────────────────────────────────────────────
var entries;
try {
  var res = await fetch("/data.json");
  entries = await res.json();
} catch (e) {
  mapEl.querySelector("div").innerHTML =
    '<span class="text-gray-400 text-sm">Couldn\'t load map data.</span>';
  return;
}

// ── wait for Leaflet ────────────────────────────────────────
await new Promise(function (resolve) {
  if (window.L) return resolve();
  var n = 0;
  var iv = setInterval(function () {
    if (window.L) { clearInterval(iv); resolve(); }
    if (++n > 100) { clearInterval(iv); resolve(); }
  }, 50);
});

if (!window.L) return;

// Clear loading placeholder
mapEl.innerHTML = "";

// ── init map (non-interactive underlay) ─────────────────────
var map = L.map("map", {
  center: [20, 0],
  zoom: 2,
  minZoom: 2,
  maxZoom: 10,
  zoomControl: false,
  attributionControl: false,
  dragging: false,
  touchZoom: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
  worldCopyJump: true,
});

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
}).addTo(map);

// ── add markers ─────────────────────────────────────────────
var bounds = [];
for (var i = 0; i < entries.length; i++) {
  var e = entries[i];
  if (e.lat && e.lng) {
    L.circleMarker([e.lat, e.lng], {
      radius: 5,
      fillColor: "#FED911",
      color: "#1E293B",
      weight: 1.5,
      fillOpacity: 0.9,
      interactive: false,
    }).addTo(map);
    bounds.push([e.lat, e.lng]);
  }
}

if (bounds.length > 0) {
  map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 });
  // On portrait screens, zoom in one more level so the map fills height
  if (window.innerHeight > window.innerWidth) {
    map.zoomIn();
  }
}

// ── country extraction ──────────────────────────────────────
var US_STATES = new Set("AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC".split(" "));
var CA_PROVINCES = new Set("AB BC MB NB NL NS ON PE QC SK NT NU YT".split(" "));

function country(loc) {
  if (!loc) return "Unknown";
  var parts = loc.split(",");
  var last = parts[parts.length - 1].trim();
  if (US_STATES.has(last)) return "United States";
  if (CA_PROVINCES.has(last)) return "Canada";
  if (last === "UK" || last === "England" || last === "Scotland" || last === "Wales") return "United Kingdom";
  if (last === "UAE") return "United Arab Emirates";
  if (last === "Newfoundland" || last === "Newfoundland and Labrador") return "Canada";
  return last;
}

var countrySet = new Set();
for (var i = 0; i < entries.length; i++) {
  countrySet.add(country(entries[i].location));
}

// ── stats ───────────────────────────────────────────────────
var statsEl = document.getElementById("stats");
if (statsEl) {
  statsEl.innerHTML =
    "<span><strong>" + entries.length + "</strong> entries across <strong>" + countrySet.size + "</strong> countries and counting</span>";
}

// ── resize handling ─────────────────────────────────────────
setTimeout(function () { map.invalidateSize(); }, 200);
window.addEventListener("resize", function () {
  map.invalidateSize();
});

})();
