
 // Lista de medicamentos que permitem até 180 dias mesmo com receita branca
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

    function normalizarTexto(txt) {
        return txt
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
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
 // Inicializa event listeners no carregamento da página
      window.onload = function () {
        // Mensagem inicial (já colocada no HTML, aqui só reforço)
        const resultadoBox = document.getElementById("caixa-resultado");
        resultadoBox.innerHTML = `
        ⚠️ Verifique se a receita tem restrição de caixas/comprimidos ou se é uso contínuo.⚠️<br>
        ⚠️ Se o medicamento for similar, verifique se ele é intercambiável com o de referência.⚠️
      `;

        // Radios: atualizam o campo dias na mudança
        const radios = document.querySelectorAll('input[name="tipo-de-uso"]');
        radios.forEach((r) => r.addEventListener("change", atualizarCampoDias));

        // Atualiza estado inicial do campo dias
        atualizarCampoDias();

        // Botão calcular
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
        const tipoUso = radioSelecionado.value; // 'uso-continuo' ou 'medico-estipulou'

        // Validações básicas
        if (!nomeOriginal) {
          resultadoTratamento.innerHTML =
            "❌ Informe o princípio ativo do medicamento.";
          return;
        }
        if (
          !comprimidosPorDia ||
          isNaN(comprimidosPorDia) ||
          comprimidosPorDia <= 0
        ) {
          resultadoTratamento.innerHTML =
            "❌ Informe corretamente quantos comprimidos por dia (número > 0).";
          return;
        }
        const tiposValidos = ["amarela", "azul", "branca", "branca-antibiotico", "branca-psicotropico"];
        if (!tiposValidos.includes(tipoReceita)) {
          resultadoTratamento.innerHTML =
            "❌ Selecione o tipo de receituário: <strong>Amarela</strong>, <strong>Azul</strong> ou <strong>Branca</strong>.";
          return;
        }

        // Normaliza o nome para comparação
        const nomeNormalizado = normalizarTexto(nomeOriginal);

        // Define limite apenas para casos de USO CONTÍNUO (conforme sua regra)
        let limiteDias = null;
        if (tipoUso === "uso-continuo") {
          switch (tipoReceita) {
            case "amarela":
              limiteDias = 30;
              break;
            case "azul":
              limiteDias = 60;
              break;
              case "branca-antibiotico":
              limiteDias = 90;
              break;
              case "branca-psicotropico":
              limiteDias = limiteDias = medicamentosParaAte180Dias.includes(nomeNormalizado)
                ? 180
                : 60;
              break;
            case "branca":
              limiteDias = 'inserterminado';
              break;
          }

          // Resultado quando é uso contínuo: aplicamos o limite
          const totalComprimidos = comprimidosPorDia * limiteDias;
          resultadoTratamento.innerHTML = `✅ <strong>Uso contínuo</strong> — receituário <strong>${tipoReceita}</strong>: pode ser dispensado até <strong>${limiteDias} dias</strong>.<br>
          Quantidade a dispensar (máximo): <strong>${totalComprimidos}</strong> comprimidos.`;
          return;
        }

        // Se chegou aqui, é "médico estipulou dias" → seguimos o valor que o médico colocou
        const diasReceita = Number(campoDias.value);
        if (!diasReceita || isNaN(diasReceita) || diasReceita <= 0) {
          resultadoTratamento.innerHTML =
            "❌ Informe por quantos dias o médico estipulou (número > 0).";
          return;
        }

        const totalComprimidos = comprimidosPorDia * diasReceita;
        resultadoTratamento.innerHTML =
        resultadoTratamento.innerHTML =
  `🧑🏻‍⚕️Médico estipulou <strong>${diasReceita} dias</strong>. Quantidade a dispensar: <strong>${totalComprimidos}</strong> comprimidos.`;
      };