const SHEETDB_URL = 'https://sheetdb.io/api/v1/l64dcgp3xbgwx';
const ADMIN_PASSWORD = 'admin0000';
let fullData = [];

// Menu
function showSection(name){
  document.getElementById('sec-inicial').style.display = name==='inicial'?'block':'none';
  document.getElementById('sec-admin').style.display = name==='admin'?'block':'none';
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
  fullData = data.map(r=>({ ...r, id: r.id })); // Guarda o ID único
  renderTable(fullData);
}

function renderTable(data){
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML='';
  data.forEach(row=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.Nome||''}</td><td>${row.Turma||''}</td><td>${row.Serie||''}</td>
    <td>${row.Data||''}</td><td>${row.Hora||''}</td>
    <td><button class="btn red" onclick="deleteRow('${row.id}')">Deletar</button></td>`;
    tbody.appendChild(tr);
  });
}

function filterTable(){
  const val = document.getElementById('searchInput').value.toLowerCase();
  const filtered = fullData.filter(r=>r.Nome.toLowerCase().includes(val) || r.Turma.toLowerCase().includes(val) || r.Serie.toLowerCase().includes(val));
  renderTable(filtered);
}

// Export CSV
function exportCSV(){
  let csv='Nome,Turma,Série,Data,Hora\n';
  fullData.forEach(r=>{csv+=`${r.Nome||''},${r.Turma||''},${r.Serie||''},${r.Data||''},${r.Hora||''}\n`});
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='presencas.csv'; a.click(); URL.revokeObjectURL(url);
}

// Deletar registro por ID
async function deleteRow(id){
  if(!confirm('Tem certeza que deseja deletar este registro?')) return;
  await fetch(`${SHEETDB_URL}/${id}`, { method: 'DELETE' });
  await carregarPresencas();
}

// Deletar todos
async function deleteAllConfirm(){
  if(!confirm('Tem certeza que deseja apagar todos os registros?')) return;
  if(!confirm('⚠️ Essa ação não pode ser desfeita. Deseja mesmo apagar tudo?')) return;
  await fetch(SHEETDB_URL,{method:'DELETE'});
  alert('✅ Todos os registros foram apagados com sucesso.');
  await carregarPresencas();
}
