/*
  Aplicação principal do StartupPulse MVP.
  Este arquivo amarra dados, navegação, formulários e renderizações.
  Os comentários foram colocados nas linhas essenciais para facilitar seu estudo.
*/
(() => {
  /* Estado central do front-end. */
    const appState = {
    currentView: "dashboard",
    currentCompanies: [],
    currentConsultancies: [],
    currentSavedEvaluations: [],
    currentFinancialRecords: [],
    currentReportTemplates: {},
    currentReportSections: {},
    evaluationModel: null,
    activeAxisIndex: 0,
    selectedEvaluationCompanyId: null,
    selectedReportCompanyId: null,
    selectedReportYear: "all",
    selectedReportEvaluationId: "",
    draftEvaluation: {
      axes: {}
    },
    selectedNotificationFile: null
  };

  /* Instâncias do Bootstrap usadas na interface. */
  let companyModalInstance;
  let companyDetailCanvasInstance;

  /* Controle visual da autenticação. */
  const authScreen = () => $("#authScreen");
  const appShell = () => $("#appShell");

  /*
    Atualiza a interface para mostrar login ou aplicação,
    dependendo da existência de uma sessão válida.
  */
  const updateAuthUI = () => {
    const session = AuthService.getSession();

    if (!session) {
      authScreen().removeClass("d-none");
      appShell().addClass("d-none");
      return;
    }

    authScreen().addClass("d-none");
    appShell().removeClass("d-none");

    /* Mostra o nome do usuário logado na topbar. */
    $("#loggedUserName").text(session.name);
  };

  /*
    Faz a inicialização do módulo de autenticação.
    Aqui ligamos login, cadastro e logout.
  */
  const initializeAuth = () => {
    /* Garante um usuário inicial para testes. */
    AuthService.seedDefaultUser();

    /* Atualiza a UI de acordo com a sessão atual. */
    updateAuthUI();

    /* Login do usuário. */
    $("#loginForm").on("submit", function (event) {
      event.preventDefault();

      try {
        const email = $("#loginEmail").val();
        const password = $("#loginPassword").val();

        AuthService.login({ email, password });

        updateAuthUI();
        UiService.showToast("Login realizado com sucesso.", "success");

        /* Limpa o formulário depois do login. */
        this.reset();
      } catch (error) {
        UiService.showToast(error.message, "danger");
      }
    });

    /* Cadastro de novo usuário. */
    $("#registerForm").on("submit", function (event) {
      event.preventDefault();

      try {
        const name = $("#registerName").val();
        const email = $("#registerEmail").val();
        const password = $("#registerPassword").val();

        if (!name || !email || !password) {
          UiService.showToast("Preencha nome, e-mail e senha para cadastrar.", "warning");
          return;
        }

        AuthService.registerUser({ name, email, password });

        UiService.showToast("Usuário cadastrado com sucesso. Agora faça o login.", "success");

        /* Limpa o formulário de cadastro depois de salvar. */
        this.reset();
      } catch (error) {
        UiService.showToast(error.message, "danger");
      }
    });

    /* Logout do usuário atual. */
    $("#btnLogout").on("click", () => {
      AuthService.logout();
      updateAuthUI();
      UiService.showToast("Sessão encerrada.", "warning");
    });
  };

  /*
    Inicialização principal da aplicação.
    Ela precisa rodar depois que o DOM estiver pronto.
  */
  const initializeApp = () => {
    try {
      console.log("Inicializando autenticação...");
      initializeAuth();

      console.log("Inicializando dados...");
      DataService.initialize();

      console.log("Hidratando estado...");
      hydrateAppState();

      console.log("Inicializando componentes Bootstrap...");
      initializeBootstrapComponents();

      console.log("Registrando eventos globais...");
      bindGlobalEvents();

      console.log("Renderizando aplicação...");
      renderEverything();

      console.log("Atualizando interface de autenticação...");
      updateAuthUI();
    } catch (error) {
      console.error("Erro na inicialização da aplicação:", error);
      alert("Erro na inicialização da aplicação. Veja o Console do navegador.");
    }
  };

  /* Copia os dados atuais do DataService para o estado da aplicação. */
    const hydrateAppState = () => {
    appState.currentCompanies = DataService.getCompanies();
    appState.currentConsultancies = DataService.getConsultancies();
    appState.currentSavedEvaluations = DataService.getSavedEvaluations();
    appState.currentFinancialRecords = DataService.getFinancialRecords();
    appState.currentReportTemplates = DataService.getReportTemplates();
    appState.currentReportSections = DataService.getReportSections();
    appState.evaluationModel = DataService.getEvaluationModel();

    /*
      Empresa padrão da área de avaliação.
    */
    if (!appState.selectedEvaluationCompanyId && appState.currentCompanies.length) {
      appState.selectedEvaluationCompanyId = appState.currentCompanies[0].id;
      resetDraftEvaluation();
    }

    /*
      Empresa padrão da área de relatórios.
    */
    if (!appState.selectedReportCompanyId && appState.currentCompanies.length) {
      appState.selectedReportCompanyId = appState.currentCompanies[0].id;
    }
  };

  /* Cria as instâncias visuais do Bootstrap. */
  const initializeBootstrapComponents = () => {
    companyModalInstance = new bootstrap.Modal(document.getElementById("companyModal"));
    companyDetailCanvasInstance = new bootstrap.Offcanvas(
      document.getElementById("companyDetailCanvas")
    );
  };

  /* Registra todos os eventos globais da interface. */
  const bindGlobalEvents = () => {
    /* Navegação principal por views. */
    $(document).on("click", ".nav-view-btn", function () {
      const view = $(this).data("view");
      changeView(view);
    });

    /* Ações de importação/exportação. */
    $("#btnImportJson").on("click", () => $("#jsonFileInput").trigger("click"));
    $("#btnImportExcel").on("click", () => $("#excelFileInput").trigger("click"));
    $("#btnExportJson").on("click", () => DataService.exportToJson());
    $("#btnExportExcel").on("click", () => DataService.exportToExcel());

    /* Importação JSON. */
    $("#jsonFileInput").on("change", async function () {
      const file = this.files?.[0];

      if (!file) {
        return;
      }

      try {
        await DataService.importFromJsonFile(file);
        refreshDataAndRender();
        UiService.showToast("JSON importado com sucesso.", "success");
      } catch (error) {
        UiService.showToast(error.message, "danger");
      } finally {
        $(this).val("");
      }
    });

    /* Importação Excel. */
    $("#excelFileInput").on("change", async function () {
      const file = this.files?.[0];

      if (!file) {
        return;
      }

      try {
        await DataService.importFromExcelFile(file);
        refreshDataAndRender();
        UiService.showToast("Excel importado com sucesso.", "success");
      } catch (error) {
        UiService.showToast(error.message, "danger");
      } finally {
        $(this).val("");
      }
    });

    /* Busca e filtros da dashboard. */
    $("#dashboardSearchInput, #dashboardYearFilter, #dashboardStatusFilter").on(
      "input change",
      renderDashboard
    );

    /* Busca e filtros da tela de empresas. */
    $("#companySearchInput, #companyYearFilter, #companyStatusFilter, #companyClassificationFilter").on(
      "input change",
      renderCompanies
    );

    /* Filtros da tela de relatórios. */
    $("#reportCompanySelector").on("change", function () {
      appState.selectedReportCompanyId = $(this).val();
      appState.selectedReportYear = "all";
      appState.selectedReportEvaluationId = "";

      populateReportYearSelector();
      populateReportEvaluationSelector();
      renderReports();
    });

    $("#reportYearSelector").on("change", function () {
      appState.selectedReportYear = $(this).val();
      appState.selectedReportEvaluationId = "";

      populateReportEvaluationSelector();
      renderReports();
    });

    $("#reportEvaluationSelector").on("change", function () {
      appState.selectedReportEvaluationId = $(this).val();
      renderReports();
    });

        /* Botões de emissão de relatório. */
    $("#btnGenerateCompleteReport").on("click", () => {
      try {
        const context = DataService.getReportContext({
          companyId: appState.selectedReportCompanyId,
          year: appState.selectedReportYear || "all",
          evaluationId: appState.selectedReportEvaluationId || null
        });

        ReportService.generateCompleteReport(context);
        UiService.showToast("Relatório completo gerado com sucesso.", "success");
      } catch (error) {
        UiService.showToast(error.message, "danger");
      }
    });

    $("#btnGeneratePerformanceReport").on("click", () => {
      try {
        const context = DataService.getReportContext({
          companyId: appState.selectedReportCompanyId,
          year: appState.selectedReportYear || "all",
          evaluationId: appState.selectedReportEvaluationId || null
        });

        ReportService.generatePerformanceReport(context);
        UiService.showToast("Relatório de desempenho gerado com sucesso.", "success");
      } catch (error) {
        UiService.showToast(error.message, "danger");
      }
    });

    $("#btnGenerateFinancialReport").on("click", () => {
      try {
        const context = DataService.getReportContext({
          companyId: appState.selectedReportCompanyId,
          year: appState.selectedReportYear || "all",
          evaluationId: appState.selectedReportEvaluationId || null
        });

        ReportService.generateFinancialReport(context);
        UiService.showToast("Relatório financeiro gerado com sucesso.", "success");
      } catch (error) {
        UiService.showToast(error.message, "danger");
      }
    });

    $("#btnGenerateEvaluationReport").on("click", () => {
      try {
        const context = DataService.getReportContext({
          companyId: appState.selectedReportCompanyId,
          year: appState.selectedReportYear || "all",
          evaluationId: appState.selectedReportEvaluationId || null
        });

        ReportService.generateEvaluationReport(context);
        UiService.showToast("Relatório de avaliação gerado com sucesso.", "success");
      } catch (error) {
        UiService.showToast(error.message, "danger");
      }
    });

    /* Abertura do modal para nova empresa. */
    $("#btnNewCompany").on("click", () => openCompanyModal());

    /* Abertura do modal para nova consultoria. */
    $("#btnNewConsultancy").on("click", () => {
      changeView("consultancies");
      $("#consultancyTopic").trigger("focus");
    });

    /* Salva cadastro de empresa. */
    $("#btnSaveCompany").on("click", handleSaveCompany);

    /* Eventos de empresa nos cards e tabelas. */
    $(document).on("click", "[data-action='view-company']", function () {
      const companyId = $(this).data("company-id");
      openCompanyDetail(companyId);
    });

    $(document).on("click", "[data-action='edit-company']", function () {
      const companyId = $(this).data("company-id");
      openCompanyModal(companyId);
    });

    $(document).on("click", "[data-action='delete-company']", function () {
      const companyId = $(this).data("company-id");
      handleDeleteCompany(companyId);
    });

    $(document).on("click", "[data-action='evaluate-company']", function () {
      const companyId = $(this).data("company-id");
      appState.selectedEvaluationCompanyId = companyId;
      resetDraftEvaluation();
      changeView("evaluations");
      renderEvaluations();
    });

    /* Carregamento manual de empresa na área de avaliação. */
    $("#btnLoadCompanyEvaluation").on("click", () => {
      appState.selectedEvaluationCompanyId = $("#evaluationCompanySelector").val();
      resetDraftEvaluation();
      renderEvaluations();
    });

    /* Navegação do stepper. */
    $(document).on("click", ".step-item", function () {
      appState.activeAxisIndex = Number($(this).data("axis-index"));
      renderEvaluations();
    });

    $("#btnPrevAxis").on("click", () => {
      if (appState.activeAxisIndex > 0) {
        appState.activeAxisIndex -= 1;
        renderEvaluations();
      }
    });

    $("#btnNextAxis").on("click", () => {
      if (appState.activeAxisIndex < appState.evaluationModel.axes.length - 1) {
        appState.activeAxisIndex += 1;
        renderEvaluations();
      }
    });

    /* Limpa apenas o eixo atual, não a avaliação inteira. */
    $("#btnClearCurrentAxis").on("click", () => {
      const currentAxis = appState.evaluationModel.axes[appState.activeAxisIndex];
      appState.draftEvaluation.axes[currentAxis.id] = {
        answers: {},
        indicatorRatings: {}
      };
      renderEvaluations();
      UiService.showToast(`Eixo ${currentAxis.name} limpo.`, "warning");
    });

    /* Salva rascunho da resposta de cada pergunta. */
    $(document).on("input change", ".question-answer-input", function () {
      const axisId = $(this).data("axis-id");
      const questionId = $(this).data("question-id");
      const value = $(this).val();

      ensureAxisDraft(axisId);
      appState.draftEvaluation.axes[axisId].answers[questionId] = value;
    });

    /* Salva nota do indicador. */
    $(document).on("change", ".indicator-score-input", function () {
      const axisId = $(this).data("axis-id");
      const indicatorId = $(this).data("indicator-id");
      const score = Number($(this).val());

      ensureAxisDraft(axisId);
      ensureIndicatorDraft(axisId, indicatorId);
      appState.draftEvaluation.axes[axisId].indicatorRatings[indicatorId].score = score;
      renderEvaluations();
    });

    /* Salva justificativa do indicador. */
    $(document).on("input", ".indicator-justification-input", function () {
      const axisId = $(this).data("axis-id");
      const indicatorId = $(this).data("indicator-id");
      const justification = $(this).val();

      ensureAxisDraft(axisId);
      ensureIndicatorDraft(axisId, indicatorId);
      appState.draftEvaluation.axes[axisId].indicatorRatings[indicatorId].justification = justification;
    });

    /* Salva avaliação final. */
    $("#btnSaveEvaluation").on("click", handleSaveEvaluation);

    /* Salva consultoria. */
    $("#consultancyForm").on("submit", handleSaveConsultancy);

    /* Notificações: seleção de empresa */
    $("#notificationCompanyId").on("change", function () {
      const companyId = $(this).val();
      updateNotificationCompanyInfo(companyId);
    });

    /* Notificações: seleção de arquivo */
    $("#notificationFile").on("change", function () {
      handleNotificationFileSelect(this.files?.[0]);
    });

    /* Notificações: submit do formulário */
    $("#notificationForm").on("submit", function (event) {
      event.preventDefault();
      handleSaveNotification();
    });
  };

  /* Alterna entre as views principais. */
  const changeView = (viewName) => {
    appState.currentView = viewName;

    $(".app-view").addClass("d-none");
    $(`#view-${viewName}`).removeClass("d-none");

    $(".nav-view-btn").removeClass("active");
    $(`.nav-view-btn[data-view='${viewName}']`).addClass("active");

    if (viewName === "dashboard") renderDashboard();
    if (viewName === "companies") renderCompanies();
    if (viewName === "evaluations") renderEvaluations();
    if (viewName === "consultancies") renderConsultancies();
    if (viewName === "reports") renderReports();
    if (viewName === "notifications") renderNotifications();
  };

  /* Renderiza todas as áreas necessárias. */
  const renderEverything = () => {
    populateSharedSelectors();
    populateSharedFilters();
    renderDashboard();
    renderCompanies();
    renderEvaluations();
    renderConsultancies();
    renderReports();
    renderNotifications();
  };

  /* Atualiza o estado vindo do DataService e re-renderiza. */
  const refreshDataAndRender = () => {
    hydrateAppState();
    renderEverything();
  };

  const getCompanyListForSelectors = () => {
    return appState.currentCompanies.length ? appState.currentCompanies : DataService.getCompanies();
  };

  const buildCompanyOptionsHtml = () => {
    const companies = getCompanyListForSelectors();
    try {
      console.info("buildCompanyOptionsHtml: companiesCount=", companies.length);
    } catch (e) {
      /* ignore logging errors in environments without console */
    }

    return companies
      .map(function (company) {
        return (
          '<option value="' +
          company.id +
          '">' +
          UiService.escapeHtml(company.name) +
          ' - ' +
          UiService.escapeHtml(company.sector) +
          '</option>'
        );
      })
      .join("");
  };

  /* Preenche selects que dependem da lista de empresas. */
  const populateSharedSelectors = () => {
    const companyOptions = buildCompanyOptionsHtml();

    $("#evaluationCompanySelector").html(companyOptions);
    $("#consultancyCompanyId").html(companyOptions);
    $("#reportCompanySelector").html(companyOptions);
    // Use the exact same options as the evaluation selector so the lists stay in sync
    // Keep a placeholder as the first option for clarity in the UI.
    $("#notificationCompanyId").html(`<option value="">Selecione uma empresa...</option>` + companyOptions);

    if (appState.selectedEvaluationCompanyId) {
      $("#evaluationCompanySelector").val(appState.selectedEvaluationCompanyId);
    }

    if (appState.selectedReportCompanyId) {
      $("#reportCompanySelector").val(appState.selectedReportCompanyId);
    }

    populateReportYearSelector();
    populateReportEvaluationSelector();
  };

  /*
  Preenche os anos disponíveis para a empresa selecionada na área de relatórios.
  Sempre inclui a opção "Todos os anos".
  */
  const populateReportYearSelector = () => {
    if (!appState.selectedReportCompanyId) {
      $("#reportYearSelector").html(`<option value="all">Todos os anos</option>`);
      return;
    }

    const years = DataService.getAvailableReportYearsByCompany(appState.selectedReportCompanyId);

    const options = [`<option value="all">Todos os anos</option>`]
      .concat(years.map((year) => `<option value="${year}">${year}</option>`))
      .join("");

    $("#reportYearSelector").html(options);
    $("#reportYearSelector").val(appState.selectedReportYear || "all");
  };

  /*
  Preenche o seletor de avaliações específicas da tela de relatórios.
  Ele respeita a empresa e o ano selecionados.
  */
  const populateReportEvaluationSelector = () => {
    if (!appState.selectedReportCompanyId) {
      $("#reportEvaluationSelector").html(`<option value="">Selecione uma avaliação</option>`);
      return;
    }

    const evaluations = DataService.getEvaluationsByCompany(
      appState.selectedReportCompanyId,
      appState.selectedReportYear || "all"
    );

    const options = [`<option value="">Selecione uma avaliação</option>`]
      .concat(
        evaluations.map(
          (evaluation) => `
            <option value="${evaluation.id}">
              ${UiService.escapeHtml(evaluation.date)} - ${UiService.escapeHtml(evaluation.evaluator)}
            </option>
          `
        )
      )
      .join("");

    $("#reportEvaluationSelector").html(options);
    $("#reportEvaluationSelector").val(appState.selectedReportEvaluationId || "");
  };

  /* Preenche filtros de ano conforme os dados reais existentes. */
  const populateSharedFilters = () => {
    const years = [...new Set(appState.currentCompanies.map((company) => company.incubationYear))].sort(
      (a, b) => a - b
    );

    const options = [`<option value="all">Todos os anos</option>`]
      .concat(years.map((year) => `<option value="${year}">Ano ${year}</option>`))
      .join("");

    $("#dashboardYearFilter").html(options);
    $("#companyYearFilter").html(options);
  };

  /* Filtra empresas da dashboard com base nos controles atuais. */
  const getFilteredDashboardCompanies = () => {
    const search = $("#dashboardSearchInput").val()?.toLowerCase().trim() || "";
    const year = $("#dashboardYearFilter").val();
    const status = $("#dashboardStatusFilter").val();

    return appState.currentCompanies.filter((company) => {
      const matchesSearch = [
        company.name,
        company.sector,
        company.representative,
        company.classification
      ]
        .join(" ")
        .toLowerCase()
        .includes(search);

      const matchesYear = year === "all" || String(company.incubationYear) === String(year);
      const matchesStatus = status === "all" || company.status === status;

      return matchesSearch && matchesYear && matchesStatus;
    });
  };

  /* Renderiza dashboard principal. */
  const renderDashboard = () => {
    const filteredCompanies = getFilteredDashboardCompanies();
    const metrics = CalculationService.calculateDashboardMetrics(
      filteredCompanies,
      appState.currentConsultancies,
      appState.currentSavedEvaluations
    );

    const kpiItems = [
      {
        label: "Total de empresas",
        value: metrics.totalCompanies,
        helper: `Score médio: ${metrics.avgScore.toFixed(2)}`,
        icon: "bi-buildings"
      },
      {
        label: "Incubadas",
        value: metrics.incubating,
        helper: "Empresas em acompanhamento ativo",
        icon: "bi-graph-up-arrow"
      },
      {
        label: "Graduadas",
        value: metrics.graduated,
        helper: "Empresas prontas ou já graduadas",
        icon: "bi-mortarboard"
      },
      {
        label: "Críticas",
        value: metrics.critical,
        helper: `Consultorias agendadas: ${metrics.scheduledConsultancies}`,
        icon: "bi-exclamation-triangle"
      }
    ];

    $("#dashboardKpis").html(
      kpiItems
        .map(
          (item) => `
            <div class="col-12 col-sm-6 col-xl-3">
              <div class="kpi-card">
                <div class="kpi-header">
                  <span class="kpi-label">${UiService.escapeHtml(item.label)}</span>
                  <div class="kpi-icon"><i class="bi ${item.icon}"></i></div>
                </div>
                <div class="kpi-value">${item.value}</div>
                <div class="kpi-helper">${UiService.escapeHtml(item.helper)}</div>
              </div>
            </div>
          `
        )
        .join("")
    );

    $("#dashboardCompanyCountBadge").text(`${filteredCompanies.length} empresas`);

    const companyRows = filteredCompanies.length
      ? filteredCompanies
          .map(
            (company) => `
              <tr>
                <td>
                  <div class="company-name">${UiService.escapeHtml(company.name)}</div>
                  <div class="company-meta">${UiService.escapeHtml(company.sector)} • ${UiService.escapeHtml(
              company.representative
            )}</div>
                </td>
                <td>${company.incubationYear}</td>
                <td>${UiService.renderStatusBadge(company.status)}</td>
                <td><strong>${Number(company.currentScore || 0).toFixed(2)}</strong></td>
                <td>${UiService.renderClassificationBadge(company.classification)}</td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" data-action="view-company" data-company-id="${company.id}">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-secondary" data-action="edit-company" data-company-id="${company.id}">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-success" data-action="evaluate-company" data-company-id="${company.id}">
                      <i class="bi bi-clipboard-check"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `
          )
          .join("")
      : `<tr><td colspan="6">${UiService.renderEmptyState(
          "Nenhuma empresa encontrada",
          "Ajuste os filtros ou importe novos dados."
        )}</td></tr>`;

    $("#dashboardCompanyTableBody").html(companyRows);

    const attentionItems = buildAttentionItems(filteredCompanies);
    $("#attentionList").html(attentionItems);
  };

  /* Monta a lista de atenção para o gestor da incubadora. */
  const buildAttentionItems = (companies) => {
    const criticalCompanies = companies.filter((company) => company.classification === "Inapta");
    const nearGraduation = companies.filter((company) => company.classification === "Apta a Graduar");
    const scheduled = appState.currentConsultancies.filter((item) => item.status === "Agendada");

    const blocks = [
      {
        iconClass: "bg-danger-subtle text-danger-emphasis",
        icon: "bi-exclamation-triangle",
        title: `${criticalCompanies.length} empresa(s) crítica(s)`,
        text:
          criticalCompanies.length > 0
            ? criticalCompanies.map((company) => company.name).join(", ")
            : "Nenhuma empresa crítica no filtro atual."
      },
      {
        iconClass: "bg-success-subtle text-success-emphasis",
        icon: "bi-stars",
        title: `${nearGraduation.length} pronta(s) para graduação`,
        text:
          nearGraduation.length > 0
            ? nearGraduation.map((company) => company.name).join(", ")
            : "Nenhuma empresa pronta para graduação no filtro atual."
      },
      {
        iconClass: "bg-info-subtle text-info-emphasis",
        icon: "bi-calendar-event",
        title: `${scheduled.length} consultoria(s) agendada(s)`,
        text:
          scheduled.length > 0
            ? scheduled
                .slice(0, 3)
                .map((item) => `${item.companyName} (${item.date})`)
                .join(", ")
            : "Nenhuma consultoria agendada até o momento."
      }
    ];

    return blocks
      .map(
        (block) => `
          <div class="attention-item">
            <div class="attention-icon ${block.iconClass}">
              <i class="bi ${block.icon}"></i>
            </div>
            <div>
              <div class="fw-bold mb-1">${UiService.escapeHtml(block.title)}</div>
              <div class="text-muted small">${UiService.escapeHtml(block.text)}</div>
            </div>
          </div>
        `
      )
      .join("");
  };

  /* Filtra empresas da view Empresas. */
  const getFilteredCompaniesViewData = () => {
    const search = $("#companySearchInput").val()?.toLowerCase().trim() || "";
    const year = $("#companyYearFilter").val();
    const status = $("#companyStatusFilter").val();
    const classification = $("#companyClassificationFilter").val();

    return appState.currentCompanies.filter((company) => {
      const matchesSearch = [company.name, company.sector, company.representative]
        .join(" ")
        .toLowerCase()
        .includes(search);
      const matchesYear = year === "all" || String(company.incubationYear) === String(year);
      const matchesStatus = status === "all" || company.status === status;
      const matchesClassification =
        classification === "all" || company.classification === classification;

      return matchesSearch && matchesYear && matchesStatus && matchesClassification;
    });
  };

  /* Renderiza os cards da tela de empresas. */
  const renderCompanies = () => {
    const companies = getFilteredCompaniesViewData();

    if (!companies.length) {
      $("#companyCardsContainer").html(
        `<div class="col-12">${UiService.renderEmptyState(
          "Nenhuma empresa encontrada",
          "Cadastre uma nova empresa ou revise os filtros aplicados."
        )}</div>`
      );
      return;
    }

    $("#companyCardsContainer").html(
      companies
        .map(
          (company) => `
            <div class="col-12 col-md-6 col-xxl-4">
              <div class="company-card">
                <div class="d-flex justify-content-between gap-3 align-items-start mb-2">
                  <div>
                    <div class="company-card-title">${UiService.escapeHtml(company.name)}</div>
                    <div class="company-meta">${UiService.escapeHtml(company.sector)}</div>
                  </div>
                  <div>${UiService.renderStatusBadge(company.status)}</div>
                </div>
                <div class="small text-muted mb-3">
                  Ano ${company.incubationYear} • ${UiService.escapeHtml(company.email)}
                </div>
                <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <div class="fw-bold fs-5">${Number(company.currentScore || 0).toFixed(2)}</div>
                  ${UiService.renderClassificationBadge(company.classification)}
                </div>
                <div class="company-card-actions d-flex flex-wrap gap-2">
                  <button class="btn btn-sm btn-outline-primary" data-action="view-company" data-company-id="${company.id}">
                    <i class="bi bi-eye"></i> Ver
                  </button>
                  <button class="btn btn-sm btn-outline-secondary" data-action="edit-company" data-company-id="${company.id}">
                    <i class="bi bi-pencil"></i> Editar
                  </button>
                  <button class="btn btn-sm btn-outline-success" data-action="evaluate-company" data-company-id="${company.id}">
                    <i class="bi bi-clipboard-check"></i> Avaliar
                  </button>
                  <button class="btn btn-sm btn-outline-danger" data-action="delete-company" data-company-id="${company.id}">
                    <i class="bi bi-trash"></i> Excluir
                  </button>
                </div>
              </div>
            </div>
          `
        )
        .join("")
    );
  };

  /* Abre o modal de cadastro/edição de empresa. */
  const openCompanyModal = (companyId = null) => {
    const company = companyId ? DataService.getCompanyById(companyId) : null;
    const schema = appState.evaluationModel.customFieldSchema || [];

    $("#companyModalTitle").text(company ? `Editar empresa - ${company.name}` : "Nova empresa");
    $("#companyId").val(company?.id || "");
    $("#companyName").val(company?.name || "");
    $("#companyCorporateName").val(company?.corporateName || "");
    $("#companyCnpj").val(company?.cnpj || "");
    $("#companyRepresentative").val(company?.representative || "");
    $("#companyEmail").val(company?.email || "");
    $("#companyPhone").val(company?.phone || "");
    $("#companySector").val(company?.sector || "");
    $("#companyIncubationYear").val(company?.incubationYear || 1);
    $("#companyStatus").val(company?.status || "Incubada");
    $("#companyEmployees").val(company?.employees || 0);
    $("#companyCapital").val(company?.capital || "");
    $("#companyClassification").val(company?.classification || "Satisfatória");
    $("#companyProducts").val(company?.products || "");
    $("#companyNotes").val(company?.notes || "");

    $("#customFieldsContainer").html(
      schema
        .map(
          (field) => `
            <div class="col-md-4">
              <label class="form-label">${UiService.escapeHtml(field.label)}</label>
              <input
                type="text"
                class="form-control custom-field-input"
                data-field-key="${field.key}"
                placeholder="${UiService.escapeHtml(field.placeholder || '')}"
                value="${UiService.escapeHtml(company?.customFields?.[field.key] || '')}"
              />
            </div>
          `
        )
        .join("")
    );

    companyModalInstance.show();
  };

  /* Coleta os dados do modal e salva a empresa. */
  const handleSaveCompany = () => {
    const customFields = {};

    $(".custom-field-input").each(function () {
      customFields[$(this).data("field-key")] = $(this).val();
    });

    const payload = {
      id: $("#companyId").val() || undefined,
      name: $("#companyName").val(),
      corporateName: $("#companyCorporateName").val(),
      cnpj: $("#companyCnpj").val(),
      representative: $("#companyRepresentative").val(),
      email: $("#companyEmail").val(),
      phone: $("#companyPhone").val(),
      sector: $("#companySector").val(),
      incubationYear: Number($("#companyIncubationYear").val()),
      status: $("#companyStatus").val(),
      classification: $("#companyClassification").val(),
      currentScore: 0,
      employees: Number($("#companyEmployees").val() || 0),
      capital: $("#companyCapital").val(),
      products: $("#companyProducts").val(),
      notes: $("#companyNotes").val(),
      customFields
    };

    if (!payload.name || !payload.representative || !payload.email || !payload.sector) {
      UiService.showToast("Preencha os campos essenciais da empresa.", "warning");
      return;
    }

    DataService.saveCompany(payload);
    companyModalInstance.hide();
    refreshDataAndRender();
    UiService.showToast("Empresa salva com sucesso.", "success");
  };

  /* Exclui empresa após confirmação simples. */
  const handleDeleteCompany = (companyId) => {
    const company = DataService.getCompanyById(companyId);

    if (!company) {
      return;
    }

    const confirmed = window.confirm(`Deseja realmente excluir a empresa ${company.name}?`);

    if (!confirmed) {
      return;
    }

    DataService.deleteCompany(companyId);
    refreshDataAndRender();
    UiService.showToast("Empresa excluída.", "warning");
  };

  /* Abre painel lateral com detalhes rápidos da empresa. */
  const openCompanyDetail = (companyId) => {
    const company = DataService.getCompanyById(companyId);

    if (!company) {
      return;
    }

    const companyConsultancies = appState.currentConsultancies.filter(
      (item) => item.companyId === company.id
    );
    const companyEvaluations = appState.currentSavedEvaluations.filter(
      (item) => item.companyId === company.id
    );

    $("#companyDetailCanvasLabel").text(company.name);
    $("#companyDetailCanvasBody").html(`
      <div class="mb-4">
        <div class="d-flex flex-wrap gap-2 mb-3">
          ${UiService.renderStatusBadge(company.status)}
          ${UiService.renderClassificationBadge(company.classification)}
        </div>
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <strong>Representante</strong>
            <div class="text-muted">${UiService.escapeHtml(company.representative)}</div>
          </div>
          <div class="col-12 col-md-6">
            <strong>Email</strong>
            <div class="text-muted">${UiService.escapeHtml(company.email)}</div>
          </div>
          <div class="col-12 col-md-6">
            <strong>Setor</strong>
            <div class="text-muted">${UiService.escapeHtml(company.sector)}</div>
          </div>
          <div class="col-12 col-md-6">
            <strong>Ano de incubação</strong>
            <div class="text-muted">${company.incubationYear}</div>
          </div>
          <div class="col-12 col-md-6">
            <strong>Funcionários</strong>
            <div class="text-muted">${company.employees}</div>
          </div>
          <div class="col-12 col-md-6">
            <strong>Capital</strong>
            <div class="text-muted">${UiService.escapeHtml(company.capital || '-')}</div>
          </div>
          <div class="col-12">
            <strong>Produtos/Serviços</strong>
            <div class="text-muted">${UiService.escapeHtml(company.products || '-')}</div>
          </div>
          <div class="col-12">
            <strong>Observações</strong>
            <div class="text-muted">${UiService.escapeHtml(company.notes || '-')}</div>
          </div>
        </div>
      </div>

      <div class="app-card muted-card mb-3">
        <h6 class="mb-2">Últimas consultorias</h6>
        ${companyConsultancies.length
          ? companyConsultancies
              .slice(0, 3)
              .map(
                (item) => `
                  <div class="mb-2">
                    <strong>${UiService.escapeHtml(item.topic)}</strong>
                    <div class="text-muted small">${UiService.escapeHtml(item.date)} • ${UiService.escapeHtml(item.status)}</div>
                  </div>
                `
              )
              .join("")
          : '<div class="text-muted">Nenhuma consultoria registrada.</div>'}
      </div>

      <div class="app-card muted-card">
        <h6 class="mb-2">Últimas avaliações</h6>
        ${companyEvaluations.length
          ? companyEvaluations
              .slice(0, 3)
              .map(
                (item) => `
                  <div class="mb-2">
                    <strong>${UiService.escapeHtml(item.date)}</strong>
                    <div class="text-muted small">Score ${Number(item.overallScore || 0).toFixed(2)} • ${UiService.escapeHtml(item.classification)}</div>
                  </div>
                `
              )
              .join("")
          : '<div class="text-muted">Nenhuma avaliação salva.</div>'}
      </div>
    `);

    companyDetailCanvasInstance.show();
  };

  /* Reinicia o rascunho de avaliação ao trocar de empresa. */
  const resetDraftEvaluation = () => {
    appState.draftEvaluation = { axes: {} };
    appState.activeAxisIndex = 0;

    (appState.evaluationModel.axes || []).forEach((axis) => {
      appState.draftEvaluation.axes[axis.id] = {
        answers: {},
        indicatorRatings: {}
      };
    });
  };

  /* Garante que a estrutura do eixo exista antes de gravar algo. */
  const ensureAxisDraft = (axisId) => {
    if (!appState.draftEvaluation.axes[axisId]) {
      appState.draftEvaluation.axes[axisId] = {
        answers: {},
        indicatorRatings: {}
      };
    }
  };

  /* Garante que a estrutura do indicador exista antes de gravar nota/justificativa. */
  const ensureIndicatorDraft = (axisId, indicatorId) => {
    if (!appState.draftEvaluation.axes[axisId].indicatorRatings[indicatorId]) {
      appState.draftEvaluation.axes[axisId].indicatorRatings[indicatorId] = {
        score: 0,
        justification: ""
      };
    }
  };

  /* Renderiza a tela de avaliações. */
  const renderEvaluations = () => {
    const company = DataService.getCompanyById(appState.selectedEvaluationCompanyId);

    if (!company) {
      $("#evaluationCompanyTitle").text("Nenhuma empresa selecionada");
      $("#evaluationQuestionsContainer").html(
        UiService.renderEmptyState("Selecione uma empresa", "Escolha uma empresa para iniciar a avaliação.")
      );
      return;
    }

    const axis = appState.evaluationModel.axes[appState.activeAxisIndex];
    const summary = CalculationService.calculateEvaluationSummary(
      appState.draftEvaluation,
      appState.evaluationModel
    );
    const axisDraft = appState.draftEvaluation.axes[axis.id] || { answers: {}, indicatorRatings: {} };
    const currentAxisResult = summary.axisResults.find((item) => item.axisId === axis.id);
    const totalPending = summary.axisResults.reduce((sum, item) => sum + item.pendingItems, 0);

    $("#evaluationCompanyTitle").text(company.name);
    $("#evaluationCompanyMeta").text(
      `${company.sector} • Representante: ${company.representative} • Ano ${company.incubationYear}`
    );
    $("#evaluationCurrentAxisBadge").text(`Eixo atual: ${axis.name}`);
    $("#evaluationPendingBadge").text(`Pendências: ${totalPending}`);
    $("#axisPanelTitle").text(axis.name);
    $("#axisPanelSubtitle").text(axis.description);

    /* Render do stepper dos eixos. */
    $("#axisStepper").html(
      appState.evaluationModel.axes
        .map((currentAxis, index) => {
          const axisResult = summary.axisResults.find((item) => item.axisId === currentAxis.id);
          const classes = ["step-item"];

          if (index === appState.activeAxisIndex) classes.push("active");
          if (axisResult && axisResult.pendingItems === 0 && axisResult.axisScore > 0) classes.push("completed");

          return `
            <button class="step-item ${classes.join(' ')}" data-axis-index="${index}">
              <span class="step-number">${index + 1}</span>
              <span>${UiService.escapeHtml(currentAxis.name)}</span>
            </button>
          `;
        })
        .join("")
    );

    /* Render das perguntas do eixo atual. */
    $("#evaluationQuestionsContainer").html(
      axis.questions
        .map((question) => renderQuestionCard(axis, question, axisDraft))
        .join("")
    );

    /* Render do resumo do eixo atual. */
    $("#axisSummaryContainer").html(renderAxisSummary(axis, axisDraft, currentAxisResult));

    /* Render do resumo geral provisório. */
    $("#evaluationOverallSummary").html(`
      <div class="summary-list">
        ${summary.axisResults
          .map(
            (item) => `
              <div class="summary-item">
                <div>
                  <div class="fw-bold">${UiService.escapeHtml(item.axisName)}</div>
                  <div class="small text-muted">Pendências: ${item.pendingItems}</div>
                </div>
                <div class="score-pill">${item.axisScore ? item.axisScore.toFixed(1) : "--"}</div>
              </div>
            `
          )
          .join("")}
      </div>
      <hr />
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="fw-bold">Score geral</span>
        <span class="fs-4 fw-bold text-primary">${summary.overallScore.toFixed(2)}</span>
      </div>
      <div>
        ${UiService.renderClassificationBadge(summary.classification)}
      </div>
    `);
  };

  /* Renderiza um card de pergunta com campos de resposta e indicadores. */
  const renderQuestionCard = (axis, question, axisDraft) => {
    const currentAnswer = axisDraft.answers?.[question.id] || "";

    return `
      <div class="question-card">
        <div class="question-title">${UiService.escapeHtml(question.text)}</div>
        <div class="question-helper">${UiService.escapeHtml(question.helper || '')}</div>
        <div class="mb-3">
          ${renderQuestionInput(axis.id, question, currentAnswer)}
        </div>
        <div class="indicator-title">Indicadores avaliados nesta pergunta</div>
        <div class="row g-3">
          ${question.indicatorsLinked
            .map((indicatorId) => {
              const indicator = axis.indicators.find((item) => item.id === indicatorId);
              const currentIndicator = axisDraft.indicatorRatings?.[indicatorId] || {
                score: 0,
                justification: ""
              };

              return `
                <div class="col-12 col-lg-6">
                  <div class="indicator-box h-100">
                    <div class="fw-bold mb-2">${UiService.escapeHtml(indicator.name)}</div>
                    <label class="form-label small text-muted">Nota do indicador</label>
                    <select class="form-select indicator-score-input mb-3" data-axis-id="${axis.id}" data-indicator-id="${indicatorId}">
                      <option value="0">Selecione...</option>
                      ${appState.evaluationModel.scale
                        .map(
                          (score) => `
                            <option value="${score}" ${Number(currentIndicator.score) === score ? 'selected' : ''}>
                              ${score} - ${UiService.escapeHtml(appState.evaluationModel.scaleLabels[score])}
                            </option>
                          `
                        )
                        .join("")}
                    </select>
                    <label class="form-label small text-muted">Justificativa do avaliador</label>
                    <textarea
                      class="form-control indicator-justification-input"
                      rows="3"
                      data-axis-id="${axis.id}"
                      data-indicator-id="${indicatorId}"
                      placeholder="Explique a nota atribuída, principalmente em perguntas interpretativas."
                    >${UiService.escapeHtml(currentIndicator.justification || '')}</textarea>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  };

  /* Renderiza o input correto conforme o tipo da pergunta. */
  const renderQuestionInput = (axisId, question, currentAnswer) => {
    if (question.answerType === "textarea") {
      return `
        <textarea
          class="form-control question-answer-input"
          rows="4"
          data-axis-id="${axisId}"
          data-question-id="${question.id}"
          placeholder="Registre aqui a resposta coletada junto ao representante da empresa."
        >${UiService.escapeHtml(currentAnswer)}</textarea>
      `;
    }

    if (question.answerType === "number") {
      return `
        <input
          type="number"
          class="form-control question-answer-input"
          data-axis-id="${axisId}"
          data-question-id="${question.id}"
          value="${UiService.escapeHtml(currentAnswer)}"
          placeholder="Informe o valor coletado"
        />
      `;
    }

    if (question.answerType === "radio") {
      return question.options
        .map(
          (option, index) => `
            <div class="form-check mb-2">
              <input
                class="form-check-input question-answer-input"
                type="radio"
                name="${question.id}"
                id="${question.id}-${index}"
                value="${UiService.escapeHtml(option)}"
                data-axis-id="${axisId}"
                data-question-id="${question.id}"
                ${currentAnswer === option ? 'checked' : ''}
              />
              <label class="form-check-label" for="${question.id}-${index}">
                ${UiService.escapeHtml(option)}
              </label>
            </div>
          `
        )
        .join("");
    }

    return `
      <input
        type="text"
        class="form-control question-answer-input"
        data-axis-id="${axisId}"
        data-question-id="${question.id}"
        value="${UiService.escapeHtml(currentAnswer)}"
      />
    `;
  };

  /* Renderiza resumo do eixo atual. */
  const renderAxisSummary = (axis, axisDraft, currentAxisResult) => {
    return `
      <div class="summary-list">
        ${axis.indicators
          .map((indicator) => {
            const item = axisDraft.indicatorRatings?.[indicator.id] || { score: 0 };
            return `
              <div class="summary-item">
                <div>
                  <div class="fw-bold">${UiService.escapeHtml(indicator.name)}</div>
                  <div class="small text-muted">Justificativa: ${item.justification ? 'preenchida' : 'pendente'}</div>
                </div>
                <div class="score-pill">${item.score ? item.score : '--'}</div>
              </div>
            `;
          })
          .join("")}
      </div>
      <hr />
      <div class="d-flex justify-content-between align-items-center">
        <span class="fw-bold">Score do eixo</span>
        <span class="fs-4 fw-bold text-primary">${currentAxisResult?.axisScore?.toFixed(2) || '0.00'}</span>
      </div>
    `;
  };

  /* Salva a avaliação preenchida atualmente. */
  const handleSaveEvaluation = () => {
    const company = DataService.getCompanyById(appState.selectedEvaluationCompanyId);

    if (!company) {
      UiService.showToast("Selecione uma empresa antes de salvar a avaliação.", "warning");
      return;
    }

    const summary = CalculationService.calculateEvaluationSummary(
      appState.draftEvaluation,
      appState.evaluationModel
    );

    const payload = {
      companyId: company.id,
      companyName: company.name,
      evaluator: "Funcionário da incubadora",
      date: new Date().toISOString().slice(0, 10),
      axisScores: Object.fromEntries(
        summary.axisResults.map((item) => [item.axisName, item.axisScore])
      ),
      overallScore: summary.overallScore,
      classification: summary.classification,
      details: JSON.parse(JSON.stringify(appState.draftEvaluation))
    };

    DataService.saveEvaluation(payload);
    refreshDataAndRender();
    UiService.showToast("Avaliação salva com sucesso.", "success");
  };

  /* Renderiza consultorias. */
  const renderConsultancies = () => {
    const items = appState.currentConsultancies;

    if (!items.length) {
      $("#consultancyListContainer").html(
        UiService.renderEmptyState(
          "Nenhuma consultoria registrada",
          "Cadastre uma nova consultoria no formulário ao lado."
        )
      );
      return;
    }

    $("#consultancyListContainer").html(
      items
        .map(
          (item) => `
            <div class="consultancy-item">
              <div class="d-flex flex-wrap justify-content-between gap-2 mb-2">
                <div>
                  <div class="fw-bold">${UiService.escapeHtml(item.topic)}</div>
                  <div class="small text-muted">${UiService.escapeHtml(item.companyName)} • ${UiService.escapeHtml(item.consultant)}</div>
                </div>
                <div class="d-flex gap-2 align-items-center">
                  <span class="soft-badge bg-light text-dark border">${UiService.escapeHtml(item.date)}</span>
                  <span class="soft-badge ${
                    item.status === 'Realizada'
                      ? 'bg-success-subtle text-success-emphasis border border-success-subtle'
                      : item.status === 'Agendada'
                      ? 'bg-info-subtle text-info-emphasis border border-info-subtle'
                      : 'bg-danger-subtle text-danger-emphasis border border-danger-subtle'
                  }">${UiService.escapeHtml(item.status)}</span>
                </div>
              </div>
              <div class="mb-2"><strong>Notas:</strong> <span class="text-muted">${UiService.escapeHtml(item.notes || '-')}</span></div>
              <div><strong>Plano de ação:</strong> <span class="text-muted">${UiService.escapeHtml(item.actionPlan || '-')}</span></div>
            </div>
          `
        )
        .join("")
    );
  };

  /* Salva consultoria do formulário. */
  const handleSaveConsultancy = (event) => {
    event.preventDefault();

    const payload = {
      companyId: $("#consultancyCompanyId").val(),
      date: $("#consultancyDate").val(),
      status: $("#consultancyStatus").val(),
      topic: $("#consultancyTopic").val(),
      consultant: $("#consultancyConsultant").val(),
      notes: $("#consultancyNotes").val(),
      actionPlan: $("#consultancyActionPlan").val()
    };

    if (!payload.companyId || !payload.date || !payload.topic || !payload.consultant) {
      UiService.showToast("Preencha os campos essenciais da consultoria.", "warning");
      return;
    }

    DataService.saveConsultancy(payload);
    $("#consultancyForm")[0].reset();
    refreshDataAndRender();
    UiService.showToast("Consultoria salva com sucesso.", "success");
  };

  /* Atualiza as informações da empresa selecionada no formulário de notificações. */
  const updateNotificationCompanyInfo = (companyId) => {
    const company = DataService.getCompanyById(companyId);

    if (!company) {
      $("#notificationCompanyEmail").val("");
      $("#notificationCompanyInfo").html("<p class=\"mb-0\">Selecione uma empresa para visualizar seus dados.</p>");
      return;
    }

    /* Preenche o email automaticamente */
    $("#notificationCompanyEmail").val(company.email || "");

    const customFieldsHtml = Object.entries(company.customFields || {}).map(
      ([key, value]) => `
        <div class="company-info-line">
          <span class="company-info-label">${UiService.escapeHtml(key)}:</span>
          <span class="company-info-value">${UiService.escapeHtml(value || "-")}</span>
        </div>`
    ).join("");

    /* Renderiza todas as informações da empresa cadastrada */
    const companyInfoHtml = `
      <div class="company-info-line">
        <span class="company-info-label">Nome fantasia:</span>
        <span class="company-info-value"><strong>${UiService.escapeHtml(company.name)}</strong></span>
      </div>
      <div class="company-info-line">
        <span class="company-info-label">Razão social:</span>
        <span class="company-info-value">${UiService.escapeHtml(company.corporateName || "-")}</span>
      </div>
      <div class="company-info-line">
        <span class="company-info-label">CNPJ:</span>
        <span class="company-info-value">${UiService.escapeHtml(company.cnpj || "-")}</span>
      </div>
      <div class="company-info-line">
        <span class="company-info-label">Setor:</span>
        <span class="company-info-value">${UiService.escapeHtml(company.sector || "-")}</span>
      </div>
      <div class="company-info-line">
        <span class="company-info-label">Representante:</span>
        <span class="company-info-value">${UiService.escapeHtml(company.representative || "-")}</span>
      </div>
      <div class="company-info-line">
        <span class="company-info-label">Email:</span>
        <span class="company-info-value"><a href="mailto:${UiService.escapeHtml(company.email)}" class="text-primary">${UiService.escapeHtml(company.email || "-")}</a></span>
      </div>
      <div class="company-info-line">
        <span class="company-info-label">Telefone:</span>
        <span class="company-info-value">${UiService.escapeHtml(company.phone || "-")}</span>
      </div>
      <div class="company-info-line">
        <span class="company-info-label">Ano de incubação:</span>
        <span class="company-info-value">${UiService.escapeHtml(company.incubationYear || "-")}</span>
      </div>
      <div class="company-info-line">
        <span class="company-info-label">Status:</span>
        <span class="company-info-value">${UiService.renderStatusBadge(company.status)}</span>
      </div>
      <div class="company-info-line">
        <span class="company-info-label">Classificação:</span>
        <span class="company-info-value">${UiService.escapeHtml(company.classification || "-")}</span>
      </div>
      <div class="company-info-line">
        <span class="company-info-label">Score atual:</span>
        <span class="company-info-value">${UiService.escapeHtml(
          company.currentScore != null && company.currentScore !== "" ? Number(company.currentScore).toFixed(2) : "-"
        )}</span>
      </div>
      <div class="company-info-line">
        <span class="company-info-label">Funcionários:</span>
        <span class="company-info-value">${UiService.escapeHtml(
          company.employees != null && company.employees !== "" ? company.employees : "-"
        )}</span>
      </div>
      <div class="company-info-line">
        <span class="company-info-label">Capital:</span>
        <span class="company-info-value">${UiService.escapeHtml(company.capital || "-")}</span>
      </div>
      <div class="company-info-line">
        <span class="company-info-label">Produtos/Serviços:</span>
        <span class="company-info-value">${UiService.escapeHtml(company.products || "-")}</span>
      </div>
      <div class="company-info-line">
        <span class="company-info-label">Observações:</span>
        <span class="company-info-value">${UiService.escapeHtml(company.notes || "-")}</span>
      </div>
      ${customFieldsHtml}
    `;

    $("#notificationCompanyInfo").html(companyInfoHtml);
  };

  /* Gerencia a seleção de arquivo para notificação. */
  const handleNotificationFileSelect = (file) => {
    if (!file) {
      appState.selectedNotificationFile = null;
      $("#filePreview").empty();
      return;
    }

    /* Validações básicas de arquivo */
    const maxSizeMB = 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      UiService.showToast(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`, "danger");
      $("#notificationFile").val("");
      appState.selectedNotificationFile = null;
      $("#filePreview").empty();
      return;
    }

    /* Armazena o arquivo no estado */
    appState.selectedNotificationFile = file;

    /* Exibe preview do arquivo */
    const fileSize = (file.size / 1024).toFixed(2); /* Em KB */
    const fileIcon = getFileIcon(file.type);
    const filePreviewHtml = `
      <div class="file-badge">
        <i class="bi ${fileIcon}"></i>
        <span>${UiService.escapeHtml(file.name)} (${fileSize}KB)</span>
        <button type="button" class="file-remove-btn" id="btnRemoveFile">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `;

    $("#filePreview").html(filePreviewHtml);

    /* Handler para remover arquivo */
    $("#btnRemoveFile").on("click", function (e) {
      e.preventDefault();
      $("#notificationFile").val("");
      appState.selectedNotificationFile = null;
      $("#filePreview").empty();
    });
  };

  /* Retorna o ícone apropriado para o tipo de arquivo. */
  const getFileIcon = (fileType) => {
    if (fileType.includes("pdf")) return "bi-file-pdf-fill";
    if (fileType.includes("word")) return "bi-file-word-fill";
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) return "bi-file-earmark-spreadsheet-fill";
    if (fileType.includes("image")) return "bi-file-image-fill";
    return "bi-file-earmark-fill";
  };

  /* Renderiza a área de notificações. */
  const renderNotifications = () => {
    populateSharedSelectors();
    const $sel = $("#notificationCompanyId");
    try {
      console.info("renderNotifications: notification select found=", $sel.length, "children=", $sel.children().length);
    } catch (e) {}
    // Select the first non-empty option (skip placeholder with empty value)
    const firstNonEmpty = $sel
      .find("option")
      .filter(function () {
        return $(this).val() && $(this).val().length > 0;
      })
      .first()
      .val();

    if (firstNonEmpty) {
      $sel.val(firstNonEmpty).trigger("change");
    } else {
      updateNotificationCompanyInfo("");
    }
  };

  /* Salva e envia notificação. */
  const handleSaveNotification = () => {
    const companyId = $("#notificationCompanyId").val();
    const email = $("#notificationCompanyEmail").val();
    const description = $("#notificationDescription").val();

    /* Validações */
    if (!companyId) {
      UiService.showToast("Selecione uma empresa.", "warning");
      return;
    }

    if (!description || description.trim().length === 0) {
      UiService.showToast("Escreva uma descrição para a notificação.", "warning");
      return;
    }

    if (!email || email.trim().length === 0) {
      UiService.showToast("Email do representante não encontrado.", "danger");
      return;
    }

    /* Simula envio da notificação */
    const notification = {
      id: `notif-${Date.now()}`,
      companyId,
      email,
      description,
      fileName: appState.selectedNotificationFile ? appState.selectedNotificationFile.name : null,
      sentAt: new Date().toLocaleString("pt-BR"),
      sentBy: AuthService.getSession().name
    };

    /* Aqui você poderia armazenar em localStorage se desejasse persistir histórico */
    /* DataService.saveNotification(notification); */

    /* Exibe modal de sucesso */
    showNotificationSuccessModal(notification);

    /* Limpa o formulário */
    $("#notificationForm")[0].reset();
    appState.selectedNotificationFile = null;
    $("#filePreview").empty();
    $("#notificationCompanyId").val("").trigger("change");
    $("#notificationCompanyEmail").val("");
  };

  /* Exibe modal de sucesso após envio de notificação. */
  const showNotificationSuccessModal = (notification) => {
    const company = DataService.getCompanyById(notification.companyId);
    const companyName = company ? company.name : "Empresa";

    const successHtml = `
      <div class="text-center py-4">
        <div class="notification-success-icon">
          <i class="bi bi-check-circle-fill"></i>
        </div>
        <h5 class="mb-3">Notificação enviada com sucesso!</h5>
        <div class="text-muted small mb-4">
          <p class="mb-2"><strong>Empresa:</strong> ${UiService.escapeHtml(companyName)}</p>
          <p class="mb-2"><strong>Email:</strong> ${UiService.escapeHtml(notification.email)}</p>
          ${notification.fileName ? `<p class="mb-2"><strong>Arquivo:</strong> ${UiService.escapeHtml(notification.fileName)}</p>` : ""}
          <p class="mb-0"><strong>Enviado em:</strong> ${UiService.escapeHtml(notification.sentAt)}</p>
        </div>
        <p class="text-muted mb-0">A notificação foi registrada e o documento foi anexado.</p>
      </div>
    `;

    /* Usa a abordagem de toast que já existe no projeto */
    UiService.showToast("✓ Notificação enviada com sucesso para " + companyName, "success");
    
    /* Exibe também um alerta visual no topo do formulário */
    const alertHtml = `
      <div class="alert alert-success notification-alert alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>
        <strong>Sucesso!</strong> Notificação enviada para ${UiService.escapeHtml(companyName)}.
        ${notification.fileName ? `<br/><small class="text-muted">Arquivo anexado: ${UiService.escapeHtml(notification.fileName)}</small>` : ""}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
      </div>
    `;

    $("#notificationForm").before(alertHtml);

    /* Remove o alerta após 5 segundos */
    setTimeout(() => {
      $(".notification-alert").fadeOut(() => {
        $(".notification-alert").remove();
      });
    }, 5000);
  };

  /* Renderiza a área de relatórios com base na empresa e período selecionados. */
  const renderReports = () => {
    if (!appState.currentCompanies.length) {
      $("#reportsSummaryContainer").html(
        UiService.renderEmptyState(
          "Nenhuma empresa cadastrada",
          "Cadastre ou importe empresas para emitir relatórios."
        )
      );

      $("#savedEvaluationsContainer").html(
        UiService.renderEmptyState(
          "Sem histórico disponível",
          "Os dados de avaliações, consultorias e finanças aparecerão aqui."
        )
      );
      return;
    }

    /*
      Garante que os seletores estejam sincronizados com o estado.
    */
    if (!appState.selectedReportCompanyId) {
      appState.selectedReportCompanyId = appState.currentCompanies[0].id;
    }

    $("#reportCompanySelector").val(appState.selectedReportCompanyId);
    $("#reportYearSelector").val(appState.selectedReportYear || "all");
    $("#reportEvaluationSelector").val(appState.selectedReportEvaluationId || "");

    const context = DataService.getReportContext({
      companyId: appState.selectedReportCompanyId,
      year: appState.selectedReportYear || "all",
      evaluationId: appState.selectedReportEvaluationId || null
    });

    const company = context.company;
    const consultancies = context.consultancies || [];
    const evaluations = context.evaluations || [];
    const financialRecords = context.financialRecords || [];

    /*
      Resumo contextual: agora é da empresa selecionada, e não mais da carteira toda.
    */
    $("#reportsSummaryContainer").html(`
      <div class="report-context-list">
        <div class="report-context-item">
          <div>
            <div class="fw-bold">${UiService.escapeHtml(company.name)}</div>
            <div class="report-context-label">${UiService.escapeHtml(company.sector)}</div>
          </div>
          <div class="report-context-value">${UiService.escapeHtml(company.status)}</div>
        </div>

        <div class="report-context-item">
          <span class="report-context-label">Representante</span>
          <span class="report-context-value">${UiService.escapeHtml(company.representative)}</span>
        </div>

        <div class="report-context-item">
          <span class="report-context-label">Classificação atual</span>
          <span>${UiService.renderClassificationBadge(company.classification)}</span>
        </div>

        <div class="report-context-item">
          <span class="report-context-label">Score atual</span>
          <span class="report-context-value">${Number(company.currentScore || 0).toFixed(2)}</span>
        </div>

        <div class="report-context-item">
          <span class="report-context-label">Período selecionado</span>
          <span class="report-context-value">${appState.selectedReportYear === "all" ? "Todos os anos" : appState.selectedReportYear}</span>
        </div>

        <div class="report-context-item">
          <span class="report-context-label">Consultorias no período</span>
          <span class="report-context-value">${consultancies.length}</span>
        </div>

        <div class="report-context-item">
          <span class="report-context-label">Avaliações no período</span>
          <span class="report-context-value">${evaluations.length}</span>
        </div>

        <div class="report-context-item">
          <span class="report-context-label">Registros financeiros no período</span>
          <span class="report-context-value">${financialRecords.length}</span>
        </div>
      </div>
    `);

    /*
      Histórico disponível contextualizado.
    */
    const evaluationsBlock = evaluations.length
      ? evaluations
          .map(
            (item) => `
              <div class="report-history-card">
                <div class="d-flex flex-wrap justify-content-between gap-2 mb-2">
                  <div>
                    <div class="fw-bold">${UiService.escapeHtml(item.companyName)}</div>
                    <div class="report-history-meta">
                      ${UiService.escapeHtml(item.date)} • ${UiService.escapeHtml(item.evaluator)}
                    </div>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <span class="soft-badge bg-light text-dark border">Score ${Number(item.overallScore || 0).toFixed(2)}</span>
                    ${UiService.renderClassificationBadge(item.classification)}
                  </div>
                </div>

                <div class="row g-2">
                  ${Object.entries(item.axisScores || {})
                    .map(
                      ([axisName, axisScore]) => `
                        <div class="col-12 col-md-6">
                          <div class="summary-item py-2">
                            <span>${UiService.escapeHtml(axisName)}</span>
                            <strong>${Number(axisScore || 0).toFixed(2)}</strong>
                          </div>
                        </div>
                      `
                    )
                    .join("")}
                </div>
              </div>
            `
          )
          .join("")
      : `
        <div class="mb-4">
          ${UiService.renderEmptyState(
            "Nenhuma avaliação no período",
            "Selecione outro ano ou registre novas avaliações para esta empresa."
          )}
        </div>
      `;

    const consultanciesBlock = consultancies.length
      ? `
        <div class="report-history-card">
          <div class="fw-bold mb-2">Consultorias no período</div>
          ${consultancies
            .map(
              (item) => `
                <div class="mb-2">
                  <strong>${UiService.escapeHtml(item.date)}</strong> — ${UiService.escapeHtml(item.topic)}
                  <div class="report-history-meta">
                    ${UiService.escapeHtml(item.status)} • ${UiService.escapeHtml(item.consultant)}
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      `
      : `
        <div class="report-history-card">
          <div class="fw-bold mb-2">Consultorias no período</div>
          <div class="report-history-meta">Nenhuma consultoria encontrada.</div>
        </div>
      `;

    const financialBlock = financialRecords.length
      ? `
        <div class="report-history-card">
          <div class="fw-bold mb-2">Resumo financeiro do período</div>
          ${financialRecords
            .map(
              (record) => `
                <div class="mb-3">
                  <strong>${record.year}</strong>
                  <div class="report-history-meta">
                    Receita: R$ ${Number(record.revenue || 0).toLocaleString("pt-BR")} •
                    Lucro: R$ ${Number(record.profit || 0).toLocaleString("pt-BR")} •
                    Margem bruta: ${Number(record.grossMargin || 0).toFixed(2)}%
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      `
      : `
        <div class="report-history-card">
          <div class="fw-bold mb-2">Resumo financeiro do período</div>
          <div class="report-history-meta">Nenhum registro financeiro encontrado.</div>
        </div>
      `;

    $("#savedEvaluationsContainer").html(`
      ${evaluationsBlock}
      ${consultanciesBlock}
      ${financialBlock}
    `);
  };

  /* Inicialização após DOM carregado. */
  $(document).ready(initializeApp);
})();
