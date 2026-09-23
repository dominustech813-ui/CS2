(()=>{
  const END = Date.parse('2026-09-23T09:00:00Z'); // 23/09/2026 06:00 em Brasília
  const LOGO = '/CS2/creative-squad/logo-cdl-official.png';
  const active = Date.now() < END;

  function setIcons(){
    const head=document.head||document.documentElement;
    let icon=document.querySelector('link[rel="icon"]');
    if(!icon){icon=document.createElement('link');icon.rel='icon';head.appendChild(icon)}
    icon.type='image/png';icon.href=LOGO+'?v=38';
    let apple=document.querySelector('link[rel="apple-touch-icon"]');
    if(!apple){apple=document.createElement('link');apple.rel='apple-touch-icon';head.appendChild(apple)}
    apple.href=LOGO+'?v=38';
  }

  setIcons();
  if(active) document.documentElement.classList.add('cdl-maintenance');

  function pad(n){return String(n).padStart(2,'0')}
  function countdown(){
    const el=document.getElementById('cdlCountdown');
    if(!el)return;
    const left=END-Date.now();
    if(left<=0){
      el.textContent='00:00:00';
      document.documentElement.classList.remove('cdl-maintenance');
      location.reload();
      return;
    }
    const total=Math.floor(left/1000);
    const h=Math.floor(total/3600);
    const m=Math.floor((total%3600)/60);
    const s=total%60;
    el.textContent=`${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function brandImages(){
    document.querySelectorAll('img').forEach(img=>{
      const alt=(img.getAttribute('alt')||'').toLowerCase();
      const src=(img.getAttribute('src')||'').toLowerCase();
      if(alt.includes('cdl') || alt.includes('creative dark legends') || alt.includes('creative squad') || src.includes('logo-cdl') || src.includes('logo_cs') || src.endsWith('/logo.jpg')){
        const wanted=new URL(LOGO+'?v=38',location.href).href;
        if(img.src!==wanted) img.src=LOGO+'?v=38';
      }
    });
  }

  function boot(){
    brandImages();
    if(!active)return;
    const style=document.createElement('style');
    style.id='cdlMaintenanceStyle';
    style.textContent=`
      html.cdl-maintenance,html.cdl-maintenance body{margin:0!important;min-height:100%!important;background:#020a05!important;color:#f4fff6!important}
      html.cdl-maintenance body>*:not(#cdlMaintenance){display:none!important}
      #cdlMaintenance{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(circle at 50% 18%,#12311e 0,#06120a 38%,#020a05 72%);font-family:Arial,Helvetica,sans-serif;overflow:auto}
      #cdlMaintenance .box{width:min(620px,100%);text-align:center;background:#0d2416;border:1px solid #31583d;border-radius:28px;padding:34px 24px;box-shadow:0 24px 80px #000a}
      #cdlMaintenance img{width:132px;height:132px;object-fit:cover;border-radius:24px;filter:drop-shadow(0 0 18px #76ff3540)}
      #cdlMaintenance h1{font-size:clamp(30px,7vw,52px);line-height:1.05;margin:20px 0 10px;color:#f4fff6}
      #cdlMaintenance .tool{font-size:clamp(28px,7vw,46px)}
      #cdlMaintenance p{font-size:17px;line-height:1.5;color:#c7d5ca;margin:10px auto;max-width:470px}
      #cdlMaintenance .return{margin-top:20px;color:#7cff35;font-weight:900;text-transform:uppercase;letter-spacing:.08em;font-size:13px}
      #cdlCountdown{font-variant-numeric:tabular-nums;font-size:clamp(42px,12vw,76px);font-weight:1000;letter-spacing:.04em;margin:10px 0;color:#ffe42f;text-shadow:0 0 24px #ffe42f22}
      #cdlMaintenance .date{font-size:14px;color:#b9c8bc}
    `;
    document.head.appendChild(style);
    const screen=document.createElement('div');
    screen.id='cdlMaintenance';
    screen.innerHTML=`<div class="box"><img src="${LOGO}?v=38" alt="CDL"><div class="tool">🔧</div><h1>Site em manutenção</h1><p>Estamos fazendo ajustes no Creative Dark Legends 2 • COPA CDL.</p><div class="return">Voltamos às 06:00</div><div id="cdlCountdown">--:--:--</div><div class="date">23/09/2026 às 06:00 • horário de Brasília</div></div>`;
    document.body.appendChild(screen);
    countdown();
    setInterval(countdown,1000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  const observer=new MutationObserver(()=>brandImages());
  if(document.documentElement) observer.observe(document.documentElement,{childList:true,subtree:true});
})();