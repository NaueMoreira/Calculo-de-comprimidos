const medicamentosParaAte180Dias = [
  // Anticonvulsivantes
  "acido valproico",
  "carbamazepina",
  "divalproato de sodio",
  "etossuximida",
  "fenitoina",
  "fenobarbital",
  "gabapentina",
  "lacosamida",
  "lamotrigina",
  "levetiracetam",
  "oxcarbazepina",
  "pregabalina",
  "primidona",
  "topiramato",
  "vigabatrina",
  "carbonato de litio",
  // Antiparkinsonianos
  "amantadina",
  "biperideno",
  "carbidopa",
  "levodopa",
  "entacapona",
  "perglolina",
  "pramipexol",
  "rasagilina",
  "selegilina",
  "tolcapone"
];

const antibioticos = [
  "amoxicilina",
  "azitromicina",
  "cefalexina",
  "ciprofloxacino",
  "claritromicina",
  "clindamicina",
  "doxiciclina",
  "eritromicina",
  "flucloxacilina",
  "levofloxacino",
  "metronidazol",
  "norfloxacino",
  "penicilina",
  "sulfametoxazol + trimetoprima",
  "bactrim",
  "tetraciclina",
  "amoxicilina + clavulanato",
  "amoxcilina com clavulanato",
  "amoxclina clavulanato"
];

const psicotropicos = [
  "escitalopram",
  "fluoxetina",
  "sertralina",
  "paroxetina",
  "citalopram",
  "venlafaxina",
  "duloxetina",
  "bupropiona",
  "mirtazapina",
  "amitriptilina",
  "nortriptilina",
  "clomipramina",
  "imipramina",
  "trazodona",
  "agomelatina",
  "olanzapina",
  "quetiapina",
  "risperidona",
  "ziprasidona",
  "aripiprazol",
  "clozapina",
  "haloperidol",
  "lurasidona",
  "paliperidona",
  "sertindol",
  "zuclopentixol"
];

