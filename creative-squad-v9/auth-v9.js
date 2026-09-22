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
let __cdlDeletedHandled=false;

window.logout = async function(){
  try{if(typeof leaveVoice==='function')await leaveVoice()}catch{}
  try{if(typeof msgSub!=='undefined'&&msgSub)await sb.removeChannel(msgSub)}catch{}
  localStorage.removeItem(CDL_KEEP_LOGIN);
  try{await sb.auth.signOut()}catch{}
  localStorage.removeItem('sb-yivgtvgyaalhlcxatbfc-auth-token');
  location.replace('../?logout=1&t='+Date.now());
};

async function handleDeletedAccount(){
  if(__cdlDeletedHandled)return;__cdlDeletedHandled=true;
  try{if(typeof leaveVoice==='function')await leaveVoice()}catch{}
  localStorage.removeItem(CDL_KEEP_LOGIN);
  localStorage.removeItem('cs_cdl_username_v1');
  try{await sb.auth.signOut()}catch{}
  localStorage.removeItem('sb-yivgtvgyaalhlcxatbfc-auth-token');
  alert('Sua sessão foi encerrada e sua conta foi excluída. Por favor, crie outra.');
  location.replace('../?logout=1&account_deleted=1&t='+Date.now());
}

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

async function accountState(){
  try{
    const {data}=await sb.auth.getSession();
    const session=data?.session;
    if(!session?.access_token)return {ok:false,status:401};
    const r=await fetch('https://yivgtvgyaalhlcxatbfc.supabase.co/functions/v1/cdl-account-auth',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':'Bearer '+session.access_token},
      body:JSON.stringify({action:'status'})
    });
    const j=await r.json().catch(()=>({}));
    if(r.status===410&&j.code==='account_deleted'){await handleDeletedAccount();return {ok:false,status:410,data:j}}
    return {ok:r.ok,status:r.status,data:j,session};
  }catch{return {ok:false,status:0}}
}

async function ensureCdlAccount(){
  try{
    await keepCdlSessionAlive();
    const st=await accountState();
    if(!st?.ok)return;
    localStorage.setItem(CDL_KEEP_LOGIN,'1');
    if(st.data?.ok&&st.data?.has_account){
      if(st.data.username)localStorage.setItem('cs_cdl_username_v1',st.data.username);
      return;
    }
    location.replace('../?create=1&t='+Date.now());
  }catch{}
}

async function monitorAccountState(){
  const st=await accountState();
  if(st?.status===410)return;
  if(st?.status===401){
    localStorage.removeItem(CDL_KEEP_LOGIN);
    localStorage.removeItem('sb-yivgtvgyaalhlcxatbfc-auth-token');
    location.replace('../?logout=1&t='+Date.now());
  }
}

try{
  sb.auth.onAuthStateChange((event,session)=>{
    if(session && event!=='SIGNED_OUT')localStorage.setItem(CDL_KEEP_LOGIN,'1');
    if(event==='SIGNED_OUT' && !location.search.includes('logout=1')){
      // O logout normal continua acontecendo somente pelo botão Sair.
    }
  });
}catch{}

setInterval(()=>{if(document.visibilityState==='visible')keepCdlSessionAlive()},15*60*1000);
setInterval(()=>{if(document.visibilityState==='visible')monitorAccountState()},5000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){keepCdlSessionAlive();monitorAccountState()}});
window.addEventListener('pageshow',()=>{keepCdlSessionAlive();monitorAccountState()});

(()=>{
  if(!document.getElementById('roleEditorV23Script')){
    const s=document.createElement('script');
    s.id='roleEditorV23Script';
    s.src='../creative-squad/role-editor-v23.js?v=24';
    document.head.appendChild(s);
  }
  setTimeout(ensureCdlAccount,500);
})();