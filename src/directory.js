// ── directory.js — Entries list + search (no map) ────────────
(function () {

// ── fetch data ──────────────────────────────────────────────
var entries;
try {
  entries = JSON.parse(document.getElementById("__data__").textContent);
} catch (e) {
  document.getElementById("groups").innerHTML =
    '<p class="text-center text-gray-400 py-16">Couldn\'t load entries.</p>';
  document.getElementById("stats").innerHTML = "";
  return;
}

// ── country extraction ─────────────────────────────────────
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

// ── group entries ──────────────────────────────────────────
var groups = {};
for (var i = 0; i < entries.length; i++) {
  var c = country(entries[i].location);
  if (!groups[c]) groups[c] = [];
  groups[c].push(entries[i]);
}
var countries = Object.keys(groups).sort();

// ── stats ──────────────────────────────────────────────────
document.getElementById("stats").innerHTML =
  "<span><strong>" + entries.length + "</strong> entries</span>" +
  "<span><strong>" + countries.length + "</strong> countries</span>";

// ── render ─────────────────────────────────────────────────
var container = document.getElementById("groups");

function render(filter) {
  var q = (filter || "").toLowerCase().trim();
  var html = "";

  for (var i = 0; i < countries.length; i++) {
    var c = countries[i];
    var groupEntries = groups[c];
    var visible = [];

    for (var j = 0; j < groupEntries.length; j++) {
      var e = groupEntries[j];
      var name = (e.name || "").toLowerCase();
      var loc = (e.location || "").toLowerCase();
      if (!q || name.indexOf(q) !== -1 || loc.indexOf(q) !== -1) {
        visible.push(e);
      }
    }

    if (visible.length === 0) continue;

    html += '<div class="mb-8">';
    html += '<div class="flex justify-between items-baseline border-b border-gray-200/70 pb-2 mb-3">';
    html += '<span class="text-xs font-bold uppercase tracking-wider text-gray-400">' + c + '</span>';
    html += '<span class="text-xs font-medium text-gray-400">' + visible.length + '</span>';
    html += '</div>';
    html += '<div class="flex flex-col gap-2">';

    for (var j = 0; j < visible.length; j++) {
      var e = visible[j];
      var hasImg = e["image-url"];
      html += '<a class="block bg-white rounded-xl p-5 no-underline text-gray-900 transition-all duration-200 hover:-translate-y-px hover:shadow-md border-l-[3px] border-l-transparent hover:border-l-[#FED911] shadow-sm" href="' + e.link + '" target="_blank" rel="noopener">';
      html += '<div class="flex gap-4">';
      if (hasImg) {
        html += '<img src="' + e["image-url"] + '" alt="" class="w-12 h-12 rounded-full flex-shrink-0 object-cover" loading="lazy" />';
      }
      html += '<div class="flex-1 min-w-0">';
      html += '<div class="flex items-baseline gap-2.5 flex-wrap">';
      html += '<h2 class="text-base font-semibold tracking-tight">' + e.name + '</h2>';
      html += '<span class="text-sm font-medium text-gray-400">' + (e.location || "") + '</span>';
      html += '</div>';
      html += '<p class="mt-1.5 text-sm text-gray-500 leading-relaxed">' + (e.description || "") + '</p>';
      html += '<span class="inline-block mt-2 text-sm text-[#FED911] font-semibold opacity-0 -translate-x-1 transition-all duration-200">View /brag &#8594;</span>';
      html += '</div></div>';
      html += '</a>';
    }

    html += '</div></div>';
  }

  container.innerHTML = html || '<p class="text-center text-gray-400 py-16">No matches.</p>';
}

render();

document.getElementById("search").addEventListener("input", function () {
  render(this.value);
});

})();
