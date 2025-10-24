import { loadIndex, saveIndex, loadCapsule, saveCapsule, loadProgress } from "./storage.js";
import { timeAgo, slugify } from "./utils.js";
import { renderLearn } from "./learn.js";
import { renderAuthor } from "./author.js";

export function renderLibrary() {
  const container = document.getElementById("library-section");
  const list = loadIndex(); // alias rename only (cosmetic)

  container.innerHTML = `
    <div class="row mb-4 align-items-center">
      <div class="col-12 col-md-6 mb-2 mb-md-0">
        <h3 class="fw-semibold">My Capsules</h3>
      </div>
      <div class="col-12 col-md-6 text-md-end">
        <button class="btn btn-primary me-2 mb-2" id="newCapsuleBtn">+ Add Capsule</button>
        <label class="btn btn-outline-secondary mb-2">
          Import JSON
          <input type="file" id="importFile" accept=".json" hidden />
        </label>
      </div>
    </div>
    <div class="row" id="capsuleGrid"></div>
  `;

  document.getElementById("newCapsuleBtn").onclick = () => goNew();

  const grid = document.getElementById("capsuleGrid");

  if (!list.length) {
    grid.innerHTML = `<p class="text-muted text-center mt-5 small">No capsules yet — create one.</p>`;
    return;
  }

  list.forEach(c => {
    const p = loadProgress(c.id) || {};
    const best = p.bestScore || 0;
    const known = (p.knownFlashcards || []).length;
    const full = loadCapsule(c.id) || {};
    const totalCards = full.flashcards?.length || 0;

    const card = document.createElement("div");
    card.className = "col-md-4 mb-3";
    card.innerHTML = `
      <div class="card p-3 h-100">
        <h5 class="fw-bold mb-1">${c.title}</h5>
        <span class="badge bg-info mb-1">${c.level}</span>
        <p class="text-secondary small mb-1">${c.subject || ""}</p>
        <p class="text-secondary small">Updated ${timeAgo(c.updatedAt)}</p>

        <div class="mb-2">
          <div class="small">Best Quiz: ${best}%</div>
          <div class="progress" style="height:8px">
            <div class="progress-bar bg-success" style="width:${best}%"></div>
          </div>
        </div>

        <div class="small mb-2">Known Cards: ${known}/${totalCards}</div>

        <div class="d-flex justify-content-between gap-1 mt-auto">
          <button class="btn btn-sm btn-outline-light" onclick="goLearn('${c.id}')">Learn</button>
          <button class="btn btn-sm btn-outline-light" onclick="goEdit('${c.id}')">Edit</button>
          <button class="btn btn-sm btn-outline-light" onclick="exportCapsule('${c.id}')">Export</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteCapsule('${c.id}')">Del</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  document.getElementById("importFile").onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const j = JSON.parse(ev.target.result);
        if (j.schema !== "pocket-classroom/v1") return alert("Invalid schema.");
        if (!j.id) j.id = "id_" + Math.random().toString(36).slice(2,11);

        saveCapsule(j);
        const idx = loadIndex();
        idx.push({
          id: j.id,
          title: j.title,
          subject: j.subject,
          level: j.level,
          updatedAt: j.updatedAt || new Date().toISOString()
        });
        saveIndex(idx);

        alert("Import OK");
        renderLibrary();
      } catch { alert("Invalid JSON"); }
    };
    r.readAsText(f);
  };
}

/* --- NAV HELPERS (tiny cosmetic only) --- */

window.goNew = () => {
  document.getElementById("library-section").classList.add("d-none");
  document.getElementById("author-section").classList.remove("d-none");
  document.getElementById("learn-section").classList.add("d-none");

  document.getElementById("nav-library").classList.remove("active");
  document.getElementById("nav-author").classList.add("active");
  document.getElementById("nav-learn").classList.remove("active");

  renderAuthor();
};

window.goLearn = id => {
  document.getElementById("library-section").classList.add("d-none");
  document.getElementById("author-section").classList.add("d-none");
  document.getElementById("learn-section").classList.remove("d-none");

  document.getElementById("nav-library").classList.remove("active");
  document.getElementById("nav-author").classList.remove("active");
  document.getElementById("nav-learn").classList.add("active");

  renderLearn(id);
};

window.goEdit = id => {
  document.getElementById("library-section").classList.add("d-none");
  document.getElementById("author-section").classList.remove("d-none");
  document.getElementById("learn-section").classList.add("d-none");

  document.getElementById("nav-library").classList.remove("active");
  document.getElementById("nav-author").classList.add("active");
  document.getElementById("nav-learn").classList.remove("active");

  renderAuthor(id);
};

window.exportCapsule = id => {
  const data = loadCapsule(id);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = slugify(data.title || "capsule") + ".json";
  a.click();
};

window.deleteCapsule = id => {
  const newList = loadIndex().filter(x => x.id !== id);
  saveIndex(newList);
  localStorage.removeItem("pc_capsule_" + id);
  renderLibrary();
};
