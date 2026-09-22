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

window.logout = async function(){
  try{if(typeof leaveVoice==='function')await leaveVoice()}catch{}
  try{if(typeof msgSub!=='undefined'&&msgSub)await sb.removeChannel(msgSub)}catch{}
  try{await sb.auth.signOut()}catch{}
  localStorage.removeItem('sb-yivgtvgyaalhlcxatbfc-auth-token');
  location.replace('../?logout=1&t='+Date.now());
};

async function ensureCdlAccount(){
  try{
    const {data}=await sb.auth.getSession();
    const session=data?.session;
    if(!session?.access_token)return;
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

(()=>{
  if(!document.getElementById('roleEditorV23Script')){
    const s=document.createElement('script');
    s.id='roleEditorV23Script';
    s.src='../creative-squad/role-editor-v23.js?v=24';
    document.head.appendChild(s);
  }
  setTimeout(ensureCdlAccount,500);
})();
