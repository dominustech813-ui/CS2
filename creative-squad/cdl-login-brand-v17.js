(()=>{
  const maint=document.createElement('script');
  maint.src='../maintenance-v37.js?v=38';
  if(Date.now()<Date.parse('2026-09-23T09:00:00Z'))document.documentElement.style.visibility='hidden';
  maint.onload=()=>{document.documentElement.style.visibility=''};
  maint.onerror=()=>{document.documentElement.style.visibility=''};
  document.head.appendChild(maint);
})();

(()=>{
  const BRAND='Creative Dark Legends 2 COPA CDL';
  const LOGO='../creative-squad/logo-cdl-official.png?v=38';
  const repl=s=>String(s??'')
    .replace(/Creative Squad/g,BRAND)
    .replace(/Bot CS/g,'Bot CDL')
    .replace(/Membro CS/g,'Membro CDL')
    .replace(/\bCS\b/g,'CDL');

  function ticketUi(){
    const methodAlt=document.getElementById('methodAlt');
    if(methodAlt){
      methodAlt.classList.remove('hidden');
      methodAlt.textContent='🎟️ Ticket';
      methodAlt.title='Gerar um ticket para pedir autorização ao administrador';
    }
    const unauthorized=document.querySelector('#unauthorizedBox button');
    if(unauthorized)unauthorized.textContent='🎟️ Pedir acesso por Ticket';
    const altTitle=document.querySelector('#alternateStep h3');
    if(altTitle)altTitle.textContent='🎟️ Ticket';
    const altHelp=document.querySelector('#alternateStep .altHelp');
    if(altHelp)altHelp.textContent='Gere um ticket. O ADM receberá a solicitação e poderá autorizar ou recusar sua entrada.';
    const guestButton=document.getElementById('guestRequestBtn');
    if(guestButton)guestButton.textContent='🎟️ Gerar Ticket e Pedir ao ADM';
  }

  function apply(root=document){
    document.title=BRAND;
    let icon=document.querySelector('link[rel~="icon"]');
    if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon)}
    icon.type='image/png';
    icon.href=LOGO;
    let apple=document.querySelector('link[rel="apple-touch-icon"]');
    if(!apple){apple=document.createElement('link');apple.rel='apple-touch-icon';document.head.appendChild(apple)}
    apple.href=LOGO;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];let n;
    while(n=walker.nextNode())nodes.push(n);
    nodes.forEach(t=>{const p=t.parentElement;if(!p||['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName))return;const v=repl(t.nodeValue);if(v!==t.nodeValue)t.nodeValue=v;});
    root.querySelectorAll?.('[alt]').forEach(el=>el.alt=repl(el.alt));
    root.querySelectorAll?.('img').forEach(img=>{const src=(img.getAttribute('src')||'').toLowerCase(),alt=(img.getAttribute('alt')||'').toLowerCase();if(src.includes('logo')||alt.includes('cdl')||alt.includes('creative dark legends')||alt.includes('creative squad'))img.src=LOGO;});
    ticketUi();
  }
  apply();
  new MutationObserver(m=>{m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)apply(n);else if(n.nodeType===3){const v=repl(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;}}));ticketUi();}).observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(ticketUi,300);
  setTimeout(ticketUi,1200);
})();