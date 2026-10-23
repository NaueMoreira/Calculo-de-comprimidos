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
  "ampicilina",
  "cefaclor",
  "ceftriaxona",
  "cefuroxima"
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
  "desvenlafaxina",
  "vortioxetina",
  "olanzapina",
  "quetiapina",
  "risperidona",
  "ziprasidona",
  "aripiprazol",
  "clozapina",
  "haloperidol",
  "haldol",
  "lurasidona",
  "paliperidona",
  "sertindol",
  "zuclopentixol",
  "clonazepam",
  "rivotril",
  "diazepam",
  "bromazepam",
  "lexotan",
  "alprazolam",
  "lorazepam",
  "clobazam",
  "midazolam",
  "zolpidem"
];

function normalizarTexto(txt) {
  if (!txt) return "";
  return txt
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function contemNaLista(lista, nomeDigitado) {
  const norm = normalizarTexto(nomeDigitado);
  if (!norm) return false;

  return lista.some((item) => {
    const itemNorm = normalizarTexto(item);
    if (norm === itemNorm) return true;
    const regex = new RegExp(`(^|\\s|\\W)${itemNorm}(\\s|\\W|$)`, "i");
    return regex.test(norm) || norm.includes(itemNorm);
  });
}

function isAntibiotico(nome) {
  return contemNaLista(antibioticos, nome);
}

function isPsicotropico(nome) {
  return contemNaLista(psicotropicos, nome);
}

function temLimite180Dias(nome) {
  return contemNaLista(medicamentosParaAte180Dias, nome);
}

/**
 * Retorna a categoria do medicamento:
 * - "Antibiótico"
 * - "Psicotrópico"
 * - "Medicamento de controle especial até 180 dias"
 * - "Medicamento comum" (caso contrário)
 */
function getCategoriaMedicamento(nome) {
  if (!nome || !normalizarTexto(nome)) {
    return null;
  }
  if (isAntibiotico(nome)) {
    return "Antibiótico";
  }
  if (isPsicotropico(nome)) {
    return "Psicotrópico";
  }
  if (temLimite180Dias(nome)) {
    return "Medicamento de controle especial até 180 dias";
  }
  return "Medicamento comum";
}

/**
 * Obtém limite em dias para receita branca:
 * - Antibióticos: 90 dias
 * - Psicotrópicos: 60 dias
 * - Controle Especial até 180 dias: 180 dias
 * - Medicamento comum: 180 dias (validade máxima da receita comum de uso contínuo - 6 meses)
 */
function obterLimiteDiasReceitaBranca(nome) {
  const categoria = getCategoriaMedicamento(nome);
  switch (categoria) {
    case "Antibiótico":
      return 90;
    case "Psicotrópico":
      return 60;
    case "Medicamento de controle especial até 180 dias":
      return 180;
    case "Medicamento comum":
    default:
      return 180;
  }
}

function montarMensagemCategoria(categoria, tipoReceita) {
  if (!categoria) return "";

  if (tipoReceita === "branca" || tipoReceita.startsWith("branca")) {
    switch (categoria) {
      case "Antibiótico":
        return "📋 <strong>Receita Branca</strong>: Medicamento identificado como <strong>Antibiótico</strong> (antimicrobiano — limite de até 90 dias com retenção de receita).";
      case "Psicotrópico":
        return "📋 <strong>Receita Branca</strong>: Medicamento identificado como <strong>Psicotrópico</strong> (Portaria 344/98 Lista C1 — limite legal de até 60 dias com retenção de 2ª via).";
      case "Medicamento de controle especial até 180 dias":
        return "📋 <strong>Receita Branca</strong>: Medicamento identificado como <strong>Controle Especial</strong> (Anticonvulsivante/Antiparkinsoniano — limite de até 180 dias).";
      case "Medicamento comum":
      default:
        return "📋 <strong>Receita Branca</strong>: Medicamento identificado como <strong>Medicamento comum</strong> (não classificado como antibiótico ou psicotrópico; dispensação para uso contínuo recomendada para até 180 dias / 6 meses).";
    }
  }

  return `Categoria identificada: ${categoria}.`;
}

// =========================================================
// FEEDBACK DINÂMICO NO FRONTEND
// =========================================================
function obterOuCriarElementoInfoCategoria() {
  let elemento = document.getElementById("info-categoria-receita");
  if (!elemento) {
    const selectReceita = document.getElementById("receituario");
    if (selectReceita && selectReceita.parentNode) {
      elemento = document.createElement("div");
      elemento.id = "info-categoria-receita";
      elemento.style.margin = "10px auto";
      elemento.style.padding = "10px 14px";
      elemento.style.borderRadius = "8px";
      elemento.style.fontSize = "14px";
      elemento.style.maxWidth = "500px";
      elemento.style.textAlign = "left";
      elemento.style.lineHeight = "1.4";
      elemento.style.boxShadow = "0 2px 5px rgba(0,0,0,0.15)";
      selectReceita.parentNode.insertBefore(elemento, selectReceita.nextSibling);
    }
  }
  return elemento;
}

function atualizarStatusReceitaBranca() {
  const selectReceita = document.getElementById("receituario");
  const campoNome = document.getElementById("nomeMedicamento");
  const infoBox = obterOuCriarElementoInfoCategoria();

  if (!selectReceita || !infoBox) return;

  const tipoReceita = selectReceita.value.trim().toLowerCase();
  const nomeOriginal = campoNome ? campoNome.value.trim() : "";

  if (tipoReceita === "branca" || tipoReceita.startsWith("branca")) {
    infoBox.style.display = "block";

    if (!nomeOriginal) {
      infoBox.style.backgroundColor = "#e8f4f8";
      infoBox.style.borderLeft = "5px solid #06afd1";
      infoBox.style.color = "#034f60";
      infoBox.innerHTML = `
        ℹ️ <strong>Receita Branca selecionada:</strong><br>
        Digite o princípio ativo acima para o sistema identificar automaticamente se é
        <strong>Antibiótico</strong>, <strong>Psicotrópico</strong> ou <strong>Medicamento comum</strong>.
      `;
      return;
    }

    const categoria = getCategoriaMedicamento(nomeOriginal);

    if (categoria === "Antibiótico") {
      infoBox.style.backgroundColor = "#e8f5e9";
      infoBox.style.borderLeft = "5px solid #2e7d32";
      infoBox.style.color = "#1b5e20";
      infoBox.innerHTML = `
        🩺 <strong>Receita Branca — Antibiótico identificado!</strong><br>
        O medicamento <em>"${nomeOriginal}"</em> é classificado como <strong>antimicrobiano</strong>.<br>
        • Limite de dispensação em uso contínuo: <strong>até 90 dias</strong>.<br>
        • Exige retenção de 2ª via da receita (RDC 20/2011).
      `;
    } else if (categoria === "Psicotrópico") {
      infoBox.style.backgroundColor = "#f3e5f5";
      infoBox.style.borderLeft = "5px solid #7b1fa2";
      infoBox.style.color = "#4a148c";
      infoBox.innerHTML = `
        🧠 <strong>Receita Branca — Psicotrópico identificado!</strong><br>
        O medicamento <em>"${nomeOriginal}"</em> pertence à <strong>Lista C1 da Portaria 344/98</strong>.<br>
        • Limite legal de dispensação: <strong>até 60 dias</strong>.<br>
        • Exige receita de controle especial em 2 vias com retenção.
      `;
    } else if (categoria === "Medicamento de controle especial até 180 dias") {
      infoBox.style.backgroundColor = "#fff3e0";
      infoBox.style.borderLeft = "5px solid #ef6c00";
      infoBox.style.color = "#e65100";
      infoBox.innerHTML = `
        📋 <strong>Receita Branca — Controle Especial (até 180 dias)!</strong><br>
        O medicamento <em>"${nomeOriginal}"</em> é anticonvulsivante/antiparkinsoniano (Portaria 344/98).<br>
        • Limite legal de dispensação: <strong>até 180 dias</strong>.<br>
        • Exige retenção da 2ª via da receita.
      `;
    } else {
      infoBox.style.backgroundColor = "#e3f2fd";
      infoBox.style.borderLeft = "5px solid #1976d2";
      infoBox.style.color = "#0d47a1";
      infoBox.innerHTML = `
        💊 <strong>Receita Branca — Medicamento Comum!</strong><br>
        O medicamento <em>"${nomeOriginal}"</em> não consta nas listas de controle especial nem antibióticos.<br>
        • Dispensação para uso contínuo recomendada para <strong>até 180 dias (6 meses)</strong>.<br>
        • Receituário comum sem necessidade de retenção de 2ª via especial.
      `;
    }
  } else if (tipoReceita === "amarela") {
    infoBox.style.display = "block";
    infoBox.style.backgroundColor = "#fffde7";
    infoBox.style.borderLeft = "5px solid #fbc02d";
    infoBox.style.color = "#7f6000";
    infoBox.innerHTML = `
      ⚠️ <strong>Receituário Amarelo (Notificação A):</strong><br>
      Medicamento entorpecente ou psicoestimulante (Portaria 344/98).<br>
      • Limite legal de dispensação: <strong>até 30 dias</strong>.
    `;
  } else if (tipoReceita === "azul") {
    infoBox.style.display = "block";
    infoBox.style.backgroundColor = "#e1f5fe";
    infoBox.style.borderLeft = "5px solid #0288d1";
    infoBox.style.color = "#01579b";
    infoBox.innerHTML = `
      ⚠️ <strong>Receituário Azul (Notificação B):</strong><br>
      Medicamento psicotrópico / anorexígeno (Portaria 344/98).<br>
      • Limite legal de dispensação: <strong>até 60 dias</strong>.
    `;
  } else {
    infoBox.style.display = "none";
    infoBox.innerHTML = "";
  }
}

function atualizarCampoDias() {
  const campoDias = document.getElementById("por-quantos-dias");
  const radioSelecionado = document.querySelector(
    'input[name="tipo-de-uso"]:checked'
  );

  if (!campoDias) return;

  if (radioSelecionado && radioSelecionado.value === "uso-continuo") {
    campoDias.disabled = true;
    campoDias.value = "";
    campoDias.classList.add('input-disabled');
    campoDias.placeholder = "Desabilitado para uso contínuo";
  } else {
    campoDias.disabled = false;
    campoDias.classList.remove('input-disabled');
    campoDias.placeholder = "Ex: 30";
  }
}

window.onload = function () {
  const resultadoBox = document.getElementById("caixa-resultado");
  if (resultadoBox) {
    resultadoBox.innerHTML = `
      ⚠️ Verifique se a receita tem restrição de caixas/comprimidos ou se é uso contínuo.⚠️<br>
      ⚠️ Se o medicamento for similar, verifique se ele é intercambiável com o de referência.⚠️
    `;
  }

  const radios = document.querySelectorAll('input[name="tipo-de-uso"]');
  radios.forEach((r) => r.addEventListener("change", atualizarCampoDias));
  atualizarCampoDias();

  const selectReceita = document.getElementById("receituario");
  const campoNome = document.getElementById("nomeMedicamento");

  if (selectReceita) {
    selectReceita.addEventListener("change", atualizarStatusReceitaBranca);
  }
  if (campoNome) {
    campoNome.addEventListener("input", atualizarStatusReceitaBranca);
    campoNome.addEventListener("blur", atualizarStatusReceitaBranca);
  }

  const btnCalcular =
    document.getElementById("botao-calcular") || document.getElementById("c");
  if (btnCalcular) {
    btnCalcular.addEventListener("click", calcular);
  }

  atualizarStatusReceitaBranca();
};

function calcular() {
  const resultadoTratamento = document.getElementById("caixa-resultado");
  const mensagemInicial = document.getElementById("mensagem-inicial");
  const campoNome = document.getElementById("nomeMedicamento");
  const campoComprimidosPorDia = document.getElementById("medicamento");
  const campoDias = document.getElementById("por-quantos-dias");
  const selectReceita = document.getElementById("receituario");

  const nomeOriginal = campoNome ? campoNome.value.trim() : "";
  const comprimidosPorDia = campoComprimidosPorDia ? Number(campoComprimidosPorDia.value) : 0;
  const tipoReceita = selectReceita ? selectReceita.value.trim().toLowerCase() : "";

  const radioSelecionado = document.querySelector(
    'input[name="tipo-de-uso"]:checked'
  );

  function mostrarErro(mensagem) {
    if (mensagemInicial) mensagemInicial.style.display = 'none';
    resultadoTratamento.innerHTML = `<div class="error-box">${mensagem}</div>`;
  }

  function mostrarSucesso(dados) {
    if (mensagemInicial) mensagemInicial.style.display = 'none';
    const resultBox = resultadoTratamento.querySelector('.result-box');
    resultadoTratamento.innerHTML = `
      <div class="result-box">
        <h3>📋 Resultado do Cálculo</h3>
        <div class="result-value">${dados.valor}</div>
        <p style="color: var(--text-secondary); margin-top: var(--space-2);">${dados.unidade}</p>
        <div class="result-details">${dados.detalhes}</div>
      </div>
    `;
  }

  if (!radioSelecionado) {
    mostrarErro('<strong>⚠️ Atenção:</strong> Selecione se é <strong>Uso contínuo</strong> ou <strong>Médico estipulou dias</strong>.');
    return;
  }

  const tipoUso = radioSelecionado.value;

  if (!nomeOriginal) {
    mostrarErro('<strong>⚠️ Atenção:</strong> Informe o princípio ativo do medicamento.');
    return;
  }

  if (!comprimidosPorDia || isNaN(comprimidosPorDia) || comprimidosPorDia <= 0) {
    mostrarErro('<strong>⚠️ Atenção:</strong> Informe corretamente quantos comprimidos por dia (número > 0).');
    return;
  }

  const tiposValidos = ["amarela", "azul", "branca", "branca-antibiotico", "branca-psicotropico"];
  if (!tiposValidos.includes(tipoReceita)) {
    mostrarErro('<strong>⚠️ Atenção:</strong> Selecione o tipo de receituário: <strong>Amarela</strong>, <strong>Azul</strong> ou <strong>Branca</strong>.');
    return;
  }

  const categoriaIdentificada = getCategoriaMedicamento(nomeOriginal);
  const mensagemCategoria = montarMensagemCategoria(categoriaIdentificada, tipoReceita);

  if (tipoUso === "uso-continuo") {
    let limiteDias = null;

    if (tipoReceita === "amarela") {
      limiteDias = 30;
    } else if (tipoReceita === "azul") {
      limiteDias = 60;
    } else if (tipoReceita === "branca" || tipoReceita.startsWith("branca")) {
      limiteDias = obterLimiteDiasReceitaBranca(nomeOriginal);
    }

    if (limiteDias) {
      const totalComprimidos = comprimidosPorDia * limiteDias;

      mostrarSucesso({
        valor: totalComprimidos.toLocaleString('pt-BR'),
        unidade: 'comprimidos a serem dispensados',
        detalhes: `
          <strong>💊 Tipo:</strong> Uso contínuo<br>
          <strong>📄 Receituário:</strong> ${tipoReceita.toUpperCase()}<br>
          <strong>📅 Limite de dispensação:</strong> ${limiteDias} dias<br>
          <strong>🏥 Cálculo:</strong> ${comprimidosPorDia} comprimidos/dia × ${limiteDias} dias = ${totalComprimidos} comprimidos
        `
      });
      return;
    }

    mostrarSucesso({
      valor: '—',
      unidade: 'uso contínuo',
      detalhes: `
        <strong>📄 Receituário:</strong> Branca<br>
        <strong>ℹ️ Informação:</strong> Não há limite automático definido. Verifique a legislação vigente.
      `
    });
    return;
  }

  const diasReceita = Number(campoDias.value);
  if (!diasReceita || isNaN(diasReceita) || diasReceita <= 0) {
    mostrarErro('<strong>⚠️ Atenção:</strong> Informe por quantos dias o médico estipulou (número > 0).');
    return;
  }

  const totalComprimidos = comprimidosPorDia * diasReceita;

  mostrarSucesso({
    valor: totalComprimidos.toLocaleString('pt-BR'),
    unidade: 'comprimidos a serem dispensados',
    detalhes: `
      <strong>👨‍⚕️ Tipo:</strong> Médico estipulou dias<br>
      <strong>📄 Receituário:</strong> ${tipoReceita.toUpperCase()}<br>
      <strong>📅 Período:</strong> ${diasReceita} dias<br>
      <strong>🏥 Cálculo:</strong> ${comprimidosPorDia} comprimidos/dia × ${diasReceita} dias = ${totalComprimidos} comprimidos
    `
  });
}
