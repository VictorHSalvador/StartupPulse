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
    currentNotifications: [],
    currentReportTemplates: {},
    currentReportSections: {},
    evaluationModel: null,
    evaluationFormModel: null,
    activeAxisIndex: 0,
    evaluationMode: "history",
    editingEvaluationId: null,
    selectedEvaluationCompanyId: null,
    selectedHistoryCompanyId: null,
    selectedHistoryYear: "all",
    selectedHistorySemester: "all",
    selectedHistoryEvaluationId: null,
    selectedReportCompanyId: null,
    selectedReportYear: "all",
    selectedReportEvaluationId: "",
    selectedNotificationCompanyId: null,
    draftEvaluation: {
      axes: {}
    },
    selectedNotificationFile: null
  };

  /* Instâncias do Bootstrap usadas na interface. */
  let companyModalInstance;
  let companyDetailCanvasInstance;

  const isManager = () => AuthService.getSession()?.role === "Gestor";

  const viewLabels = {
    dashboard: "Dashboard",
    companies: "Empresas",
    evaluations: "Avaliações",
    consultancies: "Consultorias",
    reports: "Relatórios",
    notifications: "Notificação"
  };

  const editablePermissionViews = Object.keys(viewLabels);

  /* Controle visual da autenticação. */
  const authScreen = () => $("#authScreen");
  const appShell = () => $("#appShell");

  const syncNavigationAccess = () => {
    const session = AuthService.getSession();

    $(".manager-only").toggleClass("d-none", !isManager());

    $(".nav-view-btn[data-permission-view]").each(function () {
      const viewName = $(this).data("permission-view");

      $(this).closest(".nav-item").toggleClass(
        "d-none",
        !AuthService.canAccessView(viewName, session)
      );
    });
  };

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
    $("#loggedUserName").text(`${session.name}${session.role ? ` · ${session.role}` : ""}`);
    $("#loggedUserMenuName").text(session.name);
    $("#loggedUserMenuRole").text(`${session.role} · ${session.email}`);
    syncNavigationAccess();
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
        changeView(AuthService.getFirstAllowedView());
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
    appState.currentNotifications = DataService.getNotifications();
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

    if (!appState.selectedHistoryCompanyId && appState.currentCompanies.length) {
      appState.selectedHistoryCompanyId = appState.currentCompanies[0].id;
    }

    if (
      appState.selectedHistoryCompanyId &&
      !appState.currentCompanies.some(
        (company) => company.id === appState.selectedHistoryCompanyId
      )
    ) {
      appState.selectedHistoryCompanyId = appState.currentCompanies[0]?.id || null;
      appState.selectedHistoryEvaluationId = null;
    }

    /*
      Empresa padrão da área de relatórios.
    */
    if (!appState.selectedReportCompanyId && appState.currentCompanies.length) {
      appState.selectedReportCompanyId = appState.currentCompanies[0].id;
    }

    if (
      appState.selectedNotificationCompanyId &&
      !appState.currentCompanies.some((company) => company.id === appState.selectedNotificationCompanyId)
    ) {
      appState.selectedNotificationCompanyId = null;
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

      if (!AuthService.canAccessView(view)) {
        UiService.showToast("Seu usuario nao possui acesso a este menu.", "warning");
        return;
      }

      changeView(view);
    });

    $(document).on("click", ".btn-toggle-user-password", function () {
      const input = $(this).closest(".input-group").find(".user-password-input");
      const nextType = input.attr("type") === "password" ? "text" : "password";

      input.attr("type", nextType);
      $(this).find("i").toggleClass("bi-eye bi-eye-slash");
    });

    $(document).on("change", ".user-role-select", function () {
      const userCard = $(this).closest(".user-admin-card");
      const isUserManager = $(this).val() === "Gestor";

      userCard
        .find(".user-permission-checkbox")
        .prop("disabled", isUserManager)
        .prop("checked", isUserManager ? true : undefined);
    });

    $(document).on("click", ".btn-update-user", function () {
      handleUpdateUser($(this).closest(".user-admin-card"));
    });

    $(document).on("click", ".btn-delete-user", function () {
      handleDeleteUser($(this).data("user-id"));
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

        if (!context.evaluations.length) {
          throw new Error("Não há avaliações no período selecionado para o relatório de desempenho.");
        }

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

        if (!context.latestEvaluation) {
          throw new Error("Não há avaliação no período selecionado para compor o relatório financeiro.");
        }

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
      if (!isManager()) {
        UiService.showToast("Apenas gestores podem editar empresas.", "warning");
        return;
      }

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
      appState.evaluationMode = "new";
      resetDraftEvaluation();
      changeView("evaluations");
      renderEvaluations();
    });

    /* Alterna entre consulta do histórico e realização de uma nova avaliação. */
    $(document).on("click", ".evaluation-mode-btn", function () {
      appState.evaluationMode = $(this).data("evaluation-mode");
      renderEvaluations();
    });

    /* A troca da empresa atualiza imediatamente o formulário. */
    $("#evaluationCompanySelector").on("change", function () {
      appState.selectedEvaluationCompanyId = $(this).val() || null;
      resetDraftEvaluation();
      renderEvaluations();
    });

    $("#evaluationHistoryCompanyFilter").on("change", function () {
      appState.selectedHistoryCompanyId = $(this).val() || null;
      appState.selectedHistoryYear = "all";
      appState.selectedHistorySemester = "all";
      appState.selectedHistoryEvaluationId = null;
      renderEvaluationHistory();
    });

    $("#evaluationHistoryYearFilter").on("change", function () {
      appState.selectedHistoryYear = $(this).val();
      appState.selectedHistoryEvaluationId = null;
      renderEvaluationHistory();
    });

    $("#evaluationHistorySemesterFilter").on("change", function () {
      appState.selectedHistorySemester = $(this).val();
      appState.selectedHistoryEvaluationId = null;
      renderEvaluationHistory();
    });

    $(document).on("click", "[data-action='view-evaluation-history']", function () {
      appState.selectedHistoryEvaluationId = $(this).data("evaluation-id");
      renderEvaluationHistory();
    });

    $(document).on("click", "[data-action='edit-evaluation']", function () {
      startEditingEvaluation($(this).data("evaluation-id"));
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
      const evaluationFormModel = getEvaluationFormModel();
      const isLastAxis =
        appState.activeAxisIndex === evaluationFormModel.axes.length - 1;

      if (isLastAxis) {
        handleSaveEvaluation();
      } else {
        appState.activeAxisIndex += 1;
        renderEvaluations();
        scrollToEvaluationFormStart();
      }
    });

    /* Limpa apenas o eixo atual, não a avaliação inteira. */
    $("#btnClearCurrentAxis").on("click", () => {
      const currentAxis = getEvaluationFormModel().axes[appState.activeAxisIndex];
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
      let value = $(this).val();

      ensureAxisDraft(axisId);

      if ($(this).attr("type") === "checkbox") {
        value = $(
          `.question-answer-input[type='checkbox'][data-axis-id='${axisId}'][data-question-id='${questionId}']:checked`
        )
          .map(function () {
            return $(this).val();
          })
          .get();
      }

      appState.draftEvaluation.axes[axisId].answers[questionId] = value;
      $(this).closest(".question-card").removeClass("border-danger");
    });

    /* Mantém os dados informativos no mesmo rascunho da avaliação. */
    $(document).on("input change", ".evaluation-info-input", function () {
      const fieldName = $(this).data("field-name");
      appState.draftEvaluation.info[fieldName] = $(this).val();
      $(this).removeClass("is-invalid");
    });

    $(document).on("change", "#evaluationFinalClassification", function () {
      appState.draftEvaluation.finalClassification = $(this).val();
    });

    /* Salva nota do indicador. */
    $(document).on("change", ".indicator-score-input", function () {
      const axisId = $(this).data("axis-id");
      const indicatorId = $(this).data("indicator-id");
      const rawScore = $(this).val();
      const score = rawScore === "" ? null : Number(rawScore);

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
      $(this).removeClass("is-invalid");
    });

    /* Salva avaliação final. */
    $("#btnSaveEvaluation").on("click", handleSaveEvaluation);

    /* Salva consultoria. */
    $("#consultancyForm").on("submit", handleSaveConsultancy);
    $("#btnClearConsultancy").on("click", clearConsultancyForm);

    $(document).on("click", "[data-action='edit-consultancy']", function () {
      const consultancy = appState.currentConsultancies.find(
        (item) => item.id === $(this).data("consultancy-id")
      );

      if (!consultancy) {
        return;
      }

      $("#consultancyId").val(consultancy.id);
      $("#consultancyCompanyId").val(consultancy.companyId);
      $("#consultancyDate").val(consultancy.date || "");
      $("#consultancyTime").val(consultancy.time || "");
      $("#consultancyStatus").val(consultancy.status || "Agendada");
      $("#consultancyTopic").val(consultancy.topic || "");
      $("#consultancyLocation").val(consultancy.location || "");
      $("#consultancyConsultant").val(consultancy.consultant || "");
      $("#consultancyNotes").val(consultancy.notes || "");
      $("#consultancyActionPlan").val(consultancy.actionPlan || "");
      $("#consultancyRating").val(consultancy.sessionRating ?? "");
      $("#consultancySubmitLabel").text("Atualizar consultoria");
      document.getElementById("consultancyForm")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });

    $(document).on("click", "[data-action='delete-consultancy']", function () {
      if (!isManager()) {
        UiService.showToast("Apenas gestores podem excluir consultorias.", "warning");
        return;
      }

      const consultancyId = $(this).data("consultancy-id");

      if (!window.confirm("Deseja excluir esta consultoria?")) {
        return;
      }

      DataService.deleteConsultancy(consultancyId);
      clearConsultancyForm();
      refreshDataAndRender();
      UiService.showToast("Consultoria excluída.", "warning");
    });

    /* Notificações: seleção de empresa */
    $("#notificationCompanyId").on("change", function () {
      const companyId = $(this).val();
      appState.selectedNotificationCompanyId = companyId || null;
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

    $("#notificationForm").on("reset", function () {
      appState.selectedNotificationCompanyId = null;
      appState.selectedNotificationFile = null;
      setTimeout(() => {
        $("#notificationCompanyId").val("");
        $("#notificationCompanyEmail").val("");
        $("#filePreview").empty();
        updateNotificationCompanyInfo("");
      }, 0);
    });
  };

  /* Alterna entre as views principais. */
  const changeView = (viewName) => {
    if (!AuthService.canAccessView(viewName)) {
      const fallbackView = AuthService.getFirstAllowedView();

      if (viewName !== fallbackView) {
        UiService.showToast("Acesso restrito para este usuario.", "warning");
      }

      viewName = fallbackView;
    }

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
    if (viewName === "users") renderUserManagement();
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
    renderUserManagement();
    syncNavigationAccess();
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

  const renderPermissionOptions = (user) => {
    const isUserManager = user.role === "Gestor";
    const permissions = user.viewPermissions || [];

    return editablePermissionViews
      .map((viewName) => {
        const checked = isUserManager || permissions.includes(viewName);
        const disabled = isUserManager ? "disabled" : "";

        return `
          <label class="permission-option">
            <input
              type="checkbox"
              class="form-check-input user-permission-checkbox"
              value="${viewName}"
              ${checked ? "checked" : ""}
              ${disabled}
            />
            <span>${UiService.escapeHtml(viewLabels[viewName])}</span>
          </label>
        `;
      })
      .join("");
  };

  const renderUserManagement = () => {
    if (!isManager()) {
      $("#userManagementList").html(
        UiService.renderEmptyState("Acesso restrito", "Somente gestores podem administrar usuarios.")
      );
      $("#demoUsersList").empty();
      return;
    }

    const users = AuthService.getUsers().sort((a, b) => {
      if (a.role !== b.role) {
        return a.role === "Gestor" ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });

    $("#userManagementCountBadge").text(`${users.length} usuários`);

    $("#userManagementList").html(
      users
        .map(
          (user) => `
            <article class="user-admin-card" data-user-id="${UiService.escapeHtml(user.id)}">
              <div class="user-admin-card-header">
                <div>
                  <h3>${UiService.escapeHtml(user.name)}</h3>
                  <span>${UiService.escapeHtml(user.role)}</span>
                </div>
                <span class="soft-badge ${
                  user.status === "Ativo"
                    ? "bg-success-subtle text-success-emphasis border border-success-subtle"
                    : "bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle"
                }">${UiService.escapeHtml(user.status)}</span>
              </div>

              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">Usuário</label>
                  <input type="text" class="form-control user-name-input" value="${UiService.escapeHtml(user.name)}" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Email cadastrado</label>
                  <input type="email" class="form-control user-email-input" value="${UiService.escapeHtml(user.email)}" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Senha cadastrada</label>
                  <div class="input-group">
                    <input type="password" class="form-control user-password-input" value="${UiService.escapeHtml(user.password)}" />
                    <button class="btn btn-outline-secondary btn-toggle-user-password" type="button" aria-label="Mostrar senha">
                      <i class="bi bi-eye"></i>
                    </button>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label">Tipo de acesso</label>
                  <select class="form-select user-role-select">
                    <option value="Avaliador" ${user.role === "Avaliador" ? "selected" : ""}>Avaliador</option>
                    <option value="Gestor" ${user.role === "Gestor" ? "selected" : ""}>Gestor</option>
                  </select>
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label">Status</label>
                  <select class="form-select user-status-select">
                    <option value="Ativo" ${user.status === "Ativo" ? "selected" : ""}>Ativo</option>
                    <option value="Inativo" ${user.status === "Inativo" ? "selected" : ""}>Inativo</option>
                  </select>
                </div>
                <div class="col-12">
                  <div class="permission-grid">
                    ${renderPermissionOptions(user)}
                  </div>
                </div>
              </div>

              <div class="user-admin-actions">
                <button class="btn btn-sm btn-primary btn-update-user" type="button">
                  <i class="bi bi-check2"></i>
                  Atualizar
                </button>
                <button class="btn btn-sm btn-outline-danger btn-delete-user" data-user-id="${UiService.escapeHtml(user.id)}" type="button">
                  <i class="bi bi-trash"></i>
                  Excluir
                </button>
              </div>
            </article>
          `
        )
        .join("")
    );

    $("#demoUsersList").html(
      users
        .map(
          (user) => `
            <div class="demo-user-item">
              <div>
                <strong>${UiService.escapeHtml(user.email)}</strong>
                <span>${UiService.escapeHtml(user.name)} · ${UiService.escapeHtml(user.role)}</span>
              </div>
              <code>${UiService.escapeHtml(user.password)}</code>
            </div>
          `
        )
        .join("")
    );
  };

  const handleUpdateUser = (userCard) => {
    if (!isManager()) {
      UiService.showToast("Somente gestores podem alterar usuarios.", "warning");
      return;
    }

    const userId = userCard.data("user-id");
    const viewPermissions = userCard
      .find(".user-permission-checkbox:checked")
      .map(function () {
        return $(this).val();
      })
      .get();

    try {
      AuthService.updateUser(userId, {
        name: userCard.find(".user-name-input").val(),
        email: userCard.find(".user-email-input").val(),
        password: userCard.find(".user-password-input").val(),
        role: userCard.find(".user-role-select").val(),
        status: userCard.find(".user-status-select").val(),
        viewPermissions
      });

      updateAuthUI();
      renderUserManagement();

      if (!AuthService.canAccessView(appState.currentView)) {
        changeView(AuthService.getFirstAllowedView());
      }

      UiService.showToast("Usuario atualizado com sucesso.", "success");
    } catch (error) {
      UiService.showToast(error.message, "danger");
    }
  };

  const handleDeleteUser = (userId) => {
    if (!isManager()) {
      UiService.showToast("Somente gestores podem excluir usuarios.", "warning");
      return;
    }

    if (!window.confirm("Deseja excluir este usuario do JSON local?")) {
      return;
    }

    try {
      AuthService.deleteUser(userId);
      renderUserManagement();
      UiService.showToast("Usuario excluido com sucesso.", "success");
    } catch (error) {
      UiService.showToast(error.message, "danger");
    }
  };

  /* Preenche selects que dependem da lista de empresas. */
  const populateSharedSelectors = () => {
    const companyOptions = buildCompanyOptionsHtml();

    $("#evaluationCompanySelector").html(companyOptions);
    $("#evaluationHistoryCompanyFilter").html(companyOptions);
    $("#consultancyCompanyId").html(companyOptions);
    $("#reportCompanySelector").html(companyOptions);
    $("#notificationCompanyId").html(`<option value="">Selecione uma empresa...</option>` + companyOptions);

    if (appState.selectedEvaluationCompanyId) {
      $("#evaluationCompanySelector").val(appState.selectedEvaluationCompanyId);
    }

    if (appState.selectedHistoryCompanyId) {
      $("#evaluationHistoryCompanyFilter").val(appState.selectedHistoryCompanyId);
    }

    if (appState.selectedReportCompanyId) {
      $("#reportCompanySelector").val(appState.selectedReportCompanyId);
    }

    if (appState.selectedNotificationCompanyId) {
      $("#notificationCompanyId").val(appState.selectedNotificationCompanyId);
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
              ${getEvaluationSemester(evaluation)}º semestre de ${getEvaluationYear(evaluation)}
              - ${UiService.escapeHtml(evaluation.evaluator)}
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
    const companyIds = new Set(companies.map((company) => company.id));
    const criticalCompanies = companies.filter(
      (company) => company.evaluationResult === "Inapta"
    );
    const nearGraduation = companies.filter(
      (company) =>
        company.evaluationResult === "Apta a Graduar" ||
        company.classification === "Foguete"
    );
    const scheduled = appState.currentConsultancies.filter(
      (item) => item.status === "Agendada" && companyIds.has(item.companyId)
    );

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
    $("#companyRepresentativeCpf").val(company?.representativeCpf || "");
    $("#companyEmail").val(company?.email || "");
    $("#companyPhone").val(company?.phone || "");
    $("#companySector").val(company?.sector || "");
    $("#companyIncubationYear").val(
      company?.incubationYear || new Date().getFullYear()
    );
    $("#companyStatus").val(company?.status || "Incubada");
    $("#companyEmployees").val(company?.employees || 0);
    $("#companyCapital").val(company?.capital || "");
    $("#companyClassification").val(company?.classification || "Skate");
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
      representativeCpf: $("#companyRepresentativeCpf").val(),
      email: $("#companyEmail").val(),
      phone: $("#companyPhone").val(),
      sector: $("#companySector").val(),
      incubationYear: Number($("#companyIncubationYear").val()),
      status: $("#companyStatus").val(),
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

    try {
      DataService.saveCompany(payload);
      companyModalInstance.hide();
      refreshDataAndRender();
      UiService.showToast("Empresa salva com sucesso.", "success");
    } catch (error) {
      UiService.showToast(error.message, "danger");
    }
  };

  /* Exclui empresa após confirmação simples. */
  const handleDeleteCompany = (companyId) => {
    if (!isManager()) {
      UiService.showToast("Apenas gestores podem excluir empresas.", "warning");
      syncNavigationAccess();
      return;
    }

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
            <strong>CPF do representante</strong>
            <div class="text-muted">${UiService.escapeHtml(company.representativeCpf || "-")}</div>
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
    const company = DataService.getCompanyById(appState.selectedEvaluationCompanyId);
    const session = AuthService.getSession();
    const now = new Date();
    const evaluationDate = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")
    ].join("-");

    appState.draftEvaluation = {
      info: {
        startupName: company?.name || "",
        municipality: company?.customFields?.city || "",
        entryMethod: company?.customFields?.entryMethod || "",
        entryMethodOther: company?.customFields?.entryMethodOther || "",
        evaluatorName: session?.name || "",
        evaluatorEmail: session?.email || "",
        representativeName: company?.representative || "",
        representativeEmail: company?.email || "",
        representativeCpf: company?.representativeCpf || company?.customFields?.cpf || "",
        evaluationDate,
        year: now.getFullYear(),
        semester: now.getMonth() < 6 ? 1 : 2
      },
      finalClassification: "",
      axes: {}
    };
    appState.editingEvaluationId = null;
    appState.evaluationFormModel = appState.evaluationModel;
    appState.activeAxisIndex = 0;

    (appState.evaluationFormModel.axes || []).forEach((axis) => {
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
        score: null,
        justification: ""
      };
    }
  };

  const scrollToEvaluationFormStart = () => {
    window.requestAnimationFrame(() => {
      document.getElementById("axisPanelTitle")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  };

  const getEvaluationFormModel = () =>
    appState.evaluationFormModel || appState.evaluationModel;

  const startEditingEvaluation = (evaluationId) => {
    if (!isManager()) {
      UiService.showToast("Apenas gestores podem editar avaliações concluídas.", "warning");
      return;
    }

    const evaluation = DataService.getEvaluationById(evaluationId);

    if (!evaluation) {
      UiService.showToast("Avaliação não encontrada.", "danger");
      return;
    }

    const company = DataService.getCompanyById(evaluation.companyId);
    const session = AuthService.getSession();
    const axes =
      evaluation.modelSnapshot?.axes ||
      (evaluation.modelVersion
        ? appState.evaluationModel.axes
        : window.STARTUP_PULSE_SAMPLE_DATA?.legacyEvaluationAxes) ||
      appState.evaluationModel.axes;

    appState.selectedEvaluationCompanyId = evaluation.companyId;
    appState.editingEvaluationId = evaluation.id;
    appState.evaluationFormModel = {
      ...appState.evaluationModel,
      axes: JSON.parse(JSON.stringify(axes))
    };
    appState.draftEvaluation = {
      info: {
        ...(evaluation.info || evaluation.details?.info || {}),
        startupName: company?.name || evaluation.companyName || "",
        municipality: company?.customFields?.city || "",
        entryMethod: company?.customFields?.entryMethod || "",
        entryMethodOther: company?.customFields?.entryMethodOther || "",
        evaluatorName: session?.name || evaluation.evaluator || "",
        evaluatorEmail: session?.email || evaluation.evaluatorEmail || "",
        representativeName: company?.representative || "",
        representativeEmail: company?.email || "",
        representativeCpf: company?.representativeCpf || company?.customFields?.cpf || "",
        evaluationDate: evaluation.date || "",
        year: getEvaluationYear(evaluation),
        semester: getEvaluationSemester(evaluation)
      },
      finalClassification: evaluation.classification || "",
      axes: JSON.parse(JSON.stringify(evaluation.details?.axes || {}))
    };

    (appState.evaluationFormModel.axes || []).forEach((axis) => {
      if (!appState.draftEvaluation.axes[axis.id]) {
        appState.draftEvaluation.axes[axis.id] = {
          answers: {},
          indicatorRatings: {}
        };
      }
    });

    appState.activeAxisIndex = 0;
    appState.evaluationMode = "new";
    populateSharedSelectors();
    renderEvaluations();
    scrollToEvaluationFormStart();
    UiService.showToast("Avaliação carregada para edição.", "primary");
  };

  const countAxisUnansweredQuestions = (axis, axisDraft) => {
    return (axis?.questions || []).filter(
      (question) =>
        question.answerType !== "none" &&
        isEvaluationAnswerMissing(axisDraft.answers?.[question.id])
    ).length;
  };

  /* Renderiza a tela de avaliações. */
  const renderEvaluations = () => {
    const showingHistory = appState.evaluationMode === "history";

    $("#evaluationHistoryPane").toggleClass("d-none", !showingHistory);
    $("#newEvaluationPane").toggleClass("d-none", showingHistory);
    $(".evaluation-mode-btn").removeClass("active btn-primary").addClass("btn-outline-primary");
    $(`.evaluation-mode-btn[data-evaluation-mode='${appState.evaluationMode}']`)
      .addClass("active btn-primary")
      .removeClass("btn-outline-primary");

    if (showingHistory) {
      renderEvaluationHistory();
      return;
    }

    const company = DataService.getCompanyById(appState.selectedEvaluationCompanyId);

    if (!company) {
      $("#evaluationCompanyTitle").text("Nenhuma empresa selecionada");
      $("#evaluationQuestionsContainer").html(
        UiService.renderEmptyState("Selecione uma empresa", "Escolha uma empresa para iniciar a avaliação.")
      );
      return;
    }

    const evaluationFormModel = getEvaluationFormModel();
    const axis = evaluationFormModel.axes[appState.activeAxisIndex];
    const summary = CalculationService.calculateEvaluationSummary(
      appState.draftEvaluation,
      evaluationFormModel
    );
    const axisDraft = appState.draftEvaluation.axes[axis.id] || { answers: {}, indicatorRatings: {} };
    const currentAxisResult = summary.axisResults.find((item) => item.axisId === axis.id);
    const totalPending = evaluationFormModel.axes.reduce((sum, currentAxis) => {
      const currentDraft = appState.draftEvaluation.axes[currentAxis.id] || {
        answers: {}
      };
      const axisResult = summary.axisResults.find(
        (item) => item.axisId === currentAxis.id
      );

      return (
        sum +
        countAxisUnansweredQuestions(currentAxis, currentDraft) +
        Number(axisResult?.pendingItems || 0)
      );
    }, 0);

    $("#evaluationCompanyTitle").text(company.name);
    $("#evaluationCompanyMeta").text(
      `${company.sector} • Representante: ${company.representative} • Ano ${company.incubationYear}`
    );
    $("#evaluationCurrentAxisBadge").text(`Eixo atual: ${axis.name}`);
    $("#evaluationPendingBadge").text(`Pendências: ${totalPending}`);
    $("#axisPanelTitle").text(axis.name);
    $("#axisPanelSubtitle").text(axis.description);
    $("#evaluationInfoContainer").html(renderEvaluationInfoFields());
    const isLastAxis =
      appState.activeAxisIndex === evaluationFormModel.axes.length - 1;

    $("#btnNextAxis")
      .toggleClass("btn-success", isLastAxis)
      .toggleClass("btn-primary", !isLastAxis)
      .html(
        isLastAxis
          ? `<i class="bi bi-floppy"></i> ${
              appState.editingEvaluationId
                ? "Atualizar avaliação"
                : "Salvar avaliação"
            }`
          : 'Próximo eixo <i class="bi bi-arrow-right"></i>'
      );
    $("#btnSaveEvaluation").html(
      `<i class="bi bi-floppy"></i> ${
        appState.editingEvaluationId ? "Atualizar avaliação" : "Salvar avaliação"
      }`
    );

    /* Render do stepper dos eixos. */
    $("#axisStepper").html(
      evaluationFormModel.axes
        .map((currentAxis, index) => {
          const axisResult = summary.axisResults.find((item) => item.axisId === currentAxis.id);
          const currentDraft = appState.draftEvaluation.axes[currentAxis.id] || {
            answers: {}
          };
          const unansweredQuestions = countAxisUnansweredQuestions(
            currentAxis,
            currentDraft
          );
          const classes = ["step-item"];

          if (index === appState.activeAxisIndex) classes.push("active");
          if (
            axisResult &&
            axisResult.pendingItems === 0 &&
            unansweredQuestions === 0 &&
            axisResult.hasRatings
          ) {
            classes.push("completed");
          }

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
            (item) => {
              const axisConfig = evaluationFormModel.axes.find(
                (axisItem) => axisItem.id === item.axisId
              );
              const axisDraftForSummary =
                appState.draftEvaluation.axes[item.axisId] || { answers: {} };
              const pendingCount =
                item.pendingItems +
                countAxisUnansweredQuestions(axisConfig, axisDraftForSummary);

              return `
              <div class="summary-item">
                <div>
                  <div class="fw-bold">${UiService.escapeHtml(item.axisName)}</div>
                  <div class="small text-muted">Pendências: ${pendingCount}</div>
                </div>
                <div class="score-pill">${item.hasRatings ? item.axisScore.toFixed(1) : "--"}</div>
              </div>
            `;
            }
          )
          .join("")}
      </div>
      <hr />
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="fw-bold">Score geral</span>
        <span class="fs-4 fw-bold text-primary">${summary.overallScore.toFixed(2)}</span>
      </div>
      <div class="mb-3">
        <div class="small text-muted mb-1">Sugestão de resultado avaliativo</div>
        ${UiService.renderClassificationBadge(summary.classification)}
      </div>
      <div>
        <label class="form-label fw-bold" for="evaluationFinalClassification">
          Resultado avaliativo final
        </label>
        <select class="form-select" id="evaluationFinalClassification">
          ${["Inapta", "Satisfatória", "Apta a Graduar"]
            .map((classification) => {
              const selectedClassification =
                appState.draftEvaluation.finalClassification ||
                summary.classification;

              return `
                <option value="${classification}" ${
                  selectedClassification === classification ? "selected" : ""
                }>
                  ${classification}
                </option>
              `;
            })
            .join("")}
        </select>
        <div class="form-text">
          O avaliador pode manter ou alterar a sugestão antes de salvar.
        </div>
      </div>
    `);
  };

  const getEvaluationYear = (evaluation) => {
    return Number(evaluation.year || String(evaluation.date || "").slice(0, 4));
  };

  const getEvaluationSemester = (evaluation) => {
    if (evaluation.semester) {
      return Number(evaluation.semester);
    }

    const month = Number(String(evaluation.date || "").slice(5, 7));
    return month >= 1 && month <= 6 ? 1 : 2;
  };

  const formatEvaluationDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
  };

  /* Renderiza os filtros, a lista e o detalhamento do histórico. */
  const renderEvaluationHistory = () => {
    const companyId = appState.selectedHistoryCompanyId;

    $("#evaluationHistoryCompanyFilter").val(companyId || "");
    $("#evaluationHistorySemesterFilter").val(appState.selectedHistorySemester);

    if (!companyId) {
      $("#evaluationHistoryYearFilter").html('<option value="all">Todos os anos</option>');
      $("#evaluationHistoryList").html(
        UiService.renderEmptyState("Nenhuma empresa disponível", "Cadastre uma empresa para consultar avaliações.")
      );
      $("#evaluationHistoryDetail").html(
        UiService.renderEmptyState("Selecione uma avaliação", "Os detalhes aparecerão neste espaço.")
      );
      return;
    }

    const companyEvaluations = DataService.getEvaluationsByCompany(companyId);
    const years = [...new Set(companyEvaluations.map(getEvaluationYear))]
      .filter((year) => !Number.isNaN(year))
      .sort((a, b) => b - a);

    if (
      appState.selectedHistoryYear !== "all" &&
      !years.includes(Number(appState.selectedHistoryYear))
    ) {
      appState.selectedHistoryYear = "all";
    }

    $("#evaluationHistoryYearFilter")
      .html(
        ['<option value="all">Todos os anos</option>']
          .concat(years.map((year) => `<option value="${year}">${year}</option>`))
          .join("")
      )
      .val(appState.selectedHistoryYear);

    const evaluations = DataService.getEvaluationsByPeriod(
      companyId,
      appState.selectedHistoryYear,
      appState.selectedHistorySemester
    );

    if (
      !appState.selectedHistoryEvaluationId ||
      !evaluations.some(
        (evaluation) => evaluation.id === appState.selectedHistoryEvaluationId
      )
    ) {
      appState.selectedHistoryEvaluationId = evaluations[0]?.id || null;
    }

    $("#evaluationHistoryCount").text(
      `${evaluations.length} ${evaluations.length === 1 ? "avaliação encontrada" : "avaliações encontradas"}`
    );

    if (!evaluations.length) {
      $("#evaluationHistoryList").html(
        UiService.renderEmptyState(
          "Nenhuma avaliação no período",
          "Altere o ano ou o semestre para consultar outros registros."
        )
      );
      $("#evaluationHistoryDetail").html(
        UiService.renderEmptyState(
          "Sem detalhes para exibir",
          "Não existem avaliações para os filtros selecionados."
        )
      );
      return;
    }

    $("#evaluationHistoryList").html(
      evaluations
        .map((evaluation) => {
          const isActive = evaluation.id === appState.selectedHistoryEvaluationId;

          return `
            <button
              type="button"
              class="saved-evaluation-item w-100 text-start border ${isActive ? "border-primary" : ""}"
              data-action="view-evaluation-history"
              data-evaluation-id="${evaluation.id}"
            >
              <div class="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <div class="fw-bold">${formatEvaluationDate(evaluation.date)}</div>
                  <div class="small text-muted">
                    ${getEvaluationSemester(evaluation)}º semestre de ${getEvaluationYear(evaluation)}
                  </div>
                  <div class="small text-muted mt-1">
                    Avaliador: ${UiService.escapeHtml(evaluation.evaluator || "-")}
                  </div>
                </div>
                <div class="text-end">
                  <div class="score-pill">${Number(evaluation.overallScore || 0).toFixed(1)}</div>
                  <div class="mt-2">${UiService.renderClassificationBadge(evaluation.classification)}</div>
                </div>
              </div>
            </button>
          `;
        })
        .join("")
    );

    const selectedEvaluation = evaluations.find(
      (evaluation) => evaluation.id === appState.selectedHistoryEvaluationId
    );
    $("#evaluationHistoryDetail").html(
      renderEvaluationHistoryDetail(selectedEvaluation)
    );
  };

  const renderEvaluationHistoryDetail = (evaluation) => {
    if (!evaluation) {
      return UiService.renderEmptyState(
        "Selecione uma avaliação",
        "Os dados do monitoramento aparecerão neste espaço."
      );
    }

    const info = evaluation.info || evaluation.details?.info || {};
    const axesHtml = Object.entries(evaluation.axisScores || {})
      .map(
        ([axisName, score]) => `
          <div class="summary-item">
            <span>${UiService.escapeHtml(axisName)}</span>
            <strong>${Number(score || 0).toFixed(2)}</strong>
          </div>
        `
      )
      .join("");

    const evaluationAxes =
      evaluation.modelSnapshot?.axes ||
      (evaluation.modelVersion
        ? appState.evaluationModel.axes
        : window.STARTUP_PULSE_SAMPLE_DATA?.legacyEvaluationAxes) ||
      appState.evaluationModel.axes ||
      [];
    const answersHtml = evaluationAxes
      .map((axis) => {
        const axisData = evaluation.details?.axes?.[axis.id];

        if (!axisData) {
          return "";
        }

        const questionRows = (axis.questions || [])
          .filter((question) => question.answerType !== "none")
          .map((question) => {
            const answer = axisData.answers?.[question.id];
            const formattedAnswer = Array.isArray(answer) ? answer.join(", ") : answer;

            return `
              <div class="mb-3">
                <div class="small fw-bold">${UiService.escapeHtml(question.text)}</div>
                <div class="text-muted">${UiService.escapeHtml(formattedAnswer || "-")}</div>
              </div>
            `;
          })
          .join("");

        const indicatorRows = Object.entries(axisData.indicatorRatings || {})
          .map(([indicatorId, rating]) => {
            const indicator = (axis.indicators || []).find(
              (item) => item.id === indicatorId
            );
            const indicatorName =
              indicator?.name ||
              indicatorId
                .replace(/^ind-/, "")
                .replaceAll("-", " ")
                .replace(/\b\w/g, (letter) => letter.toUpperCase());

            return `
              <div class="indicator-box mb-3">
                <div class="d-flex justify-content-between gap-3">
                  <strong>${UiService.escapeHtml(indicatorName)}</strong>
                  <span class="score-pill">${
                    rating.score === null || rating.score === undefined
                      ? "--"
                      : Number(rating.score).toFixed(1)
                  }</span>
                </div>
                <div class="small text-muted mt-2">
                  ${UiService.escapeHtml(rating.justification || "Sem justificativa registrada.")}
                </div>
              </div>
            `;
          })
          .join("");

        return `
          <div class="mt-4">
            <h4 class="h6 mb-3">${UiService.escapeHtml(axis.name)}</h4>
            ${questionRows}
            ${indicatorRows}
          </div>
        `;
      })
      .join("");

    return `
      <div class="d-flex flex-wrap justify-content-between gap-3 mb-4">
        <div>
          <h2 class="section-title mb-1">Avaliação de ${formatEvaluationDate(evaluation.date)}</h2>
          <p class="section-subtitle mb-0">
            ${getEvaluationSemester(evaluation)}º semestre de ${getEvaluationYear(evaluation)}
          </p>
        </div>
        <div class="text-end">
          <div class="fs-3 fw-bold text-primary">${Number(evaluation.overallScore || 0).toFixed(2)}</div>
          ${UiService.renderClassificationBadge(evaluation.classification)}
          <div class="small text-muted mt-2">
            Maturidade:
            ${UiService.escapeHtml(evaluation.maturityClassification || "Skate")}
          </div>
          ${
            evaluation.suggestedClassification &&
            evaluation.suggestedClassification !== evaluation.classification
              ? `
                <div class="small text-muted mt-2">
                  Sugestão da plataforma:
                  ${UiService.escapeHtml(evaluation.suggestedClassification)}
                </div>
              `
              : ""
          }
          <div class="mt-3">
            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              data-action="edit-evaluation"
              data-evaluation-id="${evaluation.id}"
            >
              <i class="bi bi-pencil-square"></i>
              Editar avaliação
            </button>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <div class="muted-card h-100">
            <div class="small text-muted">Avaliador</div>
            <strong>${UiService.escapeHtml(evaluation.evaluator || "-")}</strong>
            <div class="small text-muted">${UiService.escapeHtml(evaluation.evaluatorEmail || "-")}</div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="muted-card h-100">
            <div class="small text-muted">Período do monitoramento</div>
            <strong>${getEvaluationSemester(evaluation)}º semestre de ${getEvaluationYear(evaluation)}</strong>
          </div>
        </div>
      </div>

      <div class="summary-list mb-4">${axesHtml}</div>

      <div class="accordion" id="evaluationHistoryAnswers">
        <div class="accordion-item">
          <h3 class="accordion-header">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#evaluationHistoryAnswersContent"
            >
              Respostas e justificativas
            </button>
          </h3>
          <div
            id="evaluationHistoryAnswersContent"
            class="accordion-collapse collapse"
            data-bs-parent="#evaluationHistoryAnswers"
          >
            <div class="accordion-body">${answersHtml || '<div class="text-muted">Detalhes não disponíveis para este registro.</div>'}</div>
          </div>
        </div>
      </div>
    `;
  };

  /* Renderiza os dados de identificação e contexto do monitoramento. */
  const renderEvaluationInfoFields = () => {
    const company = DataService.getCompanyById(appState.selectedEvaluationCompanyId);
    const info = appState.draftEvaluation.info || {};
    const entryMethod =
      info.entryMethod === "Outro"
        ? info.entryMethodOther
        : info.entryMethod;
    const fixedFields = [
      ["Nome da startup", company?.name],
      ["CNPJ", company?.cnpj],
      ["Município de origem", company?.customFields?.city],
      ["Forma de ingresso", entryMethod],
      ["Responsável pela startup", company?.representative],
      ["E-mail do responsável", company?.email],
      ["CPF do responsável", company?.representativeCpf || company?.customFields?.cpf]
    ];
    const missingCompanyFields = fixedFields
      .filter(([, value]) => !String(value || "").trim())
      .map(([label]) => label);

    return `
      ${
        appState.editingEvaluationId
          ? `
            <div class="col-12">
              <div class="alert alert-primary mb-0">
                <i class="bi bi-pencil-square me-2"></i>
                Você está editando uma avaliação existente. O registro será atualizado ao salvar.
              </div>
            </div>
          `
          : ""
      }

      <div class="col-12">
        <div class="alert alert-light border d-flex align-items-start gap-2 mb-0">
          <i class="bi bi-lock-fill text-secondary"></i>
          <div>
            <strong>Dados cadastrais somente para consulta.</strong>
            <div class="small text-muted">
              Para corrigir estas informações, edite o cadastro na aba Empresas.
            </div>
          </div>
        </div>
      </div>

      ${
        missingCompanyFields.length
          ? `
            <div class="col-12">
              <div class="alert alert-warning mb-0">
                <strong>Cadastro incompleto:</strong>
                ${UiService.escapeHtml(missingCompanyFields.join(", "))}.
                A avaliação pode continuar, mas esses dados devem ser corrigidos na aba Empresas.
              </div>
            </div>
          `
          : ""
      }

      ${fixedFields
        .map(
          ([label, value]) => `
            <div class="col-12 col-md-6">
              <div class="muted-card h-100">
                <div class="small text-muted">${UiService.escapeHtml(label)}</div>
                <strong>${UiService.escapeHtml(value || "Não informado")}</strong>
              </div>
            </div>
          `
        )
        .join("")}

      <div class="col-12"><hr class="my-2" /></div>

      <div class="col-12 col-md-6">
        <label class="form-label">Data da avaliação *</label>
        <input
          type="date"
          class="form-control evaluation-info-input"
          id="evaluationDate"
          data-field-name="evaluationDate"
          value="${UiService.escapeHtml(info.evaluationDate || "")}"
          required
        />
      </div>

      <div class="col-12 col-md-6">
        <label class="form-label">Avaliador</label>
        <input
          type="text"
          class="form-control"
          value="${UiService.escapeHtml(info.evaluatorName || "")}"
          readonly
        />
        <div class="form-text">
          Identificado automaticamente pela conta conectada.
        </div>
      </div>

      <div class="col-12 col-md-6">
        <label class="form-label">E-mail do avaliador</label>
        <input
          type="email"
          class="form-control"
          value="${UiService.escapeHtml(info.evaluatorEmail || "")}"
          readonly
        />
      </div>

      <div class="col-12 col-md-6">
        <label class="form-label">Ano do monitoramento *</label>
        <input
          type="number"
          min="2000"
          max="2100"
          class="form-control evaluation-info-input"
          id="evaluationYear"
          data-field-name="year"
          value="${UiService.escapeHtml(info.year ?? "")}"
          required
        />
      </div>

      <div class="col-12 col-md-6">
        <label class="form-label">Semestre do monitoramento *</label>
        <select
          class="form-select evaluation-info-input"
          id="evaluationSemester"
          data-field-name="semester"
          required
        >
          <option value="">Selecione...</option>
          <option value="1" ${Number(info.semester) === 1 ? "selected" : ""}>1º semestre</option>
          <option value="2" ${Number(info.semester) === 2 ? "selected" : ""}>2º semestre</option>
        </select>
      </div>
    `;
  };

  /* Renderiza um card de pergunta com campos de resposta e indicadores. */
  const renderQuestionCard = (axis, question, axisDraft) => {
    const currentAnswer = axisDraft.answers?.[question.id] ?? "";
    const linkedIndicators = (question.indicatorsLinked || []).filter(
      (indicatorId) => {
        const lastLinkedQuestion = [...(axis.questions || [])]
          .reverse()
          .find((item) => (item.indicatorsLinked || []).includes(indicatorId));

        return lastLinkedQuestion?.id === question.id;
      }
    );
    const hasAnswerField = question.answerType !== "none";

    return `
      <div
        class="question-card"
        id="question-card-${axis.id}-${question.id}"
        data-axis-id="${axis.id}"
        data-question-id="${question.id}"
      >
        <div class="question-title">${UiService.escapeHtml(question.text)}</div>
        <div class="question-helper">${UiService.escapeHtml(question.helper || '')}</div>
        ${
          hasAnswerField
            ? `
              <div class="mb-3">
                <label class="form-label small text-muted">Resposta do avaliado</label>
                ${renderQuestionInput(axis.id, question, currentAnswer)}
              </div>
            `
            : ""
        }
        ${
          linkedIndicators.length
            ? `
              <div class="indicator-title">
                ${linkedIndicators.length === 1 ? "Avaliação do indicador" : "Avaliação dos indicadores"}
              </div>
              <div class="row g-3">
                ${linkedIndicators
            .map((indicatorId) => {
              const indicator = axis.indicators.find((item) => item.id === indicatorId);

              if (!indicator) {
                return "";
              }

              const currentIndicator = axisDraft.indicatorRatings?.[indicatorId] || {
                score: null,
                justification: ""
              };

              return `
                <div class="col-12 col-lg-6">
                  <div
                    class="indicator-box h-100"
                    id="indicator-box-${axis.id}-${indicatorId}"
                  >
                    <div class="fw-bold mb-2">${UiService.escapeHtml(indicator.name)}</div>
                    <label class="form-label small text-muted">Nota do indicador</label>
                    <select class="form-select indicator-score-input mb-3" data-axis-id="${axis.id}" data-indicator-id="${indicatorId}">
                      <option value="">Selecione...</option>
                      ${appState.evaluationModel.scale
                        .map(
                          (score) => `
                            <option value="${score}" ${
                              currentIndicator.score !== null &&
                              currentIndicator.score !== undefined &&
                              currentIndicator.score !== "" &&
                              Number(currentIndicator.score) === score
                                ? "selected"
                                : ""
                            }>
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
            `
            : ""
        }
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

    if (
      question.answerType === "toggle" ||
      question.answerType === "toggle_button" ||
      question.answerType === "radio"
    ) {
      return `
        <div class="d-flex flex-wrap gap-2">
          ${question.options
            .map(
              (option, index) => `
              <input
                class="btn-check question-answer-input"
                type="radio"
                name="${axisId}-${question.id}"
                id="${question.id}-${index}"
                value="${UiService.escapeHtml(option)}"
                data-axis-id="${axisId}"
                data-question-id="${question.id}"
                ${currentAnswer === option ? 'checked' : ''}
              />
              <label class="btn btn-outline-primary" for="${question.id}-${index}">
                ${UiService.escapeHtml(option)}
              </label>
            `
            )
            .join("")}
        </div>
      `;
    }

    if (question.answerType === "checkbox") {
      const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : [];

      return question.options
        .map(
          (option, index) => `
            <div class="form-check mb-2">
              <input
                class="form-check-input question-answer-input"
                type="checkbox"
                id="${question.id}-${index}"
                value="${UiService.escapeHtml(option)}"
                data-axis-id="${axisId}"
                data-question-id="${question.id}"
                ${selectedOptions.includes(option) ? "checked" : ""}
              />
              <label class="form-check-label" for="${question.id}-${index}">
                ${UiService.escapeHtml(option)}
              </label>
            </div>
          `
        )
        .join("");
    }

    if (question.answerType === "select") {
      return `
        <select
          class="form-select question-answer-input"
          data-axis-id="${axisId}"
          data-question-id="${question.id}"
        >
          <option value="">Selecione...</option>
          ${(question.options || [])
            .map(
              (option) => `
                <option value="${UiService.escapeHtml(option)}" ${currentAnswer === option ? "selected" : ""}>
                  ${UiService.escapeHtml(option)}
                </option>
              `
            )
            .join("")}
        </select>
      `;
    }

    if (question.answerType === "none") {
      return "";
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
            const item = axisDraft.indicatorRatings?.[indicator.id] || { score: null };
            return `
              <div class="summary-item">
                <div>
                  <div class="fw-bold">${UiService.escapeHtml(indicator.name)}</div>
                  <div class="small text-muted">Justificativa: ${item.justification ? 'preenchida' : 'pendente'}</div>
                </div>
                <div class="score-pill">${
                  item.score !== null && item.score !== undefined && item.score !== ""
                    ? item.score
                    : "--"
                }</div>
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

  const isEvaluationAnswerMissing = (answer) => {
    if (Array.isArray(answer)) {
      return answer.length === 0;
    }

    return (
      answer === null ||
      answer === undefined ||
      (typeof answer === "string" && !answer.trim())
    );
  };

  const showEvaluationValidationError = ({
    message,
    axisIndex = null,
    selector
  }) => {
    if (axisIndex !== null) {
      appState.activeAxisIndex = axisIndex;
      renderEvaluations();
    }

    UiService.showToast(message, "warning");

    window.requestAnimationFrame(() => {
      const element = document.querySelector(selector);

      if (!element) {
        return;
      }

      element.classList.add(
        element.matches("input, select, textarea") ? "is-invalid" : "border-danger"
      );
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      const focusTarget = element.matches("input, select, textarea")
        ? element
        : element.querySelector("input:not([type='hidden']), select, textarea");
      focusTarget?.focus({ preventScroll: true });
    });
  };

  const findFirstEvaluationContentIssue = () => {
    const axes = getEvaluationFormModel().axes || [];

    for (let axisIndex = 0; axisIndex < axes.length; axisIndex += 1) {
      const axis = axes[axisIndex];
      const axisDraft = appState.draftEvaluation.axes?.[axis.id] || {
        answers: {},
        indicatorRatings: {}
      };

      for (const question of axis.questions || []) {
        if (
          question.answerType !== "none" &&
          isEvaluationAnswerMissing(axisDraft.answers?.[question.id])
        ) {
          return {
            message: `Responda a pergunta "${question.text}".`,
            axisIndex,
            selector: `#question-card-${axis.id}-${question.id}`
          };
        }
      }

      for (const indicator of axis.indicators || []) {
        const rating = axisDraft.indicatorRatings?.[indicator.id];

        if (
          !rating ||
          rating.score === null ||
          rating.score === undefined ||
          rating.score === ""
        ) {
          return {
            message: `Informe a nota do indicador "${indicator.name}".`,
            axisIndex,
            selector: `#indicator-box-${axis.id}-${indicator.id} .indicator-score-input`
          };
        }

        if (!String(rating.justification || "").trim()) {
          return {
            message: `Justifique a nota do indicador "${indicator.name}".`,
            axisIndex,
            selector: `#indicator-box-${axis.id}-${indicator.id} .indicator-justification-input`
          };
        }
      }
    }

    return null;
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
      getEvaluationFormModel()
    );
    const info = appState.draftEvaluation.info || {};
    const evaluationDate = String(info.evaluationDate || "");
    const parsedEvaluationDate = new Date(`${evaluationDate}T00:00:00`);
    const year = Number(info.year);
    const semester = Number(info.semester);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(evaluationDate) ||
      Number.isNaN(parsedEvaluationDate.getTime()) ||
      [
        parsedEvaluationDate.getFullYear(),
        String(parsedEvaluationDate.getMonth() + 1).padStart(2, "0"),
        String(parsedEvaluationDate.getDate()).padStart(2, "0")
      ].join("-") !== evaluationDate
    ) {
      showEvaluationValidationError({
        message: "Informe a data em que a avaliação foi realizada.",
        selector: "#evaluationDate"
      });
      return;
    }

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      showEvaluationValidationError({
        message: "Informe um ano de monitoramento válido.",
        selector: "#evaluationYear"
      });
      return;
    }

    if (![1, 2].includes(semester)) {
      showEvaluationValidationError({
        message: "Selecione o semestre do monitoramento.",
        selector: "#evaluationSemester"
      });
      return;
    }

    if (
      DataService.hasEvaluationForPeriod(
        company.id,
        year,
        semester,
        appState.editingEvaluationId
      )
    ) {
      showEvaluationValidationError({
        message: `Já existe uma avaliação desta empresa para o ${semester}º semestre de ${year}.`,
        selector: "#evaluationYear"
      });
      return;
    }

    const contentIssue = findFirstEvaluationContentIssue();

    if (contentIssue) {
      showEvaluationValidationError(contentIssue);
      return;
    }

    const payload = {
      companyId: company.id,
      companyName: company.name,
      companySnapshot: JSON.parse(JSON.stringify(company)),
      evaluator: info.evaluatorName,
      evaluatorEmail: info.evaluatorEmail || "",
      date: evaluationDate,
      year,
      semester,
      info: JSON.parse(JSON.stringify(info)),
      modelVersion: appState.evaluationModel.version,
      modelSnapshot: {
        axes: JSON.parse(JSON.stringify(getEvaluationFormModel().axes || []))
      },
      axisScores: Object.fromEntries(
        summary.axisResults.map((item) => [item.axisName, item.axisScore])
      ),
      overallScore: summary.overallScore,
      suggestedClassification: summary.classification,
      classification:
        appState.draftEvaluation.finalClassification || summary.classification,
      maturityClassification: String(
        appState.draftEvaluation.axes?.["axis-market"]?.answers?.["q-mar-12"] ||
          "Skate"
      ).split(":")[0],
      details: JSON.parse(JSON.stringify(appState.draftEvaluation))
    };

    try {
      const wasEditing = Boolean(appState.editingEvaluationId);
      const savedEvaluation = wasEditing
        ? DataService.updateEvaluation(appState.editingEvaluationId, payload)
        : DataService.saveEvaluation(payload);
      appState.selectedHistoryCompanyId = company.id;
      appState.selectedHistoryYear = String(payload.year);
      appState.selectedHistorySemester = String(payload.semester);
      appState.selectedHistoryEvaluationId = savedEvaluation.id;
      appState.evaluationMode = "history";
      resetDraftEvaluation();
      refreshDataAndRender();
      UiService.showToast(
        wasEditing
          ? "Avaliação atualizada com sucesso."
          : "Avaliação salva com sucesso.",
        "success"
      );
    } catch (error) {
      UiService.showToast(error.message, "danger");
    }
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
                  <button class="btn btn-sm btn-outline-secondary" data-action="edit-consultancy" data-consultancy-id="${item.id}" aria-label="Editar consultoria">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" data-action="delete-consultancy" data-consultancy-id="${item.id}" aria-label="Excluir consultoria">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <div class="small text-muted mb-2">
                ${item.time ? `Horário: ${UiService.escapeHtml(item.time)}` : ""}
                ${item.location ? `${item.time ? " • " : ""}Local: ${UiService.escapeHtml(item.location)}` : ""}
                ${
                  item.sessionRating !== null &&
                  item.sessionRating !== undefined &&
                  item.sessionRating !== ""
                    ? `${item.time || item.location ? " • " : ""}Nota: ${Number(item.sessionRating).toFixed(1)}`
                    : ""
                }
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
      time: $("#consultancyTime").val(),
      status: $("#consultancyStatus").val(),
      topic: $("#consultancyTopic").val(),
      location: $("#consultancyLocation").val(),
      consultant: $("#consultancyConsultant").val(),
      notes: $("#consultancyNotes").val(),
      actionPlan: $("#consultancyActionPlan").val(),
      sessionRating:
        $("#consultancyRating").val() === ""
          ? null
          : Number($("#consultancyRating").val())
    };

    if (!payload.companyId || !payload.date || !payload.topic || !payload.consultant) {
      UiService.showToast("Preencha os campos essenciais da consultoria.", "warning");
      return;
    }

    try {
      const consultancyId = $("#consultancyId").val();

      if (consultancyId) {
        DataService.updateConsultancy(consultancyId, payload);
      } else {
        DataService.saveConsultancy(payload);
      }

      clearConsultancyForm();
      refreshDataAndRender();
      UiService.showToast(
        consultancyId
          ? "Consultoria atualizada com sucesso."
          : "Consultoria salva com sucesso.",
        "success"
      );
    } catch (error) {
      UiService.showToast(error.message, "danger");
    }
  };

  const clearConsultancyForm = () => {
    $("#consultancyForm")[0]?.reset();
    $("#consultancyId").val("");
    $("#consultancySubmitLabel").text("Salvar consultoria");
  };

  /* Atualiza as informações da empresa selecionada no formulário de notificações. */
  const updateNotificationCompanyInfo = (companyId) => {
    if (!companyId) {
      $("#notificationCompanyEmail").val("");
      $("#notificationCompanyInfo").html("<p class=\"mb-0\">Selecione uma empresa para visualizar seus dados.</p>");
      return;
    }

    const company = DataService.getCompanyById(companyId);

    if (!company) {
      $("#notificationCompanyEmail").val("");
      $("#notificationCompanyInfo").html("<p class=\"mb-0\">Empresa não encontrada.</p>");
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
    const notifications = appState.currentNotifications || [];

    $("#notificationHistory").html(
      notifications.length
        ? notifications
            .map(
              (notification) => `
                <div class="report-history-card">
                  <div class="d-flex flex-wrap justify-content-between gap-2 mb-2">
                    <div>
                      <div class="fw-bold">${UiService.escapeHtml(notification.companyName)}</div>
                      <div class="report-history-meta">
                        ${new Date(notification.createdAt).toLocaleString("pt-BR")}
                        • ${UiService.escapeHtml(notification.createdBy || "-")}
                      </div>
                    </div>
                    <span class="soft-badge bg-info-subtle text-info-emphasis border border-info-subtle">
                      ${UiService.escapeHtml(notification.deliveryStatus || "Registrada")}
                    </span>
                  </div>
                  <div>${UiService.escapeHtml(notification.content || "")}</div>
                  ${
                    notification.attachment?.name
                      ? `<div class="small text-muted mt-2">Arquivo referenciado: ${UiService.escapeHtml(notification.attachment.name)}</div>`
                      : ""
                  }
                </div>
              `
            )
            .join("")
        : UiService.renderEmptyState(
            "Nenhuma comunicação registrada",
            "Os comunicados cadastrados aparecerão aqui e serão incluídos no JSON exportado."
          )
    );

    if (!appState.selectedNotificationCompanyId) {
      $sel.val("");
      updateNotificationCompanyInfo("");
      return;
    }

    $sel.val(appState.selectedNotificationCompanyId);
    updateNotificationCompanyInfo(appState.selectedNotificationCompanyId);
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

    const notification = {
      companyId,
      email,
      content: description.trim(),
      attachment: appState.selectedNotificationFile
        ? {
            name: appState.selectedNotificationFile.name,
            type: appState.selectedNotificationFile.type,
            size: appState.selectedNotificationFile.size
          }
        : null,
      createdBy: AuthService.getSession()?.name || "Usuário"
    };

    const savedNotification = DataService.saveNotification(notification);
    showNotificationSuccessModal(savedNotification);

    /* Limpa o formulário */
    $("#notificationForm")[0].reset();
    appState.selectedNotificationFile = null;
    appState.selectedNotificationCompanyId = null;
    $("#filePreview").empty();
    $("#notificationCompanyId").val("").trigger("change");
    $("#notificationCompanyEmail").val("");
    refreshDataAndRender();
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
        <h5 class="mb-3">Comunicação registrada</h5>
        <div class="text-muted small mb-4">
          <p class="mb-2"><strong>Empresa:</strong> ${UiService.escapeHtml(companyName)}</p>
          <p class="mb-2"><strong>Email:</strong> ${UiService.escapeHtml(notification.email)}</p>
          ${notification.attachment?.name ? `<p class="mb-2"><strong>Arquivo:</strong> ${UiService.escapeHtml(notification.attachment.name)}</p>` : ""}
          <p class="mb-0"><strong>Registrado em:</strong> ${new Date(notification.createdAt).toLocaleString("pt-BR")}</p>
        </div>
        <p class="text-muted mb-0">Nenhum e-mail foi enviado por esta versão local.</p>
      </div>
    `;

    /* Usa a abordagem de toast que já existe no projeto */
    UiService.showToast("Comunicação registrada para " + companyName, "success");
    
    /* Exibe também um alerta visual no topo do formulário */
    const alertHtml = `
      <div class="alert alert-success notification-alert alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>
        <strong>Registro salvo.</strong> Comunicação destinada a ${UiService.escapeHtml(companyName)}.
        ${notification.attachment?.name ? `<br/><small class="text-muted">Arquivo referenciado: ${UiService.escapeHtml(notification.attachment.name)}</small>` : ""}
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
    const latestEvaluation = context.latestEvaluation;
    const financialSummary = context.financialSummary;

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
          <span class="report-context-label">Classificação de maturidade</span>
          <span>${
            latestEvaluation
              ? UiService.renderClassificationBadge(latestEvaluation.maturityClassification)
              : UiService.renderClassificationBadge("Skate")
          }</span>
        </div>

        <div class="report-context-item">
          <span class="report-context-label">Resultado da última avaliação</span>
          <span>${
            latestEvaluation
              ? UiService.renderClassificationBadge(latestEvaluation.classification)
              : '<span class="text-muted">Sem avaliação no período</span>'
          }</span>
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

    const financialBlock = latestEvaluation
      ? `
        <div class="report-history-card">
          <div class="fw-bold mb-2">Dados financeiros da última avaliação</div>
          <div class="report-history-meta mb-3">
            ${getEvaluationSemester(latestEvaluation)}º semestre de ${getEvaluationYear(latestEvaluation)}
            • Nota do eixo Capital: ${
              financialSummary.axisScore === null
                ? "-"
                : Number(financialSummary.axisScore).toFixed(2)
            }
          </div>
          ${financialSummary.rows
            .map(
              (row) => `
                <div class="summary-item py-2">
                  <span>${UiService.escapeHtml(row.label)}</span>
                  <strong>${UiService.escapeHtml(row.value)}</strong>
                </div>
              `
            )
            .join("")}
        </div>
      `
      : `
        <div class="report-history-card">
          <div class="fw-bold mb-2">Resumo financeiro do período</div>
          <div class="report-history-meta">Nenhuma avaliação encontrada no período.</div>
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
