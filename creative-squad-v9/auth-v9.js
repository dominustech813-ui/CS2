window.sendCode = async function(resend=false){
  const email = resend ? pendingEmail : $('email').value.trim();
  if(!email || !email.includes('@')) return loginMsg('Digite um e-mail válido.');
  pendingEmail=email;
  loginMsg('Bot CDL está enviando o código...');
  try{
    const r = await fetch('https://yivgtvgyaalhlcxatbfc.supabase.co/functions/v1/send-cs-otp',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY},
      body:JSON.stringify({action:'send_code',email})
    });
    const j = await r.json().catch(()=>({}));
    if(!r.ok || !j.ok) return loginMsg(j.error || 'Não foi possível enviar o código agora.');
    localStorage.setItem('cs_last_email_v1',email.toLowerCase());
    $('emailStep').classList.add('hidden');
    $('codeStep').classList.remove('hidden');
    $('codeEmail').textContent=email;
    $('code').value='';
    loginMsg('Código enviado pelo Bot CDL. Confira seu e-mail.');
  }catch(e){
    loginMsg('Não foi possível conectar ao Bot CDL. Tente novamente.');
  }
};

const CDL_KEEP_LOGIN='cs_keep_logged_v35';

window.logout = async function(){
  try{if(typeof leaveVoice==='function')await leaveVoice()}catch{}
  try{if(typeof msgSub!=='undefined'&&msgSub)await sb.removeChannel(msgSub)}catch{}
  localStorage.removeItem(CDL_KEEP_LOGIN);
  try{await sb.auth.signOut()}catch{}
  localStorage.removeItem('sb-yivgtvgyaalhlcxatbfc-auth-token');
  location.replace('../?logout=1&t='+Date.now());
};

async function keepCdlSessionAlive(){
  try{
    const {data}=await sb.auth.getSession();
    if(!data?.session)return false;
    localStorage.setItem(CDL_KEEP_LOGIN,'1');
    const expiresAt=Number(data.session.expires_at||0);
    if(expiresAt && expiresAt<=Math.floor(Date.now()/1000)+300){
      const refreshed=await sb.auth.refreshSession();
      if(refreshed?.data?.session)localStorage.setItem(CDL_KEEP_LOGIN,'1');
    }
    return true;
  }catch{return false}
}

async function ensureCdlAccount(){
  try{
    await keepCdlSessionAlive();
    const {data}=await sb.auth.getSession();
    const session=data?.session;
    if(!session?.access_token)return;
    localStorage.setItem(CDL_KEEP_LOGIN,'1');
    const r=await fetch('https://yivgtvgyaalhlcxatbfc.supabase.co/functions/v1/cdl-account-auth',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':'Bearer '+session.access_token},
      body:JSON.stringify({action:'status'})
    });
    const j=await r.json().catch(()=>({}));
    if(r.ok&&j.ok&&j.has_account){
      if(j.username)localStorage.setItem('cs_cdl_username_v1',j.username);
      return;
    }
    location.replace('../?create=1&t='+Date.now());
  }catch{}
}

try{
  sb.auth.onAuthStateChange((event,session)=>{
    if(session && event!=='SIGNED_OUT')localStorage.setItem(CDL_KEEP_LOGIN,'1');
    if(event==='SIGNED_OUT' && !location.search.includes('logout=1')){
      // Não apaga dados adicionais aqui. O logout real é feito somente pelo botão Sair.
    }
  });
}catch{}

setInterval(()=>{if(document.visibilityState==='visible')keepCdlSessionAlive()},15*60*1000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')keepCdlSessionAlive()});
window.addEventListener('pageshow',()=>keepCdlSessionAlive());

(()=>{
  if(!document.getElementById('roleEditorV23Script')){
    const s=document.createElement('script');
    s.id='roleEditorV23Script';
    s.src='../creative-squad/role-editor-v23.js?v=24';
    document.head.appendChild(s);
  }
  setTimeout(ensureCdlAccount,500);
})();
