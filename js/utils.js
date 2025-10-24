// --- tiny utilities ---


// Short random ID prefixed with "id_"
export const uid = () =>
  "id_" + Math.random().toString(36).slice(2, 11);


// Human-friendly "time ago" from ISO date
export function timeAgo(iso) {
  if (!iso) return "";
  const elapsed = Date.now() - new Date(iso); // ms diff
  const mins = Math.floor(elapsed / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}


// Convert string to safe URL slug
export function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}


// Escape HTML for safety
export function escapeHTML(v) {
  if (v === null || v === undefined) return "";
  return String(v)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#39;");
}
