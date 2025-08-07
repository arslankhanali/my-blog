function addCopyButtons(e){document.querySelectorAll("pre > code").forEach(function(t){var s,o,n=document.createElement("button");n.className="copy-code-button",n.type="button",n.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="feather feather-copy">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    `,n.addEventListener("click",function(){e.writeText(t.textContent).then(function(){n.blur(),n.innerText="Copied!",setTimeout(function(){n.innerText="Copy"},2e3)},function(e){n.innerText="Error",console.error(e)})}),s=t.parentNode,s.parentNode.classList.contains("highlight")?(o=s.parentNode,o.parentNode.insertBefore(n,o)):(s.style.position="relative",s.parentNode.insertBefore(n,s))})}if(navigator&&navigator.clipboard)addCopyButtons(navigator.clipboard);else{var script=document.createElement("script");script.src="https://cdnjs.cloudflare.com/ajax/libs/clipboard-polyfill/2.7.0/clipboard-polyfill.promise.js",script.integrity="sha256-waClS2re9NUbXRsryKoof+F9qc1gjjIhc2eT7ZbIv94=",script.crossOrigin="anonymous",script.onload=function(){addCopyButtons(clipboard)},document.body.appendChild(script)}