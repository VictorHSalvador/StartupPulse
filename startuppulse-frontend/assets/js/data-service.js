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
    companies: [],
    evaluationModel: null,
    consultancies: [],
    financialRecords: [],
    savedEvaluations: [],
    reportSections: {},
    reportTemplates: {}
  };

  /* Clonagem simples para evitar mutações acidentais no objeto fonte. */
  const deepClone = (value) => JSON.parse(JSON.stringify(value));

  const getSampleState = () => deepClone(window.STARTUP_PULSE_SAMPLE_DATA || {});

  const hasUsableCompanies = (companies) => {
    return Array.isArray(companies) && companies.some((company) => company?.id && company?.name);
  };

  const normalizeState = (incomingState = {}) => {
    const sampleState = getSampleState();
    const hasCurrentEvaluationModel =
      incomingState.evaluationModel?.version === sampleState.evaluationModel?.version;

    return {
      ...sampleState,
      ...incomingState,
      companies: hasUsableCompanies(incomingState.companies)
        ? incomingState.companies
        : sampleState.companies || [],
      evaluationModel: hasCurrentEvaluationModel
        ? incomingState.evaluationModel
        : sampleState.evaluationModel || null,
      consultancies: Array.isArray(incomingState.consultancies)
        ? incomingState.consultancies
        : sampleState.consultancies || [],
      financialRecords: Array.isArray(incomingState.financialRecords)
        ? incomingState.financialRecords
        : sampleState.financialRecords || [],
      savedEvaluations: Array.isArray(incomingState.savedEvaluations)
        ? incomingState.savedEvaluations
        : sampleState.savedEvaluations || [],
      reportSections: incomingState.reportSections || sampleState.reportSections || {},
      reportTemplates: incomingState.reportTemplates || sampleState.reportTemplates || {}
    };
  };

  /* Gera IDs simples e legíveis para cadastros locais do MVP. */
  const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  /* Carrega o estado inicial a partir do sample data ou do localStorage. */
  const initialize = () => {
    const persisted = localStorage.getItem(STORAGE_KEY);

    if (persisted) {
      const parsedState = JSON.parse(persisted);

      /* 
        Faz merge defensivo com a estrutura atual do sample data.
        Isso evita quebrar quando o localStorage for antigo e não tiver os campos novos.
      */
      state = normalizeState(parsedState);

      persist();
      return getState();
    }

    state = deepClone(window.STARTUP_PULSE_SAMPLE_DATA);
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
    const payload = deepClone(companyPayload);

    if (!payload.id) {
      payload.id = generateId("emp");
      payload.currentScore = Number(payload.currentScore || 0);
      state.companies.push(payload);
    } else {
      state.companies = state.companies.map((company) =>
        company.id === payload.id ? payload : company
      );
    }

    persist();
    return deepClone(payload);
  };

  /* Remove uma empresa e também seus vínculos operacionais básicos. */
  const deleteCompany = (companyId) => {
    state.companies = state.companies.filter((company) => company.id !== companyId);
    state.consultancies = state.consultancies.filter((item) => item.companyId !== companyId);
    state.savedEvaluations = state.savedEvaluations.filter((item) => item.companyId !== companyId);
    persist();
  };

  /* Retorna a configuração do modelo avaliativo. */
  const getEvaluationModel = () => deepClone(state.evaluationModel);

    /* Retorna os registros financeiros cadastrados. */
  const getFinancialRecords = () => deepClone(state.financialRecords || []);

  /* Retorna os templates de relatório. */
  const getReportTemplates = () => deepClone(state.reportTemplates || {});

  /* Retorna o catálogo de seções de relatório. */
  const getReportSections = () => deepClone(state.reportSections || {});

    /* Retorna registros financeiros de uma empresa, opcionalmente filtrados por ano. */
  const getFinancialRecordsByCompany = (companyId, year = "all") => {
    return deepClone(state.financialRecords || [])
      .filter((record) => {
        const matchesCompany = record.companyId === companyId;
        const matchesYear = year === "all" || Number(record.year) === Number(year);
        return matchesCompany && matchesYear;
      })
      .sort((a, b) => Number(a.year) - Number(b.year));
  };

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
      .filter((evaluation) => {
        const evaluationYear =
          evaluation.year || Number(String(evaluation.date || "").slice(0, 4));
        const matchesCompany = evaluation.companyId === companyId;
        const matchesYear = year === "all" || Number(year) === Number(evaluationYear);
        return matchesCompany && matchesYear;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  /* Retorna uma avaliação específica pelo ID. */
  const getEvaluationById = (evaluationId) => {
    return deepClone((state.savedEvaluations || []).find((evaluation) => evaluation.id === evaluationId));
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

    const financialYears = (state.financialRecords || [])
      .filter((item) => item.companyId === companyId)
      .map((item) => Number(item.year));

    return [...new Set([...consultancyYears, ...evaluationYears, ...financialYears])]
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
    const financialRecords = getFinancialRecordsByCompany(companyId, year);
    const selectedEvaluation = evaluationId ? getEvaluationById(evaluationId) : null;

    return {
      company,
      year,
      consultancies,
      evaluations,
      financialRecords,
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
    const payload = {
      ...deepClone(evaluationPayload),
      id: generateId("eval")
    };

    state.savedEvaluations.push(payload);

    /*
      Atualiza o score e a classificação atual da empresa.
      Isso mantém a dashboard sincronizada com a última avaliação.
    */
    state.companies = state.companies.map((company) => {
      if (company.id !== payload.companyId) {
        return company;
      }

      return {
        ...company,
        currentScore: Number(payload.overallScore || 0),
        classification: payload.classification,
        status: payload.classification === "Inapta" ? "Crítica" : company.status
      };
    });

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

    const companiesSheet = XLSX.utils.json_to_sheet(state.companies || []);
    const consultanciesSheet = XLSX.utils.json_to_sheet(state.consultancies || []);
    const financialSheet = XLSX.utils.json_to_sheet(state.financialRecords || []);
    const evaluationsSheet = XLSX.utils.json_to_sheet(state.savedEvaluations || []);

    XLSX.utils.book_append_sheet(workbook, companiesSheet, "Empresas");
    XLSX.utils.book_append_sheet(workbook, consultanciesSheet, "Consultorias");
    XLSX.utils.book_append_sheet(workbook, financialSheet, "Financeiro");
    XLSX.utils.book_append_sheet(workbook, evaluationsSheet, "Avaliacoes");

    XLSX.writeFile(workbook, "startuppulse-state.xlsx");
  };

  /* Importa um arquivo JSON e substitui o estado atual. */
  const importFromJsonFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          replaceState(parsed);
          resolve(getState());
        } catch (error) {
          reject(new Error("Arquivo JSON inválido."));
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

          const companies = workbook.Sheets.Empresas
            ? XLSX.utils.sheet_to_json(workbook.Sheets.Empresas)
            : [];
          const consultancies = workbook.Sheets.Consultorias
            ? XLSX.utils.sheet_to_json(workbook.Sheets.Consultorias)
            : [];
          const savedEvaluations = workbook.Sheets.Avaliacoes
            ? XLSX.utils.sheet_to_json(workbook.Sheets.Avaliacoes)
            : [];

          /*
            Mantemos o evaluationModel atual, porque ele pertence à configuração da aplicação,
            não ao arquivo operacional da incubadora.
          */
          const financialRecords = workbook.Sheets.Financeiro
            ? XLSX.utils.sheet_to_json(workbook.Sheets.Financeiro)
            : state.financialRecords || [];

          state = {
            companies,
            consultancies,
            financialRecords,
            savedEvaluations,
            evaluationModel: state.evaluationModel || window.STARTUP_PULSE_SAMPLE_DATA.evaluationModel,
            reportSections: state.reportSections || window.STARTUP_PULSE_SAMPLE_DATA.reportSections || {},
            reportTemplates: state.reportTemplates || window.STARTUP_PULSE_SAMPLE_DATA.reportTemplates || {}
          };

          persist();
          resolve(getState());
        } catch (error) {
          reject(new Error("Arquivo Excel inválido ou em formato inesperado."));
        }
      };

      reader.onerror = () => reject(new Error("Não foi possível ler o arquivo Excel."));
      reader.readAsArrayBuffer(file);
    });
  };

  /* Limpa o armazenamento local e restaura os dados de demonstração. */
  const resetToSampleData = () => {
    localStorage.removeItem(STORAGE_KEY);
    state = deepClone(window.STARTUP_PULSE_SAMPLE_DATA);
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
    getFinancialRecords,
    getFinancialRecordsByCompany,
    getSavedEvaluations,
    getEvaluationsByCompany,
    getEvaluationById,
    saveEvaluation,
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
