// -------- LocalStorage Keys --------
export const STORAGE_KEYS = {
  INDEX: "pc_capsules_index",                 // list of capsules (metadata only)
  CAPSULE: id => `pc_capsule_${id}`,          // full capsule JSON
  PROGRESS: id => `pc_progress_${id}`,        // quiz/progress per capsule
};


// -------- INDEX (List of Capsules) --------
export function loadIndex() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.INDEX) || "[]");
}

export function saveIndex(index) {
  localStorage.setItem(STORAGE_KEYS.INDEX, JSON.stringify(index));
}


// -------- CAPSULE (Full Capsule by ID) --------
export function loadCapsule(id) {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CAPSULE(id)) || "null");
}

export function saveCapsule(capsule) {
  localStorage.setItem(
    STORAGE_KEYS.CAPSULE(capsule.id),
    JSON.stringify(capsule)
  );
}


// -------- PROGRESS (Per Capsule) --------
export function loadProgress(id) {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS(id)) || "{}");
}

export function saveProgress(id, progress) {
  localStorage.setItem(
    STORAGE_KEYS.PROGRESS(id),
    JSON.stringify(progress)
  );
}
