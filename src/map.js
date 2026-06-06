// ── map.js — Non-interactive map strip behind the header ─────
document.addEventListener('astro:page-load', async function () {

var mapEl = document.getElementById("minimap");
if (!mapEl) return;

// Don't reinitialize if map already exists (persisted element)
if (mapEl._leaflet_id) return;

// ── fetch data ──────────────────────────────────────────────
var entries;
try {
  entries = JSON.parse(document.getElementById("__data__").textContent);
} catch (e) {
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

// ── init minimap ────────────────────────────────────────────
var map = L.map("minimap", {
  center: [20, 0],
  zoom: 2,
  minZoom: 2,
  maxZoom: 2,
  zoomControl: false,
  attributionControl: false,
  dragging: false,
  touchZoom: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
});

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  noWrap: true,
}).addTo(map);

// ── add markers ─────────────────────────────────────────────
for (var i = 0; i < entries.length; i++) {
  var e = entries[i];
  if (e.lat && e.lng) {
    L.circleMarker([e.lat, e.lng], {
      radius: 3.5,
      fillColor: "#FED911",
      color: "#1E293B",
      weight: 1,
      fillOpacity: 0.9,
      interactive: false,
    }).addTo(map);
  }
}

});
