/*
  Serviço de interface.
  Reúne funções reutilizáveis de renderização e feedback visual.
*/
window.UiService = (() => {
  /* Escapa HTML básico para exibir texto de usuário com segurança. */
  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  /* Cria badge visual padronizada para status. */
  const renderStatusBadge = (status) => {
    const map = {
      Incubada: "bg-info-subtle text-info-emphasis border border-info-subtle",
      Graduada: "bg-success-subtle text-success-emphasis border border-success-subtle",
      Crítica: "bg-danger-subtle text-danger-emphasis border border-danger-subtle",
      Desligada: "bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle"
    };

    return `<span class="soft-badge ${map[status] || 'bg-secondary-subtle text-secondary-emphasis'}">${escapeHtml(
      status
    )}</span>`;
  };

  /* Cria badge padronizada para classificação. */
  const renderClassificationBadge = (classification) => {
    const map = {
      Inapta: "bg-danger-subtle text-danger-emphasis border border-danger-subtle",
      Satisfatória: "bg-warning-subtle text-warning-emphasis border border-warning-subtle",
      "Apta a Graduar": "bg-success-subtle text-success-emphasis border border-success-subtle",
      Skate: "bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle",
      Bicicleta: "bg-info-subtle text-info-emphasis border border-info-subtle",
      Carro: "bg-primary-subtle text-primary-emphasis border border-primary-subtle",
      Avião: "bg-warning-subtle text-warning-emphasis border border-warning-subtle",
      Foguete: "bg-success-subtle text-success-emphasis border border-success-subtle"
    };

    return `<span class="soft-badge ${map[classification] || 'bg-secondary-subtle text-secondary-emphasis'}">${escapeHtml(
      classification
    )}</span>`;
  };

  /* Exibe toast de feedback para o usuário operador. */
  const showToast = (message, type = "primary") => {
    const toastId = `toast-${Date.now()}`;
    const iconMap = {
      success: "bi-check-circle-fill",
      danger: "bi-x-circle-fill",
      warning: "bi-exclamation-triangle-fill",
      primary: "bi-info-circle-fill"
    };

    const html = `
      <div id="${toastId}" class="toast align-items-center border-0 text-bg-${type}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi ${iconMap[type] || iconMap.primary}"></i>
            <span>${escapeHtml(message)}</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
        </div>
      </div>
    `;

    $("#toastContainer").append(html);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });

    toast.show();

    toastElement.addEventListener("hidden.bs.toast", () => {
      toastElement.remove();
    });
  };

  /* Gera bloco de estado vazio reaproveitável. */
  const renderEmptyState = (title, subtitle) => `
    <div class="text-center py-5">
      <div class="mb-3 text-secondary fs-1"><i class="bi bi-inbox"></i></div>
      <h3 class="h5 mb-2">${escapeHtml(title)}</h3>
      <p class="text-muted mb-0">${escapeHtml(subtitle)}</p>
    </div>
  `;

  return {
    escapeHtml,
    renderStatusBadge,
    renderClassificationBadge,
    showToast,
    renderEmptyState
  };
})();
