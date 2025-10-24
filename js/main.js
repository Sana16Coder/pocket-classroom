// Imports
import { renderLibrary } from "./library.js";
import { renderAuthor } from "./author.js";
import { renderLearn } from "./learn.js";
import { loadIndex } from "./storage.js";

// Cache section elements
const sections = {
  library: document.getElementById("library-section"),
  author: document.getElementById("author-section"),
  learn: document.getElementById("learn-section"),
};

// Show/hide sections + set active nav
function showSection(name) {
  for (const key of Object.keys(sections)) {
    sections[key].classList.toggle("d-none", key !== name);
    document
      .getElementById(`nav-${key}`)
      .classList.toggle("active", key === name);
  }

  switch (name) {
    case "library":
      renderLibrary();
      break;

    case "author":
      renderAuthor();
      break;

    case "learn":
      const index = loadIndex();
      const firstId = index.length ? index[0].id : undefined;
      renderLearn(firstId);
      break;
  }
}

// Attach navbar clicks
["library", "author", "learn"].forEach(name => {
  document
    .getElementById(`nav-${name}`)
    .addEventListener("click", e => {
      e.preventDefault();
      showSection(name);
    });
});

// Start app at Library
showSection("library");
