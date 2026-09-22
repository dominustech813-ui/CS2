(()=>{
  const BASE='https://yivgtvgyaalhlcxatbfc.supabase.co';
  const KEY='sb_publishable_JSNYdrq-FFHQtZ0DO3sfVw_v93KOBjs';
  const STORE='sb-yivgtvgyaalhlcxatbfc-auth-token';
  const GUEST_STORE='cs_guest_ticket_v1';
  const LAST_TICKET='cs_last_ticket_v1';
  const LAST_EMAIL='cs_last_email_v1';

  const rootLogin=!!document.getElementById('tabEmail') && !!document.getElementById('tabTicket');
  const inApp=!!document.getElementById('app');

  function parseSession(){
    try{
      const raw=JSON.parse(localStorage.getItem(STORE)||'null');
      if(!raw)return null;
      return raw.currentSession||raw.session||raw;
    }catch{return null}
  }

  function saveSession(s){
    if(!s?.access_token)return false;
    const out={...s,expires_at:s.expires_at||Math.floor(Date.now()/1000)+Number(s.expires_in||3600)};
    localStorage.setItem(STORE,JSON.stringify(out));
    return true;
  }

  async function auth(path,payload){
    const r=await fetch(BASE+'/auth/v1/'+path,{method:'POST',headers:{'Content-Type':'application/json','apikey':KEY},body:JSON.stringify(payload)});
    const data=await r.json().catch(()=>({}));
    return {ok:r.ok,data};
  }

  async function authorized(token){
    try{
      const r=await fetch(BASE+'/rest/v1/rpc/is_cs_authorized',{method:'POST',headers:{'Content-Type':'application/json','apikey':KEY,'Authorization':'Bearer '+token},body:'{}'});
      return r.ok&&(await r.json())===true;
    }catch{return false}
  }

  async function validSession(){
    let s=parseSession();
    if(!s?.access_token)return false;
    const exp=Number(s.expires_at||0);
    if(exp && exp<=Math.floor(Date.now()/1000)+30 && s.refresh_token){
      const r=await auth('token?grant_type=refresh_token',{refresh_token:s.refresh_token});
      if(!r.ok||!r.data?.access_token){localStorage.removeItem(STORE);return false}
      saveSession(r.data);s=r.data;
    }
    if(await authorized(s.access_token))return true;
    localStorage.removeItem(STORE);
    return false;
  }

  function appUrl(){return 'creative-squad-v8/?v=32&t='+Date.now()}

  async function autoEnter(){
    if(!rootLogin)return;
    const p=new URLSearchParams(location.search);
    if(p.get('logout')==='1')return;
    try{
      const ok=await validSession();
      if(ok)location.replace(appUrl());
    }catch{}
  }

  function rememberGuestTicket(){
    try{
      const g=JSON.parse(localStorage.getItem(GUEST_STORE)||'null');
      if(g?.ticket)localStorage.setItem(LAST_TICKET,String(g.ticket));
    }catch{}
  }

  function setupRootUi(){
    if(!rootLogin)return;
    const tabs=document.querySelector('.tabs');
    const msg=document.getElementById('msg')||document.getElementById('loginMsg');
    if(!tabs||!msg||document.getElementById('tabReturnTicket'))return;

    tabs.style.gridTemplateColumns='repeat(3,minmax(0,1fr))';
    const b=document.createElement('button');
    b.id='tabReturnTicket';b.type='button';b.className='tab';b.textContent='🔑 Já tenho Ticket';
    b.onclick=()=>window.showTicketReturn();
    tabs.appendChild(b);

    const pane=document.createElement('div');
    pane.id='returnTicketPane';pane.className='hidden';
    pane.innerHTML='<p>Já entrou por ticket antes? Digite o mesmo ticket para voltar ao seu perfil.</p><input id="returnTicketInput" inputmode="numeric" pattern="[0-9]*" maxlength="12" placeholder="Digite seu ticket"><button id="returnTicketBtn" class="btn green full" style="margin-top:12px" type="button">Entrar com Ticket</button><div class="small" style="margin-top:10px">Use o mesmo ticket que foi autorizado pelo ADM.</div>';
    msg.parentNode.insertBefore(pane,msg);
    document.getElementById('returnTicketBtn').onclick=()=>loginWithTicket();
    const last=localStorage.getItem(LAST_TICKET)||'';
    document.getElementById('returnTicketInput').value=last;

    const oldShow=window.show;
    if(typeof oldShow==='function'){
      window.show=function(name){document.getElementById('returnTicketPane')?.classList.add('hidden');document.getElementById('tabReturnTicket')?.classList.remove('active');return oldShow(name)};
    }
    const oldShowPane=window.showPane;
    if(typeof oldShowPane==='function'){
      window.showPane=function(name){document.getElementById('returnTicketPane')?.classList.add('hidden');document.getElementById('tabReturnTicket')?.classList.remove('active');return oldShowPane(name)};
    }

    window.showTicketReturn=function(){
      try{if(typeof poll!=='undefined'&&poll){clearInterval(poll);poll=null}}catch{}
      ['emailPane','codePane','ticketPane','waitingPane','emailStep','codeStep','alternateStep','waitingStep'].forEach(id=>document.getElementById(id)?.classList.add('hidden'));
      document.getElementById('returnTicketPane').classList.remove('hidden');
      document.getElementById('tabEmail')?.classList.remove('active');
      document.getElementById('tabTicket')?.classList.remove('active');
      document.getElementById('methodCode')?.classList.remove('active');
      document.getElementById('methodAlt')?.classList.remove('active');
      document.getElementById('tabReturnTicket').classList.add('active');
      if(msg){msg.textContent='';msg.className=msg.id==='msg'?'msg':'msg';}
    };

    const email=document.getElementById('email');
    if(email){
      const old=localStorage.getItem(LAST_EMAIL);if(old&&!email.value)email.value=old;
      email.addEventListener('change',()=>{if(email.value.includes('@'))localStorage.setItem(LAST_EMAIL,email.value.trim().toLowerCase())});
    }

    const wrapAsync=(name)=>{
      const f=window[name];if(typeof f!=='function')return;
      window[name]=async function(...args){const r=await f.apply(this,args);rememberGuestTicket();return r};
    };
    wrapAsync('requestTicket');wrapAsync('requestGuestAccess');wrapAsync('checkTicket');wrapAsync('checkGuestStatus');
    rememberGuestTicket();
  }

  function setUiMessage(text,ok=false){
    const el=document.getElementById('msg')||document.getElementById('loginMsg');
    if(!el)return;
    el.textContent=text||'';
    if(el.id==='msg')el.className='msg'+(ok?' ok':'');
  }

  async function loginWithTicket(){
    const input=document.getElementById('returnTicketInput');
    const btn=document.getElementById('returnTicketBtn');
    const ticket=String(input?.value||'').replace(/\D/g,'');
    if(ticket.length<7)return setUiMessage('Digite um ticket válido.');
    btn.disabled=true;setUiMessage('Verificando ticket...');
    try{
      const r=await fetch(BASE+'/functions/v1/ticket-login-cs',{method:'POST',headers:{'Content-Type':'application/json','apikey':KEY},body:JSON.stringify({ticket})});
      const j=await r.json().catch(()=>({}));
      if(!r.ok||!j.ok)return setUiMessage(j.error||'Ticket não autorizado.');
      const login=await auth('token?grant_type=password',{email:j.guest_email,password:j.guest_password});
      if(!login.ok||!login.data?.access_token)return setUiMessage('Não foi possível entrar com este ticket agora.');
      if(!(await authorized(login.data.access_token)))return setUiMessage('Este ticket não está mais autorizado.');
      saveSession(login.data);
      localStorage.setItem(LAST_TICKET,String(j.ticket||ticket));
      setUiMessage('✅ Ticket confirmado. Entrando no seu perfil...',true);
      setTimeout(()=>location.replace(appUrl()),350);
    }catch{setUiMessage('Falha de conexão. Tente novamente.')}finally{btn.disabled=false}
  }

  if(inApp){
    window.logout=async function(){
      try{if(typeof leaveVoice==='function')await leaveVoice()}catch{}
      try{if(typeof sb!=='undefined')await sb.auth.signOut()}catch{}
      localStorage.removeItem(STORE);
      location.replace('../?logout=1&t='+Date.now());
    };
  }

  setupRootUi();
  autoEnter();
})();