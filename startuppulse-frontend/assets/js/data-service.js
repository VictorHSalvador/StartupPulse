/*
  Serviço de dados do projeto.
  Ele centraliza leitura, escrita, persistência local, importação e exportação.
  A ideia é evitar espalhar regra de dados pela interface.
*/
window.DataService = (() => {
  /* Chave usada no localStorage para persistência no navegador. */
  const STORAGE_KEY = "startupPulseMvpState";

  /*
    Estado interno em memória.
    Toda alteração relevante é feita sobre esse objeto.
  */
  let state = {
    schemaVersion: 3,
    companies: [],
    evaluationModel: null,
    consultancies: [],
    savedEvaluations: [],
    notifications: [],
    reportSections: {},
    reportTemplates: {}
  };

  /* Clonagem simples para evitar mutações acidentais no objeto fonte. */
  const deepClone = (value) => JSON.parse(JSON.stringify(value));

  const getSampleState = () => deepClone(window.STARTUP_PULSE_SAMPLE_DATA || {});

  const MATURITY_CLASSIFICATIONS = [
    "Skate",
    "Bicicleta",
    "Carro",
    "Avião",
    "Foguete"
  ];

  const normalizeMaturityClassification = (value) => {
    const text = String(value || "").trim();
    const normalizedText = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    return (
      MATURITY_CLASSIFICATIONS.find(
        (classification) => {
          const normalizedClassification = classification
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

          return (
            normalizedText === normalizedClassification ||
            normalizedText.startsWith(`${normalizedClassification}:`)
          );
        }
      ) || "Skate"
    );
  };

  const getEvaluationMaturityClassification = (evaluation) => {
    const answer =
      evaluation?.details?.axes?.["axis-market"]?.answers?.["q-mar-12"];

    return normalizeMaturityClassification(
      answer || evaluation?.maturityClassification
    );
  };

  const getLatestEvaluation = (evaluations) =>
    [...(evaluations || [])].sort((a, b) => {
      if (Number(a.year) !== Number(b.year)) {
        return Number(b.year) - Number(a.year);
      }

      if (Number(a.semester) !== Number(b.semester)) {
        return Number(b.semester) - Number(a.semester);
      }

      return new Date(b.date) - new Date(a.date);
    })[0] || null;

  const normalizeCompany = (company = {}) => {
    const currentYear = new Date().getFullYear();
    const rawIncubationYear = Number(company.incubationYear);
    const incubationYear =
      Number.isInteger(rawIncubationYear) && rawIncubationYear >= 1900
        ? rawIncubationYear
        : Number.isFinite(rawIncubationYear) &&
            rawIncubationYear >= 0 &&
            rawIncubationYear < 100
          ? currentYear - rawIncubationYear
          : null;

    return {
      ...company,
      incubationYear,
      representativeCpf:
        company.representativeCpf ||
        company.cpf ||
        company.customFields?.cpf ||
        "",
      status: company.status || "Incubada",
      classification: normalizeMaturityClassification(company.classification),
      evaluationResult: company.evaluationResult || null,
      currentScore: Number(company.currentScore || 0),
      employees: Number(company.employees || 0),
      customFields: {
        ...(company.customFields || {})
      }
    };
  };

  const normalizeEvaluationPeriod = (evaluation) => {
    const registeredDate =
      evaluation?.date ||
      evaluation?.info?.evaluationDate ||
      evaluation?.details?.info?.evaluationDate ||
      "";
    const date = String(registeredDate);
    const dateYear = Number(date.slice(0, 4));
    const month = Number(date.slice(5, 7));
    const year = Number(evaluation?.year || dateYear);
    const semester = Number(
      evaluation?.semester || (month >= 1 && month <= 6 ? 1 : 2)
    );

    return {
      ...evaluation,
      date,
      year: Number.isNaN(year) ? null : year,
      semester: semester === 1 ? 1 : 2,
      maturityClassification: getEvaluationMaturityClassification(evaluation)
    };
  };

  const normalizeState = (incomingState = {}) => {
    const sampleState = getSampleState();
    const hasCurrentEvaluationModel =
      incomingState.evaluationModel?.version === sampleState.evaluationModel?.version;
    const companies = Array.isArray(incomingState.companies)
      ? incomingState.companies.map(normalizeCompany)
      : [];
    const companyIds = new Set(companies.map((company) => company.id));
    const savedEvaluations = (
      Array.isArray(incomingState.savedEvaluations)
        ? incomingState.savedEvaluations
        : []
    )
      .filter((evaluation) => companyIds.has(evaluation.companyId))
      .map((evaluation) => {
        const normalizedEvaluation = normalizeEvaluationPeriod(evaluation);
        const company = companies.find(
          (item) => item.id === normalizedEvaluation.companyId
        );

        return {
          ...normalizedEvaluation,
          companySnapshot:
            normalizedEvaluation.companySnapshot ||
            (company ? deepClone(company) : null)
        };
      });
    const reconciledCompanies = companies.map((company) => {
      const latestEvaluation = getLatestEvaluation(
        savedEvaluations.filter((evaluation) => evaluation.companyId === company.id)
      );

      if (!latestEvaluation) {
        return company;
      }

      return {
        ...company,
        currentScore: Number(latestEvaluation.overallScore || 0),
        classification: getEvaluationMaturityClassification(latestEvaluation),
        evaluationResult: latestEvaluation.classification,
        status:
          company.status === "Graduada" || company.status === "Desligada"
            ? company.status
            : latestEvaluation.classification === "Inapta"
              ? "Crítica"
              : company.status === "Crítica"
                ? "Incubada"
                : company.status
      };
    });

    return {
      schemaVersion: 3,
      companies: reconciledCompanies,
      evaluationModel: hasCurrentEvaluationModel
        ? incomingState.evaluationModel
        : sampleState.evaluationModel || null,
      consultancies: Array.isArray(incomingState.consultancies)
        ? incomingState.consultancies.filter((item) => companyIds.has(item.companyId))
        : [],
      savedEvaluations,
      notifications: Array.isArray(incomingState.notifications)
        ? incomingState.notifications.filter((item) => companyIds.has(item.companyId))
        : [],
      reportSections: sampleState.reportSections || {},
      reportTemplates: sampleState.reportTemplates || {},
      legacyEvaluationAxes:
        incomingState.legacyEvaluationAxes || sampleState.legacyEvaluationAxes || []
    };
  };

  /* Gera IDs simples e legíveis para cadastros locais do MVP. */
  const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  /* Carrega o estado inicial a partir do sample data ou do localStorage. */
  const initialize = () => {
    const persisted = localStorage.getItem(STORAGE_KEY);

    if (persisted) {
      try {
        const parsedState = JSON.parse(persisted);

      /* 
        Faz merge defensivo com a estrutura atual do sample data.
        Isso evita quebrar quando o localStorage for antigo e não tiver os campos novos.
      */
        state = normalizeState(parsedState);

        persist();
        return getState();
      } catch (error) {
        console.warn("Estado local invalido. Restaurando dados iniciais.", error);
      }
    }

    state = normalizeState(window.STARTUP_PULSE_SAMPLE_DATA);
    persist();
    return getState();
  };

  /* Persiste o estado atual no navegador. */
  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  /* Retorna uma cópia defensiva do estado. */
  const getState = () => deepClone(state);

  /* Atualiza o estado inteiro quando houver importação externa. */
  const replaceState = (newState) => {
    state = normalizeState(newState);
    persist();
    return getState();
  };

  /* Retorna empresas ordenadas alfabeticamente. */
  const getCompanies = () =>
    deepClone(state.companies).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  /* Busca uma empresa específica pelo ID. */
  const getCompanyById = (companyId) => {
    const company = state.companies.find((item) => item.id === companyId);
    return company ? deepClone(company) : null;
  };

  /* Cria ou atualiza uma empresa. */
  const saveCompany = (companyPayload) => {
    const incomingPayload = deepClone(companyPayload);
    const currentCompany = incomingPayload.id
      ? state.companies.find((company) => company.id === incomingPayload.id)
      : null;
    const payload = normalizeCompany(
      currentCompany
        ? {
            ...currentCompany,
            ...incomingPayload,
            customFields: {
              ...(currentCompany.customFields || {}),
              ...(incomingPayload.customFields || {})
            }
          }
        : incomingPayload
    );
    const normalizedCnpj = String(payload.cnpj || "").replace(/\D/g, "");
    const duplicatedCnpj =
      normalizedCnpj &&
      state.companies.some(
        (company) =>
          company.id !== payload.id &&
          String(company.cnpj || "").replace(/\D/g, "") === normalizedCnpj
      );

    if (duplicatedCnpj) {
      throw new Error("Ja existe uma empresa cadastrada com este CNPJ.");
    }

    if (!payload.id) {
      payload.id = generateId("emp");
      payload.createdAt = payload.createdAt || new Date().toISOString();
      state.companies.push(payload);
    } else {
      if (!currentCompany) {
        throw new Error("Empresa não encontrada para edição.");
      }

      state.companies = state.companies.map((company) =>
        company.id === payload.id ? payload : company
      );
      persist();
      return deepClone(payload);
    }

    persist();
    return deepClone(payload);
  };

  /* Remove uma empresa e também seus vínculos operacionais básicos. */
  const deleteCompany = (companyId) => {
    state.companies = state.companies.filter((company) => company.id !== companyId);
    state.consultancies = state.consultancies.filter((item) => item.companyId !== companyId);
    state.savedEvaluations = state.savedEvaluations.filter((item) => item.companyId !== companyId);
    state.notifications = state.notifications.filter((item) => item.companyId !== companyId);
    persist();
  };

  /* Retorna a configuração do modelo avaliativo. */
  const getEvaluationModel = () => deepClone(state.evaluationModel);

  /* Retorna os templates de relatório. */
  const getReportTemplates = () => deepClone(state.reportTemplates || {});

  /* Retorna o catálogo de seções de relatório. */
  const getReportSections = () => deepClone(state.reportSections || {});

  /* Retorna consultorias de uma empresa, opcionalmente filtradas por ano. */
  const getConsultanciesByCompany = (companyId, year = "all") => {
    return deepClone(state.consultancies || [])
      .filter((consultancy) => {
        const consultancyYear = String(consultancy.date || "").slice(0, 4);
        const matchesCompany = consultancy.companyId === companyId;
        const matchesYear = year === "all" || String(year) === consultancyYear;
        return matchesCompany && matchesYear;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  /* Retorna avaliações de uma empresa, opcionalmente filtradas por ano. */
  const getEvaluationsByCompany = (companyId, year = "all") => {
    return deepClone(state.savedEvaluations || [])
      .map(normalizeEvaluationPeriod)
      .filter((evaluation) => {
        const evaluationYear =
          evaluation.year || Number(String(evaluation.date || "").slice(0, 4));
        const matchesCompany = evaluation.companyId === companyId;
        const matchesYear = year === "all" || Number(year) === Number(evaluationYear);
        return matchesCompany && matchesYear;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  /* Retorna avaliações filtradas por empresa, ano e semestre. */
  const getEvaluationsByPeriod = (
    companyId,
    year = "all",
    semester = "all"
  ) => {
    return getEvaluationsByCompany(companyId, year)
      .filter((evaluation) => {
        if (semester === "all") {
          return true;
        }

        return Number(evaluation.semester) === Number(semester);
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const buildFinancialSummary = (company, evaluation) => {
    if (!evaluation) {
      return {
        evaluation: null,
        axisScore: null,
        indicatorJustification: "",
        rows: [
          {
            label: "Capital informado no cadastro",
            value: company.capital || "Não informado"
          }
        ]
      };
    }

    const axes =
      evaluation.modelSnapshot?.axes ||
      state.evaluationModel?.axes ||
      [];
    const capitalAxis = axes.find(
      (axis) => axis.id === "axis-capital" || axis.name === "Capital"
    );
    const capitalData = evaluation.details?.axes?.[capitalAxis?.id || "axis-capital"] || {
      answers: {},
      indicatorRatings: {}
    };
    const answerRows = (capitalAxis?.questions || [])
      .filter((question) => question.answerType !== "none")
      .map((question) => {
        const answer = capitalData.answers?.[question.id];
        return {
          label: question.text,
          value: Array.isArray(answer) ? answer.join(", ") : answer
        };
      })
      .filter((row) => row.value !== null && row.value !== undefined && row.value !== "");
    const indicator = capitalAxis?.indicators?.[0];
    const rating = indicator
      ? capitalData.indicatorRatings?.[indicator.id]
      : null;

    return {
      evaluation,
      axisScore:
        evaluation.axisScores?.Capital ??
        (rating?.score === null || rating?.score === undefined
          ? null
          : Number(rating.score)),
      indicatorJustification: rating?.justification || "",
      rows: [
        {
          label: "Capital informado no cadastro",
          value: company.capital || "Não informado"
        },
        ...answerRows
      ]
    };
  };

  /* Retorna uma avaliação específica pelo ID. */
  const getEvaluationById = (evaluationId) => {
    const evaluation = (state.savedEvaluations || []).find(
      (item) => item.id === evaluationId
    );
    return evaluation ? deepClone(normalizeEvaluationPeriod(evaluation)) : null;
  };

  const hasEvaluationForPeriod = (
    companyId,
    year,
    semester,
    excludedEvaluationId = null
  ) => {
    return (state.savedEvaluations || [])
      .map(normalizeEvaluationPeriod)
      .some(
        (evaluation) =>
          evaluation.id !== excludedEvaluationId &&
          evaluation.companyId === companyId &&
          Number(evaluation.year) === Number(year) &&
          Number(evaluation.semester) === Number(semester)
      );
  };

  const syncCompanyWithLatestEvaluation = (companyId) => {
    const latestEvaluation = getLatestEvaluation(
      (state.savedEvaluations || [])
        .map(normalizeEvaluationPeriod)
        .filter((evaluation) => evaluation.companyId === companyId)
    );

    if (!latestEvaluation) {
      return;
    }

    state.companies = state.companies.map((company) => {
      if (company.id !== companyId) {
        return company;
      }

      return {
        ...company,
        currentScore: Number(latestEvaluation.overallScore || 0),
        classification: getEvaluationMaturityClassification(latestEvaluation),
        evaluationResult: latestEvaluation.classification,
        status:
          company.status === "Graduada" || company.status === "Desligada"
            ? company.status
            : latestEvaluation.classification === "Inapta"
              ? "Crítica"
              : company.status === "Crítica"
                ? "Incubada"
                : company.status
      };
    });
  };

    /* 
    Retorna todos os anos disponíveis para relatórios de uma empresa.
    Considera consultorias, avaliações e dados financeiros.
  */
  const getAvailableReportYearsByCompany = (companyId) => {
    const consultancyYears = (state.consultancies || [])
      .filter((item) => item.companyId === companyId)
      .map((item) => Number(String(item.date || "").slice(0, 4)));

    const evaluationYears = (state.savedEvaluations || [])
      .filter((item) => item.companyId === companyId)
      .map((item) => Number(item.year || String(item.date || "").slice(0, 4)));

    return [...new Set([...consultancyYears, ...evaluationYears])]
      .filter((year) => !Number.isNaN(year))
      .sort((a, b) => b - a);
  };

    /*
    Monta o contexto-base de relatório de uma empresa.
    Essa função não gera PDF.
    Ela apenas reúne os dados certos, de forma organizada, para a camada de UI ou PDF consumir.
  */
  const getReportContext = ({
    companyId,
    year = "all",
    evaluationId = null
  }) => {
    const company = getCompanyById(companyId);

    if (!company) {
      throw new Error("Empresa não encontrada para geração de relatório.");
    }

    const consultancies = getConsultanciesByCompany(companyId, year);
    const evaluations = getEvaluationsByCompany(companyId, year);
    const selectedEvaluation = evaluationId ? getEvaluationById(evaluationId) : null;
    const latestEvaluation = getLatestEvaluation(evaluations);
    const financialSummary = buildFinancialSummary(company, latestEvaluation);

    if (selectedEvaluation && selectedEvaluation.companyId !== companyId) {
      throw new Error("A avaliacao selecionada nao pertence a esta empresa.");
    }

    if (
      selectedEvaluation &&
      year !== "all" &&
      Number(selectedEvaluation.year) !== Number(year)
    ) {
      throw new Error("A avaliacao selecionada nao pertence ao ano do relatorio.");
    }

    return {
      company,
      year,
      consultancies,
      evaluations,
      latestEvaluation,
      financialSummary,
      selectedEvaluation,
      reportSections: getReportSections(),
      reportTemplates: getReportTemplates()
    };
  };

  /* Retorna consultorias, já enriquecidas com nome da empresa. */
  const getConsultancies = () => {
    return deepClone(state.consultancies)
      .map((consultancy) => {
        const company = state.companies.find((item) => item.id === consultancy.companyId);
        return {
          ...consultancy,
          companyName: company ? company.name : "Empresa não encontrada"
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  /* Salva uma consultoria criada pelo operador. */
  const saveConsultancy = (consultancyPayload) => {
    if (!state.companies.some((company) => company.id === consultancyPayload.companyId)) {
      throw new Error("Empresa nao encontrada para a consultoria.");
    }

    const payload = {
      ...deepClone(consultancyPayload),
      id: generateId("con")
    };

    state.consultancies.push(payload);
    persist();
    return deepClone(payload);
  };

  /* Retorna avaliações salvas enriquecidas com nome da empresa. */
  const getSavedEvaluations = () => {
    return deepClone(state.savedEvaluations)
      .map((evaluation) => {
        const company = state.companies.find((item) => item.id === evaluation.companyId);
        return {
          ...evaluation,
          companyName: evaluation.companyName || (company ? company.name : "Empresa não encontrada")
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  /* Salva uma nova avaliação gerada no formulário. */
  const saveEvaluation = (evaluationPayload) => {
    const year = Number(evaluationPayload.year);
    const semester = Number(evaluationPayload.semester);

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw new Error("Ano do monitoramento inválido.");
    }

    if (![1, 2].includes(semester)) {
      throw new Error("Semestre do monitoramento inválido.");
    }

    if (
      hasEvaluationForPeriod(
        evaluationPayload.companyId,
        year,
        semester
      )
    ) {
      throw new Error(
        "Já existe uma avaliação desta empresa para o ano e semestre selecionados."
      );
    }

    const payload = {
      ...normalizeEvaluationPeriod({
        ...deepClone(evaluationPayload),
        year,
        semester
      }),
      id: generateId("eval")
    };

    state.savedEvaluations.push(payload);

    syncCompanyWithLatestEvaluation(payload.companyId);

    persist();
    return deepClone(payload);
  };

  const updateConsultancy = (consultancyId, consultancyPayload) => {
    const current = state.consultancies.find((item) => item.id === consultancyId);

    if (!current) {
      throw new Error("Consultoria nao encontrada para edicao.");
    }

    const payload = {
      ...current,
      ...deepClone(consultancyPayload),
      id: consultancyId
    };

    state.consultancies = state.consultancies.map((item) =>
      item.id === consultancyId ? payload : item
    );
    persist();
    return deepClone(payload);
  };

  const deleteConsultancy = (consultancyId) => {
    state.consultancies = state.consultancies.filter(
      (item) => item.id !== consultancyId
    );
    persist();
  };

  const getNotifications = () => {
    return deepClone(state.notifications || [])
      .map((notification) => {
        const company = state.companies.find(
          (item) => item.id === notification.companyId
        );

        return {
          ...notification,
          companyName:
            company?.name ||
            notification.companyName ||
            "Empresa nao encontrada"
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const saveNotification = (notificationPayload) => {
    const company = state.companies.find(
      (item) => item.id === notificationPayload.companyId
    );

    if (!company) {
      throw new Error("Empresa nao encontrada para registrar a comunicacao.");
    }

    const payload = {
      ...deepClone(notificationPayload),
      id: generateId("notif"),
      companyName: company.name,
      createdAt: notificationPayload.createdAt || new Date().toISOString(),
      deliveryStatus: "Registrada"
    };

    state.notifications.push(payload);
    persist();
    return deepClone(payload);
  };

  const updateEvaluation = (evaluationId, evaluationPayload) => {
    const currentEvaluation = state.savedEvaluations.find(
      (evaluation) => evaluation.id === evaluationId
    );

    if (!currentEvaluation) {
      throw new Error("Avaliação não encontrada para edição.");
    }

    const year = Number(evaluationPayload.year);
    const semester = Number(evaluationPayload.semester);

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw new Error("Ano do monitoramento inválido.");
    }

    if (![1, 2].includes(semester)) {
      throw new Error("Semestre do monitoramento inválido.");
    }

    if (
      hasEvaluationForPeriod(
        evaluationPayload.companyId,
        year,
        semester,
        evaluationId
      )
    ) {
      throw new Error(
        "Já existe outra avaliação desta empresa para o ano e semestre selecionados."
      );
    }

    const payload = normalizeEvaluationPeriod({
      ...deepClone(currentEvaluation),
      ...deepClone(evaluationPayload),
      id: evaluationId,
      year,
      semester
    });

    state.savedEvaluations = state.savedEvaluations.map((evaluation) =>
      evaluation.id === evaluationId ? payload : evaluation
    );

    syncCompanyWithLatestEvaluation(payload.companyId);
    persist();
    return deepClone(payload);
  };

  /* Exporta todo o estado atual para JSON baixável. */
  const exportToJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "startuppulse-state.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  /*
    Exporta o estado em um arquivo Excel com múltiplas abas.
    Isso deixa o MVP útil mesmo sem backend.
  */
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    const stringifyFields = (items, fields) =>
      (items || []).map((item) => {
        const row = { ...item };

        fields.forEach((field) => {
          if (row[field] !== undefined) {
            row[field] = JSON.stringify(row[field]);
          }
        });

        return row;
      });

    const companiesSheet = XLSX.utils.json_to_sheet(
      stringifyFields(state.companies, ["customFields"])
    );
    const consultanciesSheet = XLSX.utils.json_to_sheet(state.consultancies || []);
    const evaluationsSheet = XLSX.utils.json_to_sheet(
      stringifyFields(state.savedEvaluations, [
        "companySnapshot",
        "info",
        "modelSnapshot",
        "axisScores",
        "details"
      ])
    );
    const notificationsSheet = XLSX.utils.json_to_sheet(state.notifications || []);

    XLSX.utils.book_append_sheet(workbook, companiesSheet, "Empresas");
    XLSX.utils.book_append_sheet(workbook, consultanciesSheet, "Consultorias");
    XLSX.utils.book_append_sheet(workbook, evaluationsSheet, "Avaliacoes");
    XLSX.utils.book_append_sheet(workbook, notificationsSheet, "Notificacoes");

    XLSX.writeFile(workbook, "startuppulse-state.xlsx");
  };

  /* Importa um arquivo JSON e substitui o estado atual. */
  const importFromJsonFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);

          if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.companies)) {
            throw new Error("O JSON deve conter uma lista de empresas.");
          }

          replaceState(parsed);
          resolve(getState());
        } catch (error) {
          reject(new Error(error.message || "Arquivo JSON inválido."));
        }
      };

      reader.onerror = () => reject(new Error("Não foi possível ler o arquivo JSON."));
      reader.readAsText(file, "utf-8");
    });
  };

  /*
    Importa Excel usando convenção de abas simples.
    Espera abas chamadas Empresas, Consultorias e Avaliacoes.
  */
  const importFromExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          if (!workbook.Sheets.Empresas) {
            throw new Error("A planilha precisa conter a aba Empresas.");
          }

          const companies = workbook.Sheets.Empresas
            ? XLSX.utils.sheet_to_json(workbook.Sheets.Empresas)
            : [];
          const consultancies = workbook.Sheets.Consultorias
            ? XLSX.utils.sheet_to_json(workbook.Sheets.Consultorias)
            : [];
          const savedEvaluations = workbook.Sheets.Avaliacoes
            ? XLSX.utils.sheet_to_json(workbook.Sheets.Avaliacoes)
            : [];
          const notifications = workbook.Sheets.Notificacoes
            ? XLSX.utils.sheet_to_json(workbook.Sheets.Notificacoes)
            : [];

          const parseJsonFields = (items, fields) =>
            items.map((item) => {
              const parsedItem = { ...item };

              fields.forEach((field) => {
                if (typeof parsedItem[field] !== "string") {
                  return;
                }

                try {
                  parsedItem[field] = JSON.parse(parsedItem[field]);
                } catch (error) {
                  if (field === "axisScores") {
                    parsedItem[field] = {};
                  }
                }
              });

              return parsedItem;
            });

          /*
            Mantemos o evaluationModel atual, porque ele pertence à configuração da aplicação,
            não ao arquivo operacional da incubadora.
          */
          state = normalizeState({
            companies: parseJsonFields(companies, ["customFields"]),
            consultancies,
            savedEvaluations: parseJsonFields(savedEvaluations, [
              "companySnapshot",
              "info",
              "modelSnapshot",
              "axisScores",
              "details"
            ]),
            notifications,
            evaluationModel: state.evaluationModel || window.STARTUP_PULSE_SAMPLE_DATA.evaluationModel,
            reportSections: state.reportSections || window.STARTUP_PULSE_SAMPLE_DATA.reportSections || {},
            reportTemplates: state.reportTemplates || window.STARTUP_PULSE_SAMPLE_DATA.reportTemplates || {}
          });

          persist();
          resolve(getState());
        } catch (error) {
          reject(new Error(error.message || "Arquivo Excel inválido ou em formato inesperado."));
        }
      };

      reader.onerror = () => reject(new Error("Não foi possível ler o arquivo Excel."));
      reader.readAsArrayBuffer(file);
    });
  };

  /* Limpa o armazenamento local e restaura os dados de demonstração. */
  const resetToSampleData = () => {
    localStorage.removeItem(STORAGE_KEY);
    state = normalizeState(window.STARTUP_PULSE_SAMPLE_DATA);
    persist();
    return getState();
  };

    return {
    initialize,
    getState,
    getCompanies,
    getCompanyById,
    saveCompany,
    deleteCompany,
    getEvaluationModel,
    getConsultancies,
    getConsultanciesByCompany,
    saveConsultancy,
    updateConsultancy,
    deleteConsultancy,
    getNotifications,
    saveNotification,
    getSavedEvaluations,
    getEvaluationsByCompany,
    getEvaluationsByPeriod,
    getEvaluationById,
    hasEvaluationForPeriod,
    saveEvaluation,
    updateEvaluation,
    getReportSections,
    getReportTemplates,
    getAvailableReportYearsByCompany,
    getReportContext,
    exportToJson,
    exportToExcel,
    importFromJsonFile,
    importFromExcelFile,
    replaceState,
    resetToSampleData,
    generateId
  };
})();
