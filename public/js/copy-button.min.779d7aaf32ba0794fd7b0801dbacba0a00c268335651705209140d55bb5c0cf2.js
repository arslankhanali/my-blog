document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll("pre > code").forEach(function(e){const s=e.parentNode;s.style.position="relative";const n=document.createElement("button");n.className="copy-code-button",n.type="button",n.title="Copy code",n.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="feather feather-copy">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    `;const o=n.innerHTML;n.addEventListener("click",function(){navigator.clipboard.writeText(e.textContent).then(()=>{n.innerHTML=`
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
            viewBox="0 0 24 24" fill="none" stroke="green"
            stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        `,setTimeout(()=>{n.innerHTML=o},1500)})}),s.appendChild(n);const t=document.createElement("button");t.className="edit-code-button",t.type="button",t.title="Edit code",t.textContent="Edit",t.style.position="absolute",t.style.top="0.1rem",t.style.right="2.5rem",t.style.background="transparent",t.style.border="none",t.style.cursor="pointer",t.style.fontSize="0.9em",t.style.color="#888",t.addEventListener("click",()=>{e.isContentEditable?(e.contentEditable="false",t.textContent="Edit"):(e.contentEditable="true",e.focus(),t.textContent="Save")}),s.appendChild(t)})})