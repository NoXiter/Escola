const SHEETDB_URL = 'https://sheetdb.io/api/v1/l64dcgp3xbgwx';
const ADMIN_PASSWORD = 'admin0000';
let fullData = [];

// Menu
function showSection(name){
  document.getElementById('sec-inicial').style.display = name==='inicial'?'':'none';
  document.getElementById('sec-admin').style.display = name==='admin'?'':'none';
  document.getElementById('menuInicial').classList.toggle('active', name==='inicial');
  document.getElementById('menuAdmin').classList.toggle('active', name==='admin');
}

// Formulário
function clearForm(){ 
  document.getElementById('formPresenca').reset(); 
  document.getElementById('statusMsg').textContent = ''; 
}

document.getElementById('formPresenca').addEventListener('submit', async function(e){
  e.preventDefault();
  const nome = document.getElementById('nome').value.trim();
  const turma = document.getElementById('turma').value.trim();
  const serie = document.getElementById('serie').value.trim();
  const status = document.getElementById('statusMsg');
  if(!nome){status.textContent='Digite o nome.'; return;}
  
  const now = new Date();
  const payload = {
    data: {
      Nome: nome,
      Turma: turma,
      Serie: serie,
      Data: now.toLocaleDateString(),
      Hora: now.toLocaleTimeString()
    }
  };
  
  try{
    status.textContent='Enviando...';
    const res = await fetch(SHEETDB_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    if(!res.ok) throw new Error('Erro ao salvar');
    status.textContent='✅ Presença registrada!';
    document.getElementById('formPresenca').reset();
    setTimeout(()=>status.textContent='',2500);
  }catch(err){console.error(err); status.textContent='❌ Erro ao registrar.';}
});

// Admin
async function adminLogin(){
  const pass = document.getElementById('adminSenha').value;
  const msg = document.getElementById('adminLoginMsg');
  if(pass!==ADMIN_PASSWORD){msg.textContent='Senha incorreta.'; return;}
  msg.textContent='';
  document.getElementById('adminLoginWrap').style.display='none';
  document.getElementById('adminPanel').style.display='';
  await carregarPresencas();
}

function logoutAdmin(){
  document.getElementById('adminSenha').value='';
  document.getElementById('adminLoginWrap').style.display='';
  document.getElementById('adminPanel').style.display='none';
  fullData=[];
  document.getElementById('tableBody').innerHTML='';
}

// Carregar presenças
async function carregarPresencas(){
  const res = await fetch(SHEETDB_URL);
  const data = await res.json();
  // Guardar ID único de cada registro
  fullData = data.map(r=>({ ...r, id: r.id }));
  renderTable(fullData);
}

function renderTable(data){
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML='';
  data.forEach(row=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.Nome||''}</td><td>${row.Turma||''}</td><td>${row.Serie||''}</td>
    <td>${row.Data||''}</td><td>${row.Hora||''}</td>
    <td><button class="btn red" onclick="deleteRow('${row
