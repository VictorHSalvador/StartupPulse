/*
  Serviço de cálculo do MVP.
  Ele existe separado da interface para facilitar a troca futura por MCDA/ELECTRE-TRI.
  Hoje ele usa regras simples e provisórias.
*/
window.CalculationService = (() => {
  /* Normaliza qualquer valor para número entre 1 e 5 quando aplicável. */
  const normalizeScore = (value) => {
    const numeric = Number(value);

    if (Number.isNaN(numeric)) {
      return 0;
    }

    if (numeric < 0) {
      return 0;
    }

    if (numeric > 5) {
      return 5;
    }

    return numeric;
  };

  /* Calcula média simples de um conjunto numérico válido. */
  const average = (numbers) => {
    const validNumbers = numbers
      .map((number) => normalizeScore(number))
      .filter((number) => number > 0);

    if (!validNumbers.length) {
      return 0;
    }

    const total = validNumbers.reduce((sum, current) => sum + current, 0);
    return Number((total / validNumbers.length).toFixed(2));
  };

  /*
    Calcula o score do eixo com base nas notas dos indicadores.
    Nesta fase, cada indicador pesa igualmente.
  */
  const calculateAxisScore = (indicatorScores) => {
    const validScores = Object.values(indicatorScores || {})
      .filter((score) => score !== null && score !== undefined && score !== "")
      .map((score) => normalizeScore(score));

    if (!validScores.length) {
      return 0;
    }

    const total = validScores.reduce((sum, current) => sum + current, 0);
    return Number((total / validScores.length).toFixed(2));
  };

  /*
    Conta pendências do eixo.
    Usado para alertar o avaliador que ainda faltam notas ou justificativas.
  */
  const countAxisPendingItems = (axisData, axisConfig) => {
    if (!axisConfig) {
      return 0;
    }

    let pending = 0;

    axisConfig.indicators.forEach((indicator) => {
      const indicatorEntry = axisData?.indicatorRatings?.[indicator.id];

      if (
        !indicatorEntry ||
        indicatorEntry.score === null ||
        indicatorEntry.score === undefined ||
        indicatorEntry.score === "" ||
        !String(indicatorEntry.justification || "").trim()
      ) {
        pending += 1;
      }
    });

    return pending;
  };

  /*
    Gera o panorama completo da avaliação em andamento.
    O retorno já vem pronto para a UI consumir.
  */
  const calculateEvaluationSummary = (draftEvaluation, evaluationModel) => {
    const axisResults = (evaluationModel?.axes || []).map((axis) => {
      const axisDraft = draftEvaluation?.axes?.[axis.id] || { indicatorRatings: {} };
      const indicatorScores = {};

      axis.indicators.forEach((indicator) => {
        const rawScore = axisDraft.indicatorRatings?.[indicator.id]?.score;
        indicatorScores[indicator.id] =
          rawScore === null || rawScore === undefined || rawScore === ""
            ? null
            : Number(rawScore);
      });

      const axisScore = calculateAxisScore(indicatorScores);
      const pendingItems = countAxisPendingItems(axisDraft, axis);
      const hasRatings = Object.values(indicatorScores).some(
        (score) => score !== null && score !== undefined && score !== ""
      );

      return {
        axisId: axis.id,
        axisName: axis.name,
        axisScore,
        pendingItems,
        hasRatings,
        indicatorScores
      };
    });

    const ratedAxisScores = axisResults
      .filter((axis) => axis.hasRatings)
      .map((axis) => axis.axisScore);
    const overallScore = ratedAxisScores.length
      ? Number(
          (
            ratedAxisScores.reduce((sum, score) => sum + score, 0) /
            ratedAxisScores.length
          ).toFixed(2)
        )
      : 0;
    const classification = classifyOverallScore(overallScore, axisResults);

    return {
      axisResults,
      overallScore,
      classification
    };
  };

  /*
    Regra provisória de classificação.
    Ela não pretende substituir o futuro modelo multicritério.
  */
  const classifyOverallScore = (overallScore, axisResults) => {
    const hasCriticalAxis = axisResults.some(
      (axis) => axis.hasRatings && axis.axisScore < 2.5
    );
    const manyWeakAxes =
      axisResults.filter((axis) => axis.hasRatings && axis.axisScore < 3).length >= 2;

    if (hasCriticalAxis || manyWeakAxes || overallScore < 2.5) {
      return "Inapta";
    }

    const allStrongAxes = axisResults.every((axis) => axis.axisScore >= 4);

    if (overallScore >= 4.2 && allStrongAxes) {
      return "Apta a Graduar";
    }

    return "Satisfatória";
  };

  /* Mapeia classificação para status operacional de leitura rápida. */
  const classifyOperationalStatus = (classification) => {
    if (classification === "Inapta") {
      return "Crítica";
    }

    if (classification === "Apta a Graduar") {
      return "Graduada";
    }

    return "Incubada";
  };

  /*
    Resume números estratégicos da dashboard.
    Mantém a lógica agregada fora da interface.
  */
  const calculateDashboardMetrics = (companies, consultancies, savedEvaluations) => {
    const totalCompanies = companies.length;
    const incubating = companies.filter((company) => company.status === "Incubada").length;
    const graduated = companies.filter((company) => company.status === "Graduada").length;
    const critical = companies.filter((company) => company.status === "Crítica").length;
    const avgScore = average(companies.map((company) => company.currentScore || 0));
    const scheduledConsultancies = consultancies.filter((item) => item.status === "Agendada").length;
    const savedEvaluationCount = savedEvaluations.length;

    return {
      totalCompanies,
      incubating,
      graduated,
      critical,
      avgScore,
      scheduledConsultancies,
      savedEvaluationCount
    };
  };

  return {
    normalizeScore,
    average,
    calculateAxisScore,
    countAxisPendingItems,
    calculateEvaluationSummary,
    classifyOverallScore,
    classifyOperationalStatus,
    calculateDashboardMetrics
  };
})();
