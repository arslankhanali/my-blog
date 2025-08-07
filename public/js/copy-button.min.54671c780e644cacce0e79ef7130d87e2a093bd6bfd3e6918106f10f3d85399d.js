document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll("pre > code").forEach(function(e){const o=e.parentNode;o.style.position="relative";const s=document.createElement("div");s.className="pre-button-container";const n=document.createElement("button");n.className="copy-code-button",n.type="button",n.title="Copy code",n.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" class="feather feather-copy">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      <span>Copy</span>
    `;const i=n.innerHTML;n.addEventListener("click",function(){navigator.clipboard.writeText(e.textContent).then(()=>{n.innerHTML=`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="green" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Copied</span>
        `,setTimeout(()=>{n.innerHTML=i},1500)})}),s.appendChild(n);const t=document.createElement("button");t.className="edit-code-button",t.type="button",t.title="Edit code",t.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
      <span>Edit</span>
    `,t.addEventListener("click",()=>{e.isContentEditable?(e.contentEditable="false",t.innerHTML=`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
          <span>Edit</span>
        `,t.title="Edit code"):(e.contentEditable="true",e.focus(),t.innerHTML=`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Done</span>
        `,t.title="Save code")}),s.appendChild(t),o.appendChild(s)})})