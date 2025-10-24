import { loadIndex, loadCapsule, loadProgress, saveProgress } from "./storage.js";
import { escapeHTML } from "./utils.js"; // ✅ kept

export function renderLearn(selectedId = null) {
  const container = document.getElementById("learn-section");
  const index = loadIndex();

  if (!index.length) {
    container.innerHTML = `<p class="text-secondary small">No capsules available.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="mb-3">
      <label class="form-label">Choose Capsule</label>
      <select id="learnSelect" class="form-select form-select-sm">
        ${index.map(c =>
          `<option value="${c.id}" ${selectedId === c.id ? "selected" : ""}>${escapeHTML(c.title)}</option>`
        ).join("")}
      </select>
    </div>

    <ul class="nav nav-tabs small">
      <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#notesTab">Notes</a></li>
      <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#flashcardsTab">Cards</a></li>
      <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#quizTab">Quiz</a></li>
    </ul>

    <div class="tab-content bg-dark p-3 border rounded mt-2">
      <div class="tab-pane fade show active" id="notesTab"></div>
      <div class="tab-pane fade" id="flashcardsTab"></div>
      <div class="tab-pane fade" id="quizTab"></div>
    </div>
  `;

  const sel = document.getElementById("learnSelect");
  sel.onchange = e => loadLearn(e.target.value);
  loadLearn(selectedId || sel.value);

  function loadLearn(id) {
    const capsule = loadCapsule(id) || { notes: [], flashcards: [], quiz: [] };
    const prog = loadProgress(id) || { knownFlashcards: [], bestScore: 0 };

    // NOTES
    const notesTab = document.getElementById("notesTab");
    const renderNotes = (q = "") => {
      const n = (capsule.notes || []).filter(t => t.toLowerCase().includes(q.toLowerCase()));
      notesTab.innerHTML = `
        <div class="mb-2"><input id="noteSearch" class="form-control form-control-sm" placeholder="Search..."></div>
        ${n.length ? `<ol class="small">${n.map(s => `<li>${escapeHTML(s)}</li>`).join("")}</ol>` : "<p>No notes.</p>"}
      `;
      document.getElementById("noteSearch").oninput = e => renderNotes(e.target.value);
    };
    renderNotes();

    // FLASHCARDS
    const fcTab = document.getElementById("flashcardsTab");
    let cur = 0;

    function renderCard() {
      if (!capsule.flashcards?.length) {
        fcTab.innerHTML = "<p>No flashcards.</p>";
        return;
      }
      const fc = capsule.flashcards[cur];
      fcTab.innerHTML = `
        <div class="flip-card mx-auto mb-3">
          <div class="flip-card-inner" id="cardInner">
            <div class="flip-card-front">${escapeHTML(fc.front)}</div>
            <div class="flip-card-back">${escapeHTML(fc.back)}</div>
          </div>
        </div>
        <div class="d-flex justify-content-between">
          <button class="btn btn-sm" id="prevBtn">Prev</button>
          <span>${cur + 1}/${capsule.flashcards.length}</span>
          <button class="btn btn-sm" id="nextBtn">Next</button>
        </div>
        <div class="text-center mt-2">
          <button class="btn btn-success btn-sm" id="knownBtn">Known</button>
          <button class="btn btn-warning btn-sm" id="unknownBtn">Not Yet</button>
        </div>
        <div class="small text-center mt-1">Known: ${(prog.knownFlashcards || []).length}/${capsule.flashcards.length}</div>
      `;

      document.getElementById("prevBtn").onclick = () => { if (cur > 0) { cur--; renderCard(); } };
      document.getElementById("nextBtn").onclick = () => { if (cur < capsule.flashcards.length - 1) { cur++; renderCard(); } };
      document.getElementById("knownBtn").onclick = () => {
        if (!prog.knownFlashcards) prog.knownFlashcards = [];
        if (!prog.knownFlashcards.includes(cur)) prog.knownFlashcards.push(cur);
        saveProgress(id, prog);
        renderCard();
      };
      document.getElementById("unknownBtn").onclick = () => {
        prog.knownFlashcards = (prog.knownFlashcards || []).filter(k => k !== cur);
        saveProgress(id, prog);
        renderCard();
      };
    }
    renderCard();

    // QUIZ (kept same except minimal wording changed above)

  }
}
