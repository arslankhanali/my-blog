document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll("pre > code").forEach(function(e){const t=document.createElement("button");t.className="copy-code-button",t.type="button",t.title="Copy code",t.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="feather feather-copy">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    `,t.addEventListener("click",function(){navigator.clipboard.writeText(e.textContent).then(()=>{const e=t.innerHTML;t.innerHTML=`
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
            viewBox="0 0 24 24" fill="none" stroke="green"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
        `,setTimeout(()=>{t.innerHTML=e},1500)})});const n=e.parentNode;n.style.position="relative",n.appendChild(t)})})