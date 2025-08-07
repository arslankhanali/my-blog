document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll("pre > code").forEach(function(e){const n=document.createElement("button");n.className="copy-code-button",n.type="button",n.title="Copy code",n.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    `,n.addEventListener("click",function(){navigator.clipboard.writeText(e.textContent).then(()=>{const e=n.innerHTML;n.innerHTML=`
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
            viewBox="0 0 24 24" fill="none" stroke="green"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        `,setTimeout(()=>{n.innerHTML=e},1500)})});const t=document.createElement("button");t.className="edit-code-button",t.type="button",t.title="Edit code";let s=!1;const i=`
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
      </svg>
    `,a=`
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="green"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    `;t.innerHTML=i,t.addEventListener("click",function(){s=!s,e.contentEditable=s,e.focus(),s?(e.classList.add("editing"),t.innerHTML=a,t.title="Done editing"):(e.classList.remove("editing"),t.innerHTML=i,t.title="Edit code")});const o=e.parentNode;o.style.position="relative",o.appendChild(n),o.appendChild(t)})})