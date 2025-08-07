(() => {
  // <stdin>
  document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll("pre > code").forEach(function(codeBlock) {
      const pre = codeBlock.parentNode;
      pre.style.position = "relative";
      const btnContainer = document.createElement("div");
      btnContainer.className = "pre-button-container";
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-code-button";
      copyBtn.type = "button";
      copyBtn.title = "Copy code";
      const copyIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      copyIcon.setAttribute("viewBox", "0 0 24 24");
      copyIcon.setAttribute("fill", "none");
      copyIcon.setAttribute("stroke", "currentColor");
      copyIcon.setAttribute("stroke-width", "2");
      copyIcon.setAttribute("stroke-linecap", "round");
      copyIcon.setAttribute("stroke-linejoin", "round");
      copyIcon.innerHTML = `
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    `;
      const copyText = document.createElement("span");
      copyText.textContent = "Copy";
      copyBtn.appendChild(copyIcon);
      copyBtn.appendChild(copyText);
      copyBtn.addEventListener("click", function() {
        navigator.clipboard.writeText(codeBlock.textContent).then(() => {
          copyBtn.classList.add("success");
          setTimeout(() => {
            copyBtn.classList.remove("success");
            copyText.textContent = "Copy";
          }, 1500);
        });
      });
      btnContainer.appendChild(copyBtn);
      const editBtn = document.createElement("button");
      editBtn.className = "edit-code-button";
      editBtn.type = "button";
      editBtn.title = "Edit code";
      const editIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      editIcon.setAttribute("viewBox", "0 0 24 24");
      editIcon.setAttribute("fill", "none");
      editIcon.setAttribute("stroke", "currentColor");
      editIcon.setAttribute("stroke-width", "2");
      editIcon.setAttribute("stroke-linecap", "round");
      editIcon.setAttribute("stroke-linejoin", "round");
      editIcon.innerHTML = `
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    `;
      const editText = document.createElement("span");
      editText.textContent = "Edit";
      editBtn.appendChild(editIcon);
      editBtn.appendChild(editText);
      editBtn.addEventListener("click", () => {
        if (codeBlock.isContentEditable) {
          codeBlock.contentEditable = "false";
          editText.textContent = "Edit";
          editBtn.classList.remove("success");
          editBtn.title = "Edit code";
        } else {
          codeBlock.contentEditable = "true";
          codeBlock.focus();
          editBtn.classList.add("success");
          editBtn.title = "Save code";
        }
      });
      btnContainer.appendChild(editBtn);
      pre.appendChild(btnContainer);
    });
  });
})();
