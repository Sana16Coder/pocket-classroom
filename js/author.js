import { uid, escapeHTML } from "./utils.js";
import { loadIndex, saveIndex, saveCapsule, loadCapsule } from "./storage.js";

export function renderAuthor(capsuleId = null) {
  const container = document.getElementById("author-section");

  // form output block (new or edit mode)
  container.innerHTML = `
    <h3 class="fw-bold mb-3">${capsuleId ? "Edit Capsule" : "Create Capsule"}</h3>
    <form id="capsuleForm" class="bg-dark p-4 rounded">
      <input type="hidden" id="editingId" value="${capsuleId ?? ""}">
      
      <!-- meta -->
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Title *</label>
          <input type="text" class="form-control" id="title" required placeholder="Enter capsule title"/>
        </div>
        <div class="col-md-3">
          <label class="form-label">Subject</label>
          <input type="text" class="form-control" id="subject" placeholder="e.g. Programming"/>
        </div>
        <div class="col-md-3">
          <label class="form-label">Level</label>
          <select id="level" class="form-select">
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
      </div>

      <!-- description -->
      <div class="mt-3">
        <label class="form-label">Description</label>
        <textarea id="description" class="form-control" rows="2" placeholder="Short description..."></textarea>
      </div>

      <hr class="my-4"/>

      <!-- notes input -->
      <div class="mb-3">
        <label class="form-label">Notes (one per line)</label>
        <textarea id="notes" class="form-control" rows="6" placeholder="Write each note on a new line"></textarea>
      </div>

      <!-- flashcards -->
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center">
          <label class="form-label mb-0">Flashcards</label>
          <button type="button" class="btn btn-sm btn-outline-light" id="addFlash">+ Add Card</button>
        </div>
        <div id="flashcardsList" class="mt-2"></div>
        <div class="d-flex gap-2 mt-2">
          <input type="text" id="flashFront" class="form-control" placeholder="Enter question/front side">
          <input type="text" id="flashBack" class="form-control" placeholder="Enter answer/back side">
          <button type="button" class="btn btn-outline-light" id="pushFlash">Add</button>
        </div>
      </div>

      <!-- quiz -->
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center">
          <label class="form-label mb-0">Quiz</label>
          <button type="button" class="btn btn-sm btn-outline-light" id="addQuiz">+ Add Question</button>
        </div>
        <div id="quizList" class="mt-2"></div>
      </div>

      <div class="text-end mt-4">
        <button class="btn btn-primary">Save Capsule</button>
      </div>
    </form>
  `;

  let quiz = [];
  let flashcards = [];

  // load for edit
  if (capsuleId) {
    const loaded = loadCapsule(capsuleId);
    if (loaded) {
      document.getElementById("title").value = loaded.title || "";
      document.getElementById("subject").value = loaded.subject || "";
      document.getElementById("level").value = loaded.level || "Beginner";
      document.getElementById("description").value = loaded.description || "";
      document.getElementById("notes").value = (loaded.notes || []).join("\n");
      flashcards = loaded.flashcards || [];
      quiz = loaded.quiz || [];
    }
  }

  // flashcards list
  const flashList = document.getElementById("flashcardsList");
  function renderFlash(){
    flashList.innerHTML = flashcards
      .map((fc,i)=>`
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-info text-dark flex-grow-1">
            ${escapeHTML(fc.front)} ➝ ${escapeHTML(fc.back)}
          </span>
          <button type="button" class="btn btn-sm btn-outline-danger fc-remove" data-index="${i}">✕</button>
        </div>
      `).join("");

    flashList.querySelectorAll(".fc-remove").forEach(btn=>{
      btn.onclick = ()=>{
        flashcards.splice(+btn.dataset.index,1);
        renderFlash();
      };
    });
  }
  renderFlash();

  // add flash
  document.getElementById("pushFlash").onclick = ()=>{
    const f=document.getElementById("flashFront").value.trim();
    const b=document.getElementById("flashBack").value.trim();
    if(!f || !b) return alert("Both front and back are required!");
    flashcards.push({front:f,back:b});
    document.getElementById("flashFront").value="";
    document.getElementById("flashBack").value="";
    renderFlash();
  };
  document.getElementById("addFlash").onclick=()=>document.getElementById("flashFront").focus();

  // quiz list
  const quizList=document.getElementById("quizList");
  function addQuizBlock(data={question:"",choices:["","","",""],answer:0}){
    const id=[...quizList.children].length;
    const block=document.createElement("div");
    block.className="border p-3 mb-3 rounded bg-secondary";

    block.innerHTML=`
      <div class="d-flex justify-content-between align-items-center mb-2">
        <label class="mb-0">Question</label>
        <button type="button" class="btn btn-sm btn-outline-danger removeQ">Remove</button>
      </div>
      <input class="form-control mb-2 quizQ" placeholder="Enter question text" value="${escapeHTML(data.question)}">
      ${[0,1,2,3].map(i=>`
        <div class="d-flex align-items-center mb-1">
          <input type="radio" name="q${id}" value="${i}" ${data.answer===i?"checked":""}>
          <input class="form-control ms-2 quizC" data-idx="${i}" placeholder="Choice ${i+1}" value="${escapeHTML(data.choices[i]||"")}">
        </div>`).join("")}
    `;
    quizList.appendChild(block);
    block.querySelector(".removeQ").onclick=()=>block.remove();
  }

  if(quiz.length) quiz.forEach(q=>addQuizBlock(q));
  document.getElementById("addQuiz").onclick=()=>addQuizBlock();

  // save
  document.getElementById("capsuleForm").onsubmit=e=>{
    e.preventDefault();
    const editingId=document.getElementById("editingId").value||null;

    const notes=document.getElementById("notes").value.split("\n").filter(Boolean);

    const qBlocks=[...document.querySelectorAll("#quizList > div")];
    const quizCollected=qBlocks.map(b=>{
      const q=b.querySelector(".quizQ").value.trim();
      const choices=[...b.querySelectorAll(".quizC")].map(c=>c.value.trim());
      const ansEl=b.querySelector("input[type=radio]:checked");
      const ans=ansEl?+ansEl.value:0;
      if(!q || choices.some(ch=>!ch)) return null;
      return{question:q,choices,answer:ans};
    }).filter(Boolean);

    const capsule={
      id:editingId||uid(),
      title:document.getElementById("title").value.trim(),
      subject:document.getElementById("subject").value.trim(),
      level:document.getElementById("level").value,
      description:document.getElementById("description").value.trim(),
      notes,
      flashcards,
      quiz:quizCollected,
      updatedAt:new Date().toISOString(),
      schema:"pocket-classroom/v1"
    };

    if(!capsule.title) return alert("Title is required!");
    if(!capsule.notes.length && !capsule.flashcards.length && !capsule.quiz.length)
      return alert("At least one of notes/flashcards/quiz is required!");

    saveCapsule(capsule);
    const idx=loadIndex();
    const pos=idx.findIndex(x=>x.id===capsule.id);
    const meta={id:capsule.id,title:capsule.title,subject:capsule.subject,level:capsule.level,updatedAt:capsule.updatedAt};
    if(pos>=0) idx[pos]=meta; else idx.push(meta);
    saveIndex(idx);

    alert(editingId?"Capsule updated!":"Capsule created!");
  };
}