function normalizarTexto(txt) {
  return txt
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isAntibiotico(nome) {
  const nomeNormalizado = normalizarTexto(nome);
  return antibioticos.some(
    (item) => normalizarTexto(item) === nomeNormalizado
  );
}

function isPsicotropico(nome) {
  const nomeNormalizado = normalizarTexto(nome);
  return psicotropicos.some(
    (item) => normalizarTexto(item) === nomeNormalizado
  );
}

function temLimite180Dias(nome) {
  const nomeNormalizado = normalizarTexto(nome);
  return medicamentosParaAte180Dias.some(
    (item) => normalizarTexto(item) === nomeNormalizado
  );
}

function getCategoriaMedicamento(nome) {
  if (isAntibiotico(nome)) {
    return "Antibiótico";
  }
  if (temLimite180Dias(nome)) {
    return "Medicamento de controle especial até 180 dias";
  }
  if (isPsicotropico(nome)) {
    return "Psicotrópico";
  }
  return "Medicamento comum";
}

function obterLimiteDiasReceitaBranca(nome) {
  if (isAntibiotico(nome)) {
    return 90;
  }

  if (temLimite180Dias(nome)) {
    return 180;
  }

  if (isPsicotropico(nome)) {
    return 60;
  }

  return null;
}

function montarMensagemCategoria(categoria, tipoReceita) {
  let mensagem = `Categoria identificada: ${categoria}.`;
  if (tipoReceita === "branca" && categoria === "Medicamento comum") {
    mensagem +=
      " O sistema não identificou o medicamento como antibiótico ou psicotrópico; confira a prescrição médica.";
  }
  return mensagem;
}

function atualizarCampoDias() {
  const campoDias = document.getElementById("por-quantos-dias");
  const radioSelecionado = document.querySelector(
    'input[name="tipo-de-uso"]:checked'
  );

  if (radioSelecionado && radioSelecionado.value === "uso-continuo") {
    campoDias.disabled = true;
    campoDias.value = "";
    campoDias.style.backgroundColor = "#212122";
    campoDias.placeholder = "Desabilitado para uso contínuo";
  } else {
    campoDias.disabled = false;
    campoDias.style.backgroundColor = "#0fd7ff";
    campoDias.style.border = "2px solid #06afd1";
    campoDias.placeholder = "Ex: 30";
  }
}

window.onload = function () {
  const resultadoBox = document.getElementById("caixa-resultado");
  resultadoBox.innerHTML = `
    ⚠️ Verifique se a receita tem restrição de caixas/comprimidos ou se é uso contínuo.⚠️<br>
    ⚠️ Se o medicamento for similar, verifique se ele é intercambiável com o de referência.⚠️
  `;

  const radios = document.querySelectorAll('input[name="tipo-de-uso"]');
  radios.forEach((r) => r.addEventListener("change", atualizarCampoDias));

  atualizarCampoDias();

  document
    .getElementById("botao-calcular")
    .addEventListener("click", calcular);
};

function calcular() {
  const resultadoTratamento = document.getElementById("caixa-resultado");
  const campoNome = document.getElementById("nomeMedicamento");
  const campoComprimidosPorDia = document.getElementById("medicamento");
  const campoDias = document.getElementById("por-quantos-dias");
  const selectReceita = document.getElementById("receituario");

  const nomeOriginal = campoNome.value.trim();
  const comprimidosPorDia = Number(campoComprimidosPorDia.value);
  const tipoReceita = selectReceita.value.trim().toLowerCase();

  const radioSelecionado = document.querySelector(
    'input[name="tipo-de-uso"]:checked'
  );
  if (!radioSelecionado) {
    resultadoTratamento.innerHTML =
      "❌ Selecione se é <strong>Uso contínuo</strong> ou <strong>🧑🏻‍⚕️Médico estipulou dias</strong>.";
    return;
  }

  const tipoUso = radioSelecionado.value;

  if (!nomeOriginal) {
    resultadoTratamento.innerHTML =
      "❌ Informe o princípio ativo do medicamento.";
    return;
  }

  if (!comprimidosPorDia || isNaN(comprimidosPorDia) || comprimidosPorDia <= 0) {
    resultadoTratamento.innerHTML =
      "❌ Informe corretamente quantos comprimidos por dia (número > 0).";
    return;
  }

  const tiposValidos = ["amarela", "azul", "branca"];
  if (!tiposValidos.includes(tipoReceita)) {
    resultadoTratamento.innerHTML =
      "❌ Selecione o tipo de receituário: <strong>Amarela</strong>, <strong>Azul</strong> ou <strong>Branca</strong>.";
    return;
  }

  const categoriaIdentificada = getCategoriaMedicamento(nomeOriginal);
  const mensagemCategoria = montarMensagemCategoria(
    categoriaIdentificada,
    tipoReceita
  );

  if (tipoUso === "uso-continuo") {
    let limiteDias = null;

    switch (tipoReceita) {
      case "amarela":
        limiteDias = 30;
        break;
      case "azul":
        limiteDias = 60;
        break;
      case "branca":
        limiteDias = obterLimiteDiasReceitaBranca(nomeOriginal);
        break;
    }

    if (limiteDias) {
      const totalComprimidos = comprimidosPorDia * limiteDias;
      resultadoTratamento.innerHTML = `✅ <strong>Uso contínuo</strong> — receituário <strong>${tipoReceita}</strong>: pode ser dispensado até <strong>${limiteDias} dias</strong>.<br>
        Quantidade a dispensar (máximo): <strong>${totalComprimidos}</strong> comprimidos.<br>
        <em>${mensagemCategoria}</em>`;
      return;
    }

    resultadoTratamento.innerHTML = `✅ <strong>Uso contínuo</strong> — receituário <strong>Branca</strong>: não há limite automático definido.<br>
      <em>${mensagemCategoria}</em>`;
    return;
  }

  const diasReceita = Number(campoDias.value);
  if (!diasReceita || isNaN(diasReceita) || diasReceita <= 0) {
    resultadoTratamento.innerHTML =
      "❌ Informe por quantos dias o médico estipulou (número > 0).";
    return;
  }

  const totalComprimidos = comprimidosPorDia * diasReceita;
  resultadoTratamento.innerHTML = `🧑🏻‍⚕️Médico estipulou <strong>${diasReceita} dias</strong>. Quantidade a dispensar: <strong>${totalComprimidos}</strong> comprimidos.<br>
    <em>${mensagemCategoria}</em>`;
}
