/*
  Serviço de geração de relatórios em PDF.
  Ele recebe o contexto pronto do DataService e monta documentos PDF no navegador.
  A ideia é manter a emissão de relatórios fora do app.js, para não misturar UI com geração documental.
*/
window.ReportService = (() => {
  /*
    Atalho para criar o documento PDF.
    Usamos jsPDF em orientação retrato e unidade em pontos para ter controle fino.
  */
  const createPdfDocument = () => {
    const { jsPDF } = window.jspdf;
    return new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });
  };

  /*
    Formata texto simples para evitar undefined em PDF.
  */
  const safeText = (value) => String(value ?? "-");

  const formatDate = (value) => {
    const date = String(value || "");

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return safeText(value);
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
  };

  const getReportCompany = (context) => {
    if (context.reportType !== "evaluation") {
      return context.company;
    }

    return {
      ...(context.selectedEvaluation?.companySnapshot || context.company),
      classification:
        context.selectedEvaluation?.maturityClassification ||
        context.company?.classification ||
        "Skate"
    };
  };

  const getLatestEvaluation = (context) => {
    if (context.reportType === "evaluation" && context.selectedEvaluation) {
      return context.selectedEvaluation;
    }

    return [...(context.evaluations || [])].sort((a, b) => {
      if (Number(a.year) !== Number(b.year)) {
        return Number(b.year) - Number(a.year);
      }

      if (Number(a.semester) !== Number(b.semester)) {
        return Number(b.semester) - Number(a.semester);
      }

      return new Date(b.date) - new Date(a.date);
    })[0] || null;
  };

  const getEvaluationPeriodLabel = (evaluation) => {
    const date = String(evaluation?.date || "");
    const year = Number(evaluation?.year || date.slice(0, 4));
    const month = Number(date.slice(5, 7));
    const semester = Number(
      evaluation?.semester || (month >= 1 && month <= 6 ? 1 : 2)
    );

    if (Number.isNaN(year)) {
      return "-";
    }

    return `${semester}º semestre de ${year}`;
  };

  /*
    Cria nome padronizado para o arquivo PDF.
  */
  const buildFileName = (reportType, companyName, suffix = "") => {
    const normalizedCompany = String(companyName || "empresa")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const normalizedSuffix = suffix
      ? `-${String(suffix)
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, "-")}`
      : "";

    return `startuppulse-${reportType}-${normalizedCompany}${normalizedSuffix}.pdf`;
  };

    /*
    Desenha o cabeçalho institucional do relatório.
    Agora com visual mais forte e melhor hierarquia.
  */
  const addHeader = (doc, title, subtitle) => {
    /* Barra superior principal */
    doc.setFillColor(15, 68, 104);
    doc.rect(0, 0, 595, 82, "F");

    /* Faixa decorativa secundária */
    doc.setFillColor(24, 181, 255);
    doc.rect(0, 82, 595, 6, "F");

    /* Marca */
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(21);
    doc.text("StartupPulse", 40, 34);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("CERNE Monitor • Plataforma de acompanhamento da incubadora", 40, 50);

    /* Título do relatório */
    doc.setTextColor(22, 50, 79);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(title, 40, 118);

    /* Subtítulo */
    doc.setTextColor(95, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(subtitle, 40, 134);

    /* Linha de separação */
    doc.setDrawColor(216, 226, 238);
    doc.line(40, 146, 555, 146);

    return 166;
  };

  /*
    Escreve um subtítulo de seção.
  */
  /*
    Escreve subtítulo de seção com melhor destaque visual.
  */
  const addSectionTitle = (doc, title, y) => {
    doc.setFillColor(244, 247, 251);
    doc.roundedRect(40, y - 14, 515, 26, 6, 6, "F");

    doc.setTextColor(15, 68, 104);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    doc.text(title, 52, y + 3);

    return y + 22;
  };

  /*
    Cria uma tabela simples key-value.
  */
  const addKeyValueTable = (doc, rows, y) => {
    doc.autoTable({
      startY: y,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 6,
        textColor: [22, 50, 79]
      },
      headStyles: {
        fillColor: [15, 68, 104],
        textColor: [255, 255, 255]
      },
      columnStyles: {
        0: { cellWidth: 160, fontStyle: "bold" },
        1: { cellWidth: "auto" }
      },
      head: [["Campo", "Valor"]],
      body: rows
    });

    return doc.lastAutoTable.finalY + 18;
  };

  /*
    Adiciona parágrafo longo quebrado em múltiplas linhas.
  */
  const addParagraph = (doc, label, text, y) => {
    doc.setTextColor(22, 50, 79);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(label, 40, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const lines = doc.splitTextToSize(safeText(text), 515);
    doc.text(lines, 40, y + 14);

    return y + 14 + lines.length * 12 + 10;
  };

  /*
    Cria um pequeno resumo executivo com score e classificação.
  */
  const addExecutiveSummaryBox = (doc, context, y) => {
    const company = getReportCompany(context);
    const evaluation = getLatestEvaluation(context);
    doc.setFillColor(248, 251, 254);
    doc.roundedRect(40, y, 515, 74, 10, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(22, 50, 79);
    doc.text("Resumo executivo", 54, y + 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(95, 116, 139);
    doc.text(`Empresa: ${safeText(company.name)}`, 54, y + 40);

    if (context.reportType === "financial") {
      const axisScore = context.financialSummary?.axisScore;
      const maturity =
        context.latestEvaluation?.maturityClassification ||
        company.classification ||
        "Skate";

      doc.text(`Classificação de maturidade: ${safeText(maturity)}`, 54, y + 56);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 68, 104);
      doc.text(
        axisScore === null || axisScore === undefined
          ? "-"
          : Number(axisScore).toFixed(2),
        500,
        y + 36,
        { align: "right" }
      );
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(95, 116, 139);
      doc.text("Nota do eixo Capital", 500, y + 52, { align: "right" });
    } else {
      const score = evaluation
        ? Number(evaluation.overallScore || 0)
        : Number(company.currentScore || 0);
      const classification =
        evaluation?.maturityClassification ||
        company.classification ||
        "Skate";
      const scoreLabel = evaluation
        ? `Score de ${getEvaluationPeriodLabel(evaluation)}`
        : "Score cadastral atual";

      doc.text(`Classificação de maturidade: ${safeText(classification)}`, 54, y + 56);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 68, 104);
      doc.text(score.toFixed(2), 500, y + 36, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(95, 116, 139);
      doc.text(scoreLabel, 500, y + 52, { align: "right" });
    }

    return y + 92;
  };

  /*
    Adiciona rodapé simples e elegante em todas as páginas.
  */
  const addFooterToAllPages = (doc) => {
    const totalPages = doc.getNumberOfPages();

    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);

      doc.setDrawColor(216, 226, 238);
      doc.line(40, 800, 555, 800);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(95, 116, 139);
      doc.text("StartupPulse • Relatório emitido pela incubadora", 40, 815);
      doc.text(`Página ${page} de ${totalPages}`, 500, 815);
    }
  };

  /*
    Seção: identificação da empresa.
  */
  const addCompanyIdentitySection = (doc, context, y) => {
    const company = getReportCompany(context);
    y = addSectionTitle(doc, "Identificação da empresa", y);

    return addKeyValueTable(
      doc,
      [
        ["Nome fantasia", safeText(company.name)],
        ["Razão social", safeText(company.corporateName)],
        ["CNPJ", safeText(company.cnpj)],
        ["Representante", safeText(company.representative)],
        ["CPF do representante", safeText(company.representativeCpf)],
        ["E-mail", safeText(company.email)],
        ["Telefone", safeText(company.phone)],
        ["Setor", safeText(company.sector)],
        ["Ano de incubação", safeText(company.incubationYear)],
        ["Status cadastral", safeText(company.status)],
        [
          "Classificação de maturidade",
          safeText(company.classification || "Skate")
        ]
      ],
      y
    );
  };

  /*
    Seção: visão geral da empresa.
  */
  const addCompanyOverviewSection = (doc, context, y) => {
    const company = getReportCompany(context);
    y = addSectionTitle(doc, "Visão geral da empresa", y);

    y = addKeyValueTable(
      doc,
      [
        ["Funcionários", safeText(company.employees)],
        ["Capital informado no cadastro", safeText(company.capital)],
        ["Produtos/Serviços", safeText(company.products)]
      ],
      y
    );

    if (String(company.notes || "").trim()) {
      y = addParagraph(doc, "Observações cadastrais", company.notes, y);
    }

    return y + 4;
  };

  /*
    Seção: histórico de consultorias.
  */
  const addConsultancyHistorySection = (doc, context, y) => {
    y = addSectionTitle(doc, "Histórico de consultorias", y);

    const body = context.consultancies.length
      ? context.consultancies.map((item) => [
          formatDate(item.date),
          safeText(item.topic),
          safeText(item.status),
          safeText(item.consultant),
          safeText(item.notes)
        ])
      : [["-", "Nenhuma consultoria encontrada no período.", "-", "-", "-"]];

    doc.autoTable({
      startY: y,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 5,
        textColor: [22, 50, 79]
      },
      headStyles: {
        fillColor: [15, 68, 104],
        textColor: [255, 255, 255]
      },
      head: [["Data", "Tema", "Status", "Consultor", "Notas"]],
      body
    });

    return doc.lastAutoTable.finalY + 18;
  };

  /*
    Seção: resumo CERNE por avaliações no período.
  */
  const addCerneSummarySection = (doc, context, y) => {
    y = addSectionTitle(doc, "Resumo CERNE", y);

    const body = context.evaluations.length
      ? context.evaluations.map((evaluation) => [
          formatDate(evaluation.date),
          Number(evaluation.overallScore || 0).toFixed(2),
          safeText(evaluation.classification),
          Number(evaluation.axisScores?.Empreendedor || 0).toFixed(2),
          Number(evaluation.axisScores?.Gestão || 0).toFixed(2),
          Number(evaluation.axisScores?.Capital || 0).toFixed(2),
          Number(evaluation.axisScores?.Tecnologia || 0).toFixed(2),
          Number(evaluation.axisScores?.Mercado || 0).toFixed(2)
        ])
      : [["-", "-", "Nenhuma avaliação no período", "-", "-", "-", "-", "-"]];

    doc.autoTable({
      startY: y,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 5,
        textColor: [22, 50, 79]
      },
      headStyles: {
        fillColor: [15, 68, 104],
        textColor: [255, 255, 255]
      },
      head: [[
        "Data",
        "Score",
        "Classificação",
        "Empreendedor",
        "Gestão",
        "Capital",
        "Tecnologia",
        "Mercado"
      ]],
      body
    });

    return doc.lastAutoTable.finalY + 18;
  };

  /*
    Seção: resumo financeiro.
  */
  const addFinancialSummarySection = (doc, context, y) => {
    const summary = context.financialSummary;
    const evaluation = summary?.evaluation;

    y = addSectionTitle(doc, "Dados financeiros e eixo Capital", y);

    if (!evaluation) {
      y = addParagraph(
        doc,
        "Origem dos dados",
        "Não há avaliação no período selecionado. Apenas os dados cadastrais disponíveis são apresentados.",
        y
      );
    } else {
      y = addKeyValueTable(
        doc,
        [
          ["Avaliação utilizada", formatDate(evaluation.date)],
          ["Período", getEvaluationPeriodLabel(evaluation)],
          [
            "Nota do eixo Capital",
            summary.axisScore === null || summary.axisScore === undefined
              ? "-"
              : Number(summary.axisScore).toFixed(2)
          ],
          ["Resultado avaliativo", safeText(evaluation.classification)],
          [
            "Classificação de maturidade",
            safeText(evaluation.maturityClassification || "Skate")
          ]
        ],
        y
      );
    }

    doc.autoTable({
      startY: y,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 5,
        textColor: [22, 50, 79]
      },
      headStyles: {
        fillColor: [15, 68, 104],
        textColor: [255, 255, 255]
      },
      columnStyles: {
        0: { cellWidth: 300, fontStyle: "bold" },
        1: { cellWidth: 215 }
      },
      head: [["Informação coletada", "Valor"]],
      body: (summary?.rows || []).map((row) => [
        safeText(row.label),
        safeText(row.value)
      ])
    });

    y = doc.lastAutoTable.finalY + 18;

    if (String(summary?.indicatorJustification || "").trim()) {
      y = addParagraph(
        doc,
        "Justificativa da nota do eixo Capital",
        summary.indicatorJustification,
        y
      );
    }

    return y;
  };

  /*
    Seção: histórico resumido de avaliações.
  */
  const addEvaluationHistorySection = (doc, context, y) => {
    y = addSectionTitle(doc, "Histórico de avaliações", y);

    if (!context.evaluations.length) {
      return addParagraph(doc, "Observação", "Nenhuma avaliação encontrada para o período selecionado.", y);
    }

    context.evaluations.forEach((evaluation, index) => {
      y = addKeyValueTable(
        doc,
        [
          ["Período do monitoramento", getEvaluationPeriodLabel(evaluation)],
          ["Data da avaliação", formatDate(evaluation.date)],
          ["Avaliador", safeText(evaluation.evaluator)],
          ["E-mail do avaliador", safeText(evaluation.evaluatorEmail)],
          ["Score geral", Number(evaluation.overallScore || 0).toFixed(2)],
          [
            "Resultado avaliativo sugerido",
            safeText(evaluation.suggestedClassification || evaluation.classification)
          ],
          [
            "Classificação de maturidade",
            safeText(evaluation.maturityClassification || "Skate")
          ],
          ["Resultado avaliativo", safeText(evaluation.classification)]
        ],
        y
      );

      y = addCerneMiniAxisTable(doc, evaluation, y);

      if (evaluation.notes) {
        y = addParagraph(doc, "Observações da avaliação", evaluation.notes, y);
      }

      if (index < context.evaluations.length - 1) {
        y += 8;
      }
    });

    return y;
  };

  /*
    Tabela reduzida de eixos para uma avaliação.
  */
  const addCerneMiniAxisTable = (doc, evaluation, y) => {
    const body = Object.entries(evaluation.axisScores || {}).map(([axisName, axisScore]) => [
      safeText(axisName),
      Number(axisScore || 0).toFixed(2)
    ]);

    doc.autoTable({
      startY: y,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 5,
        textColor: [22, 50, 79]
      },
      headStyles: {
        fillColor: [24, 181, 255],
        textColor: [255, 255, 255]
      },
      columnStyles: {
        0: { cellWidth: 220 },
        1: { cellWidth: 90, halign: "right" }
      },
      head: [["Eixo", "Nota"]],
      body
    });

    return doc.lastAutoTable.finalY + 14;
  };

  /*
    Seção: detalhamento de uma avaliação específica.
  */
  const addEvaluationDetailSection = (doc, context, y) => {
    const evaluation = context.selectedEvaluation;

    y = addSectionTitle(doc, "Detalhamento da avaliação", y);

    if (!evaluation) {
      return addParagraph(
        doc,
        "Observação",
        "Nenhuma avaliação específica foi selecionada para este relatório.",
        y
      );
    }

    y = addKeyValueTable(
      doc,
      [
        ["Período do monitoramento", getEvaluationPeriodLabel(evaluation)],
        ["Data da avaliação", formatDate(evaluation.date)],
        ["Avaliador", safeText(evaluation.evaluator)],
        ["E-mail do avaliador", safeText(evaluation.evaluatorEmail)],
        ["Responsável pela startup", safeText(evaluation.info?.representativeName)],
        ["E-mail do responsável", safeText(evaluation.info?.representativeEmail)],
        ["CPF do responsável", safeText(evaluation.info?.representativeCpf)],
        ["Município de origem", safeText(evaluation.info?.municipality)],
        [
          "Forma de ingresso",
          safeText(
            evaluation.info?.entryMethod === "Outro"
              ? evaluation.info?.entryMethodOther
              : evaluation.info?.entryMethod
          )
        ],
        ["Score geral", Number(evaluation.overallScore || 0).toFixed(2)],
        [
          "Resultado avaliativo sugerido",
          safeText(evaluation.suggestedClassification || evaluation.classification)
        ],
        [
          "Classificação de maturidade",
          safeText(evaluation.maturityClassification || "Skate")
        ],
        ["Resultado avaliativo", safeText(evaluation.classification)]
      ],
      y
    );

    y = addCerneMiniAxisTable(doc, evaluation, y);

    const model = evaluation.modelSnapshot || {
      axes:
        (evaluation.modelVersion
          ? window.STARTUP_PULSE_SAMPLE_DATA?.evaluationModel?.axes
          : window.STARTUP_PULSE_SAMPLE_DATA?.legacyEvaluationAxes) || []
    };
    const axisMap = {};

    (model?.axes || []).forEach((axis) => {
      axisMap[axis.id] = axis;
    });

    Object.entries(evaluation.details?.axes || {}).forEach(([axisId, axisData]) => {
      const axisConfig = axisMap[axisId];

      if (!axisConfig) {
        return;
      }

      y = addSectionTitle(doc, `Eixo: ${axisConfig.name}`, y);

      const questionRows = (axisConfig.questions || []).map((question) => [
        safeText(question.text),
        safeText(axisData.answers?.[question.id] || "-")
      ]);

      doc.autoTable({
        startY: y,
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 8.5,
          cellPadding: 5,
          textColor: [22, 50, 79]
        },
        headStyles: {
          fillColor: [15, 68, 104],
          textColor: [255, 255, 255]
        },
        columnStyles: {
          0: { cellWidth: 220 },
          1: { cellWidth: 295 }
        },
        head: [["Pergunta", "Resposta"]],
        body: questionRows.length ? questionRows : [["-", "-"]]
      });

      y = doc.lastAutoTable.finalY + 12;

      const indicatorRows = (axisConfig.indicators || []).map((indicator) => {
        const rating = axisData.indicatorRatings?.[indicator.id] || {};
        return [
          safeText(indicator.name),
          Number(rating.score || 0).toFixed(2),
          safeText(rating.justification || "-")
        ];
      });

      doc.autoTable({
        startY: y,
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 8.5,
          cellPadding: 5,
          textColor: [22, 50, 79]
        },
        headStyles: {
          fillColor: [24, 181, 255],
          textColor: [255, 255, 255]
        },
        columnStyles: {
          0: { cellWidth: 180 },
          1: { cellWidth: 60, halign: "right" },
          2: { cellWidth: 275 }
        },
        head: [["Indicador", "Nota", "Justificativa"]],
        body: indicatorRows.length ? indicatorRows : [["-", "-", "-"]]
      });

      y = doc.lastAutoTable.finalY + 18;
    });

    if (evaluation.notes) {
      y = addParagraph(doc, "Observações da avaliação", evaluation.notes, y);
    }

    return y;
  };

  /*
    Roteador de seções: chama a função certa para cada seção do template.
  */
  const sectionRenderers = {
    company_identity: addCompanyIdentitySection,
    company_overview: addCompanyOverviewSection,
    consultancy_history: addConsultancyHistorySection,
    cerne_summary: addCerneSummarySection,
    financial_summary: addFinancialSummarySection,
    evaluation_history: addEvaluationHistorySection,
    evaluation_detail: addEvaluationDetailSection
  };

  /*
    Gera um relatório baseado em template.
  */
  const generateTemplateReport = ({
    reportType,
    title,
    subtitle,
    context,
    suffix = ""
  }) => {
    const doc = createPdfDocument();
    let y = addHeader(doc, title, subtitle);

    /*
      Resumo executivo logo no início do documento.
      Não usamos para o relatório de avaliação específica quando quiser algo mais objetivo?
      Aqui vamos manter para todos, porque ajuda na leitura.
    */
    y = addExecutiveSummaryBox(doc, { ...context, reportType }, y);

    const template = context.reportTemplates?.[reportType];

    if (!template) {
      throw new Error("Template de relatório não encontrado.");
    }

    (template.sections || []).forEach((sectionKey) => {
      const renderer = sectionRenderers[sectionKey];

      if (!renderer) {
        return;
      }

      /*
        Se o bloco estiver muito próximo do fim da página, abre nova página.
      */
      if (y > 670) {
        doc.addPage();
        y = 52;
      }

      y = renderer(doc, { ...context, reportType }, y);
    });

    addFooterToAllPages(doc);

    const fileName = buildFileName(reportType, context.company.name, suffix);
    doc.save(fileName);
  };

  /*
    Gera relatório completo.
  */
  const generateCompleteReport = (context) => {
    const periodLabel = context.year === "all" ? "todos os anos" : `ano ${context.year}`;

    generateTemplateReport({
      reportType: "complete",
      title: "Relatório Completo",
      subtitle: `Empresa: ${context.company.name} • Período: ${periodLabel}`,
      context,
      suffix: context.year === "all" ? "todos-os-anos" : context.year
    });
  };

  /*
    Gera relatório de desempenho.
  */
  const generatePerformanceReport = (context) => {
    const periodLabel = context.year === "all" ? "todos os anos" : `ano ${context.year}`;

    generateTemplateReport({
      reportType: "performance",
      title: "Relatório de Desempenho",
      subtitle: `Empresa: ${context.company.name} • Período: ${periodLabel}`,
      context,
      suffix: context.year === "all" ? "desempenho-completo" : `desempenho-${context.year}`
    });
  };

  /*
    Gera relatório financeiro.
  */
  const generateFinancialReport = (context) => {
    const periodLabel = context.year === "all" ? "todos os anos" : `ano ${context.year}`;

    generateTemplateReport({
      reportType: "financial",
      title: "Relatório Financeiro",
      subtitle: `Empresa: ${context.company.name} • Período: ${periodLabel}`,
      context,
      suffix: context.year === "all" ? "financeiro-completo" : `financeiro-${context.year}`
    });
  };

  /*
    Gera relatório de avaliação específica.
  */
  const generateEvaluationReport = (context) => {
    if (!context.selectedEvaluation) {
      throw new Error("Selecione uma avaliação específica para emitir este relatório.");
    }

    generateTemplateReport({
      reportType: "evaluation",
      title: "Relatório de Avaliação",
      subtitle: `Empresa: ${context.company.name} • Avaliação: ${formatDate(context.selectedEvaluation.date)}`,
      context,
      suffix: context.selectedEvaluation.date
    });
  };

  return {
    generateCompleteReport,
    generatePerformanceReport,
    generateFinancialReport,
    generateEvaluationReport
  };
})();
