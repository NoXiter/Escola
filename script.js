const sheetApi = "https://sheetdb.io/api/v1/curt4mkiwuxf1";
const adminPassword = "admin0000";

const formPresenca = document.getElementById("formPresenca");
const nomeInput = document.getElementById("nome");
const cursoSelect = document.getElementById("curso");
const turmaSelect = document.getElementById("turma");
const serieSelect = document.getElementById("serie");
const statusMsg = document.getElementById("statusMsg");

const menuInicial = document.getElementById("menuInicial");
const menuAdmin = document.getElementById("menuAdmin");
const inicialSection = document.getElementById("inicial");
const adminSection = document.getElementById("admin");

const adminLoginCard = document.getElementById("adminLoginCard");
const adminSenha = document.getElementById("adminSenha");
const btnEntrar = document.getElementById("btnEntrar");
const adminLoginMsg = document.getElementById("adminLoginMsg");
const adminPanel = document.getElementById("adminPanel");

const btnLogout = document.getElementById("btnLogout");
const searchInput = document.getElementById("searchInput");
const tableBody = document.getElementById("tableBody");
const btnCSV = document.getElementById("btnCSV");

const toast = document.getElementById("toast");


menuInicial.addEventListener("click", () => switchSection("inicial"));
menuAdmin.addEventListener("click", () => switchSection("admin"));

function switchSection(section) {
  if (section === "inicial") {
    inicialSection.style.display = "block";
    adminSection.style.display = "none";
    menuInicial.classList.add("active");
    menuAdmin.classList.remove("active");
  } else {
    inicialSection.style.display = "none";
    adminSection.style.display = "block";
    menuInicial.classList.remove("active");
    menuAdmin.classList.add("active");
  }
}


const turmas = {
  DS: ["DS I","DS II","DS III"],
  GASTRO: ["GASTRO I","GASTRO II","GASTRO III"],
  ADM: ["ADM I","ADM II","ADM III"]
};

cursoSelect.addEventListener("change", () => {
  const curso = cursoSelect.value;
  turmaSelect.innerHTML = '<option value="">Selecione a turma</option>';
  if(turmas[curso]){
    turmas[curso].forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      turmaSelect.appendChild(opt);
    });
  }
});


function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),2000);
}


formPresenca.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const curso = cursoSelect.value;
  const turma = turmaSelect.value;
  const serie = serieSelect.value;

  if(!nome || !curso || !turma || !serie){
    showToast("Preencha todos os campos!");
    return;
  }

  
  if(nome.split(" ").length < 2){
    showToast("Digite o nome completo (nome e sobrenome).");
    return;
  }

  if(!/^[a-zA-ZÀ-ÿ\s]+$/.test(nome)){
    showToast("O nome deve conter apenas letras.");
    return;
  }

  if(nome.length < 5){
    showToast("Digite um nome válido com pelo menos 5 caracteres.");
    return;
  }

  
  const now = new Date();
  const data = now.toLocaleDateString("pt-BR");
  const hora = now.toLocaleTimeString("pt-BR");

  const payload = {
    data: [{Nome:nome, Curso:curso, Turma:turma, Série:serie, Data:data, Hora:hora}]
  };

  try {
    const res = await fetch(sheetApi, {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    if(res.ok){
      showToast("Presença registrada!");
      formPresenca.reset();
    } else {
      showToast("Erro ao registrar presença!");
    }
  } catch(err){
    showToast("Erro de conexão!");
    console.error(err);
  }
});


btnEntrar.addEventListener("click", () => {
  if(adminSenha.value === adminPassword){
    adminLoginCard.style.display = "none";
    adminPanel.style.display = "block";
    loadTable();
    showToast("Admin logado!");
  } else {
    adminLoginMsg.textContent = "Senha incorreta!";
  }
});

btnLogout.addEventListener("click", () => {
  adminSenha.value = "";
  adminLoginCard.style.display = "block";
  adminPanel.style.display = "none";
  showToast("Logout realizado");
});


async function loadTable() {
  tableBody.innerHTML = "";
  try {
    const res = await fetch(sheetApi);
    const data = await res.json();
    data.forEach((item,index)=>{
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.Nome}</td>
        <td>${item.Curso}</td>
        <td>${item.Turma}</td>
        <td>${item["Série"]}</td>
        <td>${item.Data}</td>
        <td>${item.Hora}</td>
        <td><button onclick="editRecord(${index})">Editar</button></td>
      `;
      tableBody.appendChild(tr);
    });
  } catch(err){
    console.error(err);
  }
}


async function editRecord(index){
  try{
    const res = await fetch(sheetApi);
    const data = await res.json();
    const item = data[index];
    const campo = prompt("Qual campo deseja editar? (Nome, Curso, Turma, Série)");
    if(!campo || !["Nome","Curso","Turma","Série"].includes(campo)){
      showToast("Campo inválido!");
      return;
    }
    const novoValor = prompt(`Novo valor para ${campo}:`);
    if(!novoValor) return;

    const patchData = {data:[{[campo]:novoValor}]};
    await fetch(`${sheetApi}/${index+1}`, {
      method:"PATCH",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(patchData)
    });
    showToast("Registro atualizado!");
    loadTable();
  } catch(err){
    console.error(err);
    showToast("Erro ao atualizar!");
  }
}


searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  Array.from(tableBody.children).forEach(tr=>{
    const text = tr.textContent.toLowerCase();
    tr.style.display = text.includes(term) ? "" : "none";
  });
});


btnCSV.addEventListener("click", async () => {
  try{
    const res = await fetch(sheetApi);
    const data = await res.json();
    const csv = [
      ["Nome","Curso","Turma","Série","Data","Hora"].join(","),
      ...data.map(d=>[d.Nome,d.Curso,d.Turma,d["Série"],d.Data,d.Hora].join(","))
    ].join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "presenca.csv";
    a.click();
    URL.revokeObjectURL(url);
  } catch(err){
    console.error(err);
    showToast("Erro ao exportar CSV");
  }
});
