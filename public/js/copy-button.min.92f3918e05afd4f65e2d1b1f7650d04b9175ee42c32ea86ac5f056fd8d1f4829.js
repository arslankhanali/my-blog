document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll("pre > code").forEach(function(e){const o=e.parentNode;o.style.position="relative";const s=document.createElement("div");s.className="pre-button-container";const t=document.createElement("button");t.className="copy-code-button",t.type="button",t.title="Copy code",t.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-copy">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    `;const i=t.innerHTML;t.addEventListener("click",function(){navigator.clipboard.writeText(e.textContent).then(()=>{t.innerHTML=`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="green"
            stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        `,setTimeout(()=>{t.innerHTML=i},1500)})}),s.appendChild(t);const n=document.createElement("button");n.className="edit-code-button",n.type="button",n.title="Edit code",n.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    `,n.addEventListener("click",()=>{e.isContentEditable?(e.contentEditable="false",n.title="Edit code"):(e.contentEditable="true",e.focus(),n.title="Save code")}),s.appendChild(n),o.appendChild(s)})})