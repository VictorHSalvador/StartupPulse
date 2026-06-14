/*
  Este arquivo concentra os dados iniciais do MVP.
  Ele existe para que o sistema funcione imediatamente ao abrir no navegador,
  mesmo antes de importar planilhas ou arquivos JSON próprios.
*/
window.STARTUP_PULSE_SAMPLE_DATA = {
  /*
    Empresas monitoradas pela incubadora.
    Cada empresa é a entidade central do sistema, como definimos.
  */
  companies: [
    {
      id: "emp-001",
      name: "NovaTech Solutions",
      corporateName: "NovaTech Solutions LTDA",
      cnpj: "12.345.678/0001-10",
      sector: "SaaS / IA",
      representative: "Helena Duarte",
      email: "contato@novatechsolutions.com",
      phone: "(22) 99999-1001",
      incubationYear: 2023,
      status: "Incubada",
      classification: "Skate",
      currentScore: 4.23,
      employees: 9,
      capital: "R$ 180.000",
      products: "Plataforma de automação analítica para PMEs.",
      notes: "Boa evolução comercial no último ciclo.",
      customFields: {
        stage: "Tração",
        city: "Campos dos Goytacazes",
        marketFocus: "B2B"
      }
    },
    {
      id: "emp-002",
      name: "GreenHarvest Bio",
      corporateName: "GreenHarvest Bio Tecnologia LTDA",
      cnpj: "22.345.678/0001-20",
      sector: "AgriTech",
      representative: "Marcos Vieira",
      email: "contato@greenharvestbio.com",
      phone: "(21) 99999-1002",
      incubationYear: 2024,
      status: "Incubada",
      classification: "Skate",
      currentScore: 3.35,
      employees: 7,
      capital: "R$ 95.000",
      products: "Bioinsumos e sensores de cultivo.",
      notes: "Precisa evoluir planejamento financeiro.",
      customFields: {
        stage: "Validação comercial",
        city: "Macaé",
        marketFocus: "B2B"
      }
    },
    {
      id: "emp-003",
      name: "UrbanFlow Mobility",
      corporateName: "UrbanFlow Mobility Tecnologia LTDA",
      cnpj: "32.345.678/0001-30",
      sector: "Mobilidade / IoT",
      representative: "Carla Menezes",
      email: "contato@urbanflowmobility.com",
      phone: "(11) 99999-1003",
      incubationYear: 2025,
      status: "Incubada",
      classification: "Skate",
      currentScore: 2.62,
      employees: 5,
      capital: "R$ 60.000",
      products: "Sensores e analytics para mobilidade urbana.",
      notes: "Time técnico forte, área comercial fraca.",
      customFields: {
        stage: "MVP validado",
        city: "Rio de Janeiro",
        marketFocus: "GovTech"
      }
    },
    {
      id: "emp-004",
      name: "MedVault Health",
      corporateName: "MedVault Health Inovação LTDA",
      cnpj: "42.345.678/0001-40",
      sector: "HealthTech",
      representative: "Rafael Costa",
      email: "contato@medvaulthealth.com",
      phone: "(21) 99999-1004",
      incubationYear: 2022,
      status: "Incubada",
      classification: "Skate",
      currentScore: 4.52,
      employees: 12,
      capital: "R$ 250.000",
      products: "Solução de prontuário e compliance clínico.",
      notes: "",
      customFields: {
        stage: "Escala",
        city: "Niterói",
        marketFocus: "B2B"
      }
    },
    {
      id: "emp-005",
      name: "EduSpark Learning",
      corporateName: "EduSpark Learning Educação Digital LTDA",
      cnpj: "52.345.678/0001-50",
      sector: "EdTech",
      representative: "Bianca Freitas",
      email: "contato@edusparklearning.com",
      phone: "(27) 99999-1005",
      incubationYear: 2024,
      status: "Incubada",
      classification: "Skate",
      currentScore: 3.35,
      employees: 6,
      capital: "R$ 110.000",
      products: "Plataforma gamificada de aprendizagem.",
      notes: "Mercado promissor, mas gestão ainda imatura.",
      customFields: {
        stage: "Tração",
        city: "Vitória",
        marketFocus: "B2B2C"
      }
    },
    {
      id: "emp-006",
      name: "CloudForge DevOps",
      corporateName: "CloudForge DevOps Sistemas LTDA",
      cnpj: "62.345.678/0001-60",
      sector: "DevTools",
      representative: "Gustavo Leal",
      email: "contato@cloudforgedevops.com",
      phone: "(31) 99999-1006",
      incubationYear: 2025,
      status: "Crítica",
      classification: "Skate",
      currentScore: 1.87,
      employees: 4,
      capital: "R$ 40.000",
      products: "Ferramentas de automação de esteiras CI/CD.",
      notes: "Necessita intervenção em mercado e gestão.",
      customFields: {
        stage: "MVP",
        city: "Belo Horizonte",
        marketFocus: "B2B"
      }
    },
    {
      id: "emp-007",
      name: "AquaPure Systems",
      corporateName: "AquaPure Systems Soluções Ambientais LTDA",
      cnpj: "72.345.678/0001-70",
      sector: "CleanTech",
      representative: "Vanessa Ribeiro",
      email: "contato@aquapuresystems.com",
      phone: "(41) 99999-1007",
      incubationYear: 2023,
      status: "Graduada",
      classification: "Skate",
      currentScore: 4.57,
      employees: 11,
      capital: "R$ 320.000",
      products: "Tratamento inteligente de água e monitoramento remoto.",
      notes: "Caso forte de sucesso da incubadora.",
      customFields: {
        stage: "Graduação",
        city: "Curitiba",
        marketFocus: "B2B"
      }
    },
    {
      id: "emp-008",
      name: "FinEdge Analytics",
      corporateName: "FinEdge Analytics Tecnologia Financeira LTDA",
      cnpj: "82.345.678/0001-80",
      sector: "FinTech",
      representative: "Leandro Pinto",
      email: "contato@finedgeanalytics.com",
      phone: "(61) 99999-1008",
      incubationYear: 2024,
      status: "Incubada",
      classification: "Skate",
      currentScore: 3.75,
      employees: 8,
      capital: "R$ 135.000",
      products: "Analytics financeiro para crédito e risco.",
      notes: "Pode melhorar prospecção e diversificação de clientes.",
      customFields: {
        stage: "Tração",
        city: "Brasília",
        marketFocus: "B2B"
      }
    }
  ],

  /*
    Configuração dos eixos, indicadores e perguntas.
    A estrutura já foi pensada para futura troca do cálculo simples por MCDA.
  */
  evaluationModel: {
    version: "v5-evaluation-period",
    scale: [0, 1, 2, 3, 4, 5],
    scaleLabels: {
      0: "Não atende",
      1: "Insuficiente",
      2: "Baixo",
      3: "Razoável",
      4: "Bom",
      5: "Excelente"
    },
    infoFields: [
      {
        name: "startupName",
        label: "Nome da startup",
        type: "text",
        readonly: true,
        required: true
      },
      {
        name: "municipality",
        label: "Município de origem",
        type: "text",
        placeholder: "Informe o município"
      },
      {
        name: "entryMethod",
        label: "Forma de ingresso no Programa de Incubação",
        type: "select",
        options: ["Dr. Empreendedor", "Startup Campos", "Manifestação espontânea", "Outro"]
      },
      {
        name: "entryMethodOther",
        label: "Outra forma de ingresso",
        type: "text",
        placeholder: "Preencha quando selecionar Outro"
      },
      {
        name: "evaluatorName",
        label: "Avaliador",
        type: "text",
        required: true
      },
      {
        name: "evaluatorEmail",
        label: "E-mail do avaliador",
        type: "email"
      },
      {
        name: "representativeName",
        label: "Responsável pela startup",
        type: "text",
        required: true
      },
      {
        name: "representativeEmail",
        label: "E-mail do responsável",
        type: "email"
      },
      {
        name: "representativeCpf",
        label: "CPF do responsável",
        type: "text",
        placeholder: "000.000.000-00"
      },
      {
        name: "year",
        label: "Ano do monitoramento",
        type: "number",
        required: true
      },
      {
        name: "semester",
        label: "Semestre do monitoramento",
        type: "select",
        required: true,
        options: ["1", "2"]
      }
    ],
    customFieldSchema: [
      {
        key: "stage",
        label: "Estágio",
        type: "text",
        placeholder: "Ex.: MVP, Tração, Escala"
      },
      {
        key: "city",
        label: "Cidade",
        type: "text",
        placeholder: "Cidade principal de operação"
      },
      {
        key: "entryMethod",
        label: "Forma de ingresso",
        type: "text",
        placeholder: "Ex.: Startup Campos, manifestação espontânea"
      },
      {
        key: "marketFocus",
        label: "Foco de mercado",
        type: "text",
        placeholder: "Ex.: B2B, B2C, GovTech"
      }
    ],
    axes: [
      {
        id: "axis-entrepreneur",
        name: "Empreendedor",
        description: "Perfil, dedicação e capacidade de liderança do time empreendedor.",
        indicators: [
          { id: "ind-communication", name: "Comunicação e liderança" },
          { id: "ind-dedication", name: "Dedicação do time" },
          { id: "ind-partner-relations", name: "Relação entre sócios" }
        ],
        questions: [
          {
            id: "q-ent-1",
            text: "Qual o número total de pessoas na equipe?",
            helper: "Use este dado como apoio para entender composição e maturidade operacional.",
            answerType: "number",
            indicatorsLinked: ["ind-dedication"]
          },
          {
            id: "q-ent-2",
            text: "Qual a titulação e experiência das pessoas da equipe?",
            helper: "Descreva formação, experiência prévia e complementaridade do time.",
            answerType: "textarea",
            indicatorsLinked: ["ind-communication", "ind-partner-relations"]
          },
          {
            id: "q-ent-3",
            text: "A equipe possui toda a mão de obra necessária?",
            helper: "Avalie se existem lacunas críticas de competência para o negócio.",
            answerType: "radio",
            options: ["Integral", "Parcial", "Não"],
            indicatorsLinked: ["ind-dedication"]
          },
          {
            id: "q-ent-4",
            text: "Como você avalia a relação e o alinhamento entre os sócios?",
            helper: "Pergunta interpretativa. O avaliador deverá justificar a nota do indicador correspondente.",
            answerType: "textarea",
            indicatorsLinked: ["ind-partner-relations"]
          }
        ]
      },
      {
        id: "axis-management",
        name: "Gestão",
        description: "Práticas de organização, acompanhamento e direcionamento estratégico.",
        indicators: [
          { id: "ind-mission", name: "Missão, visão e valores" },
          { id: "ind-strategy", name: "Planejamento estratégico" },
          { id: "ind-activity-tracking", name: "Acompanhamento de atividades" }
        ],
        questions: [
          {
            id: "q-ges-1",
            text: "A empresa possui missão, visão e valores definidos e conhecidos pela equipe?",
            helper: "Registre a resposta e depois atribua a nota do indicador.",
            answerType: "radio",
            options: ["Sim", "Parcialmente", "Não"],
            indicatorsLinked: ["ind-mission"]
          },
          {
            id: "q-ges-2",
            text: "Existe planejamento estratégico com metas, prazos e responsáveis?",
            helper: "Descreva como a empresa organiza seu direcionamento estratégico.",
            answerType: "textarea",
            indicatorsLinked: ["ind-strategy"]
          },
          {
            id: "q-ges-3",
            text: "Como a empresa acompanha suas atividades e entregas?",
            helper: "Ex.: planilhas, ferramentas, reuniões, ritos de acompanhamento.",
            answerType: "textarea",
            indicatorsLinked: ["ind-activity-tracking"]
          }
        ]
      },
      {
        id: "axis-capital",
        name: "Capital",
        description: "Controle financeiro, planejamento e sustentabilidade econômica.",
        indicators: [
          { id: "ind-fin-control", name: "Controle financeiro" },
          { id: "ind-fin-planning", name: "Planejamento financeiro" },
          { id: "ind-revenue", name: "Receita e sustentabilidade" }
        ],
        questions: [
          {
            id: "q-cap-1",
            text: "A empresa realiza controle sistemático de entradas e saídas?",
            helper: "Verifique se há rotina real de acompanhamento financeiro.",
            answerType: "radio",
            options: ["Sim", "Parcialmente", "Não"],
            indicatorsLinked: ["ind-fin-control"]
          },
          {
            id: "q-cap-2",
            text: "Existe planejamento financeiro para os próximos meses?",
            helper: "Pergunta interpretativa. O avaliador pode registrar evidências no campo de observação.",
            answerType: "textarea",
            indicatorsLinked: ["ind-fin-planning"]
          },
          {
            id: "q-cap-3",
            text: "Qual a percepção atual sobre a sustentabilidade da receita da empresa?",
            helper: "Registre a resposta da empresa e então avalie a maturidade do indicador.",
            answerType: "textarea",
            indicatorsLinked: ["ind-revenue"]
          }
        ]
      },
      {
        id: "axis-technology",
        name: "Tecnologia",
        description: "Maturidade do produto, processo de melhoria e qualidade tecnológica.",
        indicators: [
          { id: "ind-product-improvement", name: "Processo de melhoria do produto" },
          { id: "ind-product-quality", name: "Qualidade do produto" }
        ],
        questions: [
          {
            id: "q-tec-1",
            text: "A empresa possui rotina de melhoria contínua do produto ou serviço?",
            helper: "Considere coleta de feedback, backlog, releases e priorização.",
            answerType: "textarea",
            indicatorsLinked: ["ind-product-improvement"]
          },
          {
            id: "q-tec-2",
            text: "Como a empresa garante a qualidade do produto entregue?",
            helper: "Descreva testes, validação, monitoramento de falhas e padrões adotados.",
            answerType: "textarea",
            indicatorsLinked: ["ind-product-quality"]
          }
        ]
      },
      {
        id: "axis-market",
        name: "Mercado",
        description: "Desenvolvimento comercial, relacionamento com clientes e posicionamento.",
        indicators: [
          { id: "ind-prospecting", name: "Prospecção de clientes" },
          { id: "ind-client-relations", name: "Relacionamento com clientes" },
          { id: "ind-pricing", name: "Política de preços" }
        ],
        questions: [
          {
            id: "q-mar-1",
            text: "Como a empresa realiza prospecção de novos clientes?",
            helper: "Registre processos, canais e frequência de prospecção.",
            answerType: "textarea",
            indicatorsLinked: ["ind-prospecting"]
          },
          {
            id: "q-mar-2",
            text: "Existe rotina estruturada de relacionamento com clientes?",
            helper: "Considere pós-venda, feedbacks, acompanhamento e retenção.",
            answerType: "textarea",
            indicatorsLinked: ["ind-client-relations"]
          },
          {
            id: "q-mar-3",
            text: "A política de preços da empresa é clara e baseada em critérios consistentes?",
            helper: "Pergunta interpretativa. O avaliador deverá atribuir a nota do indicador.",
            answerType: "textarea",
            indicatorsLinked: ["ind-pricing"]
          }
        ]
      }
    ]
  },

  /*
    Consultorias iniciais para mostrar o fluxo funcionando.
  */
  consultancies: [
    {
      id: "con-001",
      companyId: "emp-001",
      date: "2026-03-18",
      status: "Realizada",
      topic: "Estratégia comercial para SaaS B2B",
      consultant: "Patrícia Gomes",
      notes: "Definido plano de abordagem para contas enterprise.",
      actionPlan: "Estruturar funil com 3 etapas e metas quinzenais."
    },
    {
      id: "con-002",
      companyId: "emp-006",
      date: "2026-03-25",
      status: "Agendada",
      topic: "Revisão de modelo de negócio e foco de mercado",
      consultant: "Carlos Henriques",
      notes: "Sessão ainda não realizada.",
      actionPlan: "Preparar análise de segmentos e proposta de valor."
    },
    {
      id: "con-003",
      companyId: "emp-003",
      date: "2026-03-12",
      status: "Não compareceu",
      topic: "Plano de tração comercial",
      consultant: "Fernanda Lopes",
      notes: "Representante não participou da sessão.",
      actionPlan: "Reagendar com foco em prospecção e validação de ICP."
    }
  ],

    /*
    Catálogo de seções reutilizáveis de relatório.
    A ideia é não deixar a montagem dos relatórios hardcoded.
    Assim, se amanhã surgir uma nova característica, como balancete,
    basta criar uma nova seção e vinculá-la aos templates desejados.
  */
  reportSections: {
    company_identity: {
      label: "Identificação da empresa"
    },
    company_overview: {
      label: "Visão geral da empresa"
    },
    consultancy_history: {
      label: "Histórico de consultorias"
    },
    cerne_summary: {
      label: "Resumo CERNE"
    },
    financial_summary: {
      label: "Resumo financeiro"
    },
    evaluation_history: {
      label: "Histórico de avaliações"
    },
    evaluation_detail: {
      label: "Detalhamento da avaliação"
    }
  },

  /*
  Templates de relatórios.
  Cada tipo de relatório declara quais seções devem entrar.
  Isso deixa a arquitetura extensível e fácil de manter.
  */
  reportTemplates: {
    complete: {
      label: "Relatório Completo",
      sections: [
        "company_identity",
        "company_overview",
        "consultancy_history",
        "cerne_summary",
        "financial_summary",
        "evaluation_history"
      ]
    },
    performance: {
      label: "Relatório de Desempenho",
      sections: [
        "company_identity",
        "cerne_summary",
        "evaluation_history"
      ]
    },
    financial: {
      label: "Relatório Financeiro",
      sections: [
        "company_identity",
        "financial_summary"
      ]
    },
    evaluation: {
      label: "Relatório de Avaliação",
      sections: [
        "company_identity",
        "evaluation_detail"
      ]
    }
  },

  /*
    Histórico inicial de avaliações salvas.
    O sistema continuará adicionando novos registros em memória e no localStorage.
  */
    /*
    Histórico inicial de avaliações salvas.
    Agora enriquecido para sustentar relatórios completos e relatórios de avaliação específicos.
  */
  savedEvaluations: [
    {
      id: "eval-001",
      companyId: "emp-004",
      companyName: "MedVault Health",
      evaluator: "Analista Demo",
      evaluatorEmail: "analista@incubadora.com",
      date: "2025-03-20",
      year: 2025,
      axisScores: {
        Empreendedor: 4.5,
        Gestão: 4.0,
        Capital: 4.0,
        Tecnologia: 5.0,
        Mercado: 4.0
      },
      overallScore: 4.3,
      classification: "Apta a Graduar",
      notes: "Empresa com forte maturidade tecnológica e boa organização interna.",
      details: {
        axes: {
          "axis-entrepreneur": {
            answers: {
              "q-ent-1": "12",
              "q-ent-2": "Equipe com sócios experientes em saúde digital, tecnologia e gestão regulatória.",
              "q-ent-3": "Integral",
              "q-ent-4": "Os sócios demonstram alinhamento estratégico e boa divisão de responsabilidades."
            },
            indicatorRatings: {
              "ind-communication": {
                score: 4,
                justification: "Boa clareza de liderança e comunicação entre os responsáveis."
              },
              "ind-dedication": {
                score: 5,
                justification: "Equipe comprometida com dedicação integral ao negócio."
              },
              "ind-partner-relations": {
                score: 4,
                justification: "Boa harmonia societária, sem sinais relevantes de conflito."
              }
            }
          },
          "axis-management": {
            answers: {
              "q-ges-1": "Sim",
              "q-ges-2": "Possui metas, planejamento trimestral e responsáveis por área.",
              "q-ges-3": "Acompanha atividades por reuniões quinzenais e plataforma digital."
            },
            indicatorRatings: {
              "ind-mission": {
                score: 4,
                justification: "Missão, visão e valores estão formalizados e disseminados."
              },
              "ind-strategy": {
                score: 4,
                justification: "Planejamento consistente, embora ainda possa evoluir em métricas."
              },
              "ind-activity-tracking": {
                score: 4,
                justification: "Existe rotina de acompanhamento com disciplina gerencial."
              }
            }
          },
          "axis-capital": {
            answers: {
              "q-cap-1": "Sim",
              "q-cap-2": "Existe planejamento financeiro semestral com projeção de despesas e receitas.",
              "q-cap-3": "Empresa apresenta receita estável e boa perspectiva de sustentabilidade."
            },
            indicatorRatings: {
              "ind-fin-control": {
                score: 4,
                justification: "Controle financeiro estruturado e rotineiro."
              },
              "ind-fin-planning": {
                score: 4,
                justification: "Planejamento adequado, com possibilidade de maior refinamento."
              },
              "ind-revenue": {
                score: 4,
                justification: "Boa sustentabilidade de receita para o estágio atual."
              }
            }
          },
          "axis-technology": {
            answers: {
              "q-tec-1": "Existe backlog estruturado, coleta de feedback e ciclos de melhoria contínua.",
              "q-tec-2": "A empresa utiliza testes, validação funcional e monitoramento de falhas."
            },
            indicatorRatings: {
              "ind-product-improvement": {
                score: 5,
                justification: "Processo de melhoria tecnológica muito bem estruturado."
              },
              "ind-product-quality": {
                score: 5,
                justification: "Qualidade percebida alta e rotina de validação consolidada."
              }
            }
          },
          "axis-market": {
            answers: {
              "q-mar-1": "A empresa utiliza networking, inbound e relacionamento com parceiros do setor.",
              "q-mar-2": "Possui rotina de acompanhamento dos clientes estratégicos.",
              "q-mar-3": "Precificação baseada em valor e benchmarking setorial."
            },
            indicatorRatings: {
              "ind-prospecting": {
                score: 4,
                justification: "Processo comercial consistente, mas ainda com espaço para escala."
              },
              "ind-client-relations": {
                score: 4,
                justification: "Boa relação com clientes e acompanhamento recorrente."
              },
              "ind-pricing": {
                score: 4,
                justification: "Política de preços coerente e razoavelmente bem justificada."
              }
            }
          }
        }
      }
    },
    {
      id: "eval-002",
      companyId: "emp-001",
      companyName: "NovaTech Solutions",
      evaluator: "Victor Analista",
      evaluatorEmail: "victor@incubadora.com",
      date: "2026-02-14",
      year: 2026,
      axisScores: {
        Empreendedor: 4.0,
        Gestão: 4.0,
        Capital: 4.0,
        Tecnologia: 5.0,
        Mercado: 4.0
      },
      overallScore: 4.2,
      classification: "Apta a Graduar",
      notes: "Empresa madura comercialmente e com forte capacidade tecnológica.",
      details: {
        axes: {
          "axis-entrepreneur": {
            answers: {
              "q-ent-1": "9",
              "q-ent-2": "Equipe com boa formação técnica em software, dados e operações.",
              "q-ent-3": "Integral",
              "q-ent-4": "Os sócios possuem alinhamento e boa complementaridade."
            },
            indicatorRatings: {
              "ind-communication": {
                score: 4,
                justification: "Boa articulação entre liderança técnica e comercial."
              },
              "ind-dedication": {
                score: 4,
                justification: "Equipe comprometida e com boa disponibilidade."
              },
              "ind-partner-relations": {
                score: 4,
                justification: "Relação societária estável."
              }
            }
          },
          "axis-management": {
            answers: {
              "q-ges-1": "Sim",
              "q-ges-2": "Planejamento com metas trimestrais e rotina de acompanhamento.",
              "q-ges-3": "Utiliza software de gestão interna e reuniões semanais."
            },
            indicatorRatings: {
              "ind-mission": {
                score: 4,
                justification: "Direcionamento institucional claro."
              },
              "ind-strategy": {
                score: 4,
                justification: "Estratégia bem definida e acompanhada."
              },
              "ind-activity-tracking": {
                score: 4,
                justification: "Acompanhamento consistente de tarefas e metas."
              }
            }
          },
          "axis-capital": {
            answers: {
              "q-cap-1": "Sim",
              "q-cap-2": "Planejamento financeiro mensal com revisões de projeção.",
              "q-cap-3": "Receita crescente e maior previsibilidade de caixa."
            },
            indicatorRatings: {
              "ind-fin-control": {
                score: 4,
                justification: "Controle financeiro adequado ao estágio."
              },
              "ind-fin-planning": {
                score: 4,
                justification: "Planejamento bem executado."
              },
              "ind-revenue": {
                score: 4,
                justification: "Receita saudável e recorrente."
              }
            }
          },
          "axis-technology": {
            answers: {
              "q-tec-1": "Possui rotina forte de melhoria contínua orientada por feedback.",
              "q-tec-2": "A empresa mantém rotina de testes e monitoramento de estabilidade."
            },
            indicatorRatings: {
              "ind-product-improvement": {
                score: 5,
                justification: "Produto evolui com velocidade e disciplina."
              },
              "ind-product-quality": {
                score: 5,
                justification: "Qualidade técnica elevada."
              }
            }
          },
          "axis-market": {
            answers: {
              "q-mar-1": "Faz prospecção ativa e trabalha com indicação e eventos.",
              "q-mar-2": "Relacionamento próximo com contas estratégicas.",
              "q-mar-3": "Precificação baseada em valor percebido e planos por segmento."
            },
            indicatorRatings: {
              "ind-prospecting": {
                score: 4,
                justification: "Boa prospecção, embora ainda com potencial de escala."
              },
              "ind-client-relations": {
                score: 4,
                justification: "Relacionamento forte e estruturado."
              },
              "ind-pricing": {
                score: 4,
                justification: "Modelo de preços consistente."
              }
            }
          }
        }
      }
    }
  ],
  notifications: []
};

window.STARTUP_PULSE_SAMPLE_DATA.legacyEvaluationAxes =
  window.STARTUP_PULSE_SAMPLE_DATA.evaluationModel.axes;

window.STARTUP_PULSE_SAMPLE_DATA.evaluationModel.axes = [
  {
    id: "axis-entrepreneur",
    name: "Empreendedor",
    description: "Equipe, capacitação, P&D, treinamento e planejamento do eixo empreendedor.",
    indicators: [{ id: "ind-axis-entrepreneur", name: "Nota do Eixo Empreendedor" }],
    questions: [
      { id: "q-ent-1", text: "Qual o número total de pessoas na equipe?", answerType: "number", indicatorsLinked: [] },
      {
        id: "q-ent-2",
        text: "Qual a titulação das pessoas da equipe?",
        helper: "Ensino médio, técnico, graduados, mestres, doutores.",
        answerType: "textarea",
        indicatorsLinked: []
      },
      {
        id: "q-ent-3",
        text: "A equipe possui toda a mão de obra necessária para desenvolver o negócio?",
        answerType: "toggle",
        options: ["Integral", "Parcial", "Não"],
        indicatorsLinked: []
      },
      {
        id: "q-ent-4",
        text: "A startup realizou investimentos em P&D ou treinamento da equipe?",
        answerType: "toggle",
        options: ["Sim", "Não"],
        indicatorsLinked: []
      },
      { id: "q-ent-5", text: "Quais foram os treinamentos realizados?", answerType: "textarea", indicatorsLinked: [] },
      {
        id: "q-ent-6",
        text: "Houve recurso investido em P&D ou treinamento da equipe?",
        helper: "Escreva o valor sem o R$. Caso a resposta anterior seja negativa, coloque este valor como 0.",
        answerType: "number",
        indicatorsLinked: []
      },
      {
        id: "q-ent-7",
        text: "Possui planejamento para o desenvolvimento do Eixo Empreendedor?",
        answerType: "toggle",
        options: ["Integral", "Parcial", "Não possui planejamento para desenvolver o Eixo Empreendedor"],
        indicatorsLinked: []
      },
      {
        id: "q-ent-score",
        text: "Avaliação do Eixo Empreendedor",
        helper: "Atribua a nota do eixo e registre a justificativa da avaliação.",
        answerType: "none",
        indicatorsLinked: ["ind-axis-entrepreneur"]
      }
    ]
  },
  {
    id: "axis-management",
    name: "Gestão",
    description: "Formalização, processos, exigências legais, notas fiscais, parcerias e investimentos.",
    indicators: [{ id: "ind-axis-management", name: "Nota do Eixo Gestão" }],
    questions: [
      { id: "q-ges-1", text: "Possui CNPJ e Razão Social?", answerType: "toggle", options: ["Sim", "Não"], indicatorsLinked: [] },
      {
        id: "q-ges-2",
        text: "CNPJ e Razão Social",
        helper: "Caso a resposta anterior seja positiva, informe os dados.",
        answerType: "textarea",
        indicatorsLinked: []
      },
      {
        id: "q-ges-3",
        text: "Os processos estão mapeados e controlados?",
        answerType: "toggle",
        options: ["Integral", "Parcial", "Não estão sendo mapeados e controlados"],
        indicatorsLinked: []
      },
      { id: "q-ges-4", text: "Possui exigências legais não sanadas?", answerType: "toggle", options: ["Sim", "Não"], indicatorsLinked: [] },
      { id: "q-ges-5", text: "Possui notas fiscais emitidas?", answerType: "toggle", options: ["Sim", "Não"], indicatorsLinked: [] },
      {
        id: "q-ges-6",
        text: "Quantidade de notas fiscais emitidas",
        helper: "Caso a resposta anterior seja negativa, coloque este valor como 0.",
        answerType: "number",
        indicatorsLinked: []
      },
      {
        id: "q-ges-7",
        text: "Possui parceria com instituições de pesquisa e fomento?",
        answerType: "toggle",
        options: ["Sim", "Não"],
        indicatorsLinked: []
      },
      {
        id: "q-ges-8",
        text: "Quais as parcerias com instituições de pesquisa e fomento realizadas?",
        answerType: "textarea",
        indicatorsLinked: []
      },
      {
        id: "q-ges-9",
        text: "Possui montante captado com instituições de fomento?",
        answerType: "toggle",
        options: ["Sim", "Não"],
        indicatorsLinked: []
      },
      {
        id: "q-ges-10",
        text: "Montante captado com instituições de fomento (R$)",
        helper: "Escreva o valor sem o R$. Caso a resposta anterior seja negativa, coloque este valor como 0.",
        answerType: "number",
        indicatorsLinked: []
      },
      { id: "q-ges-11", text: "Possui montante de investimento próprio?", answerType: "toggle", options: ["Sim", "Não"], indicatorsLinked: [] },
      {
        id: "q-ges-12",
        text: "Montante de investimento próprio (R$)",
        helper: "Escreva o valor sem o R$. Caso a resposta anterior seja negativa, coloque este valor como 0.",
        answerType: "number",
        indicatorsLinked: []
      },
      {
        id: "q-ges-13",
        text: "Possui montante de outras fontes (investidor anjo, capital de risco, bancos etc)?",
        answerType: "toggle",
        options: ["Sim", "Não"],
        indicatorsLinked: []
      },
      {
        id: "q-ges-14",
        text: "Montante de outras fontes (investidor anjo, capital de risco, bancos etc) (R$)",
        helper: "Escreva o valor sem o R$. Caso a resposta anterior seja negativa, coloque este valor como 0.",
        answerType: "number",
        indicatorsLinked: []
      },
      {
        id: "q-ges-15",
        text: "Possui planejamento para o desenvolvimento do Eixo Gestão?",
        answerType: "toggle",
        options: ["Integral", "Parcial", "Não possui planejamento para desenvolver o Eixo Gestão"],
        indicatorsLinked: []
      },
      {
        id: "q-ges-score",
        text: "Avaliação do Eixo Gestão",
        helper: "Atribua a nota do eixo e registre a justificativa da avaliação.",
        answerType: "none",
        indicatorsLinked: ["ind-axis-management"]
      }
    ]
  },
  {
    id: "axis-capital",
    name: "Capital",
    description: "Resultados financeiros, fluxo de caixa, sustentabilidade e planejamento de capital.",
    indicators: [{ id: "ind-axis-capital", name: "Nota do Eixo Capital" }],
    questions: [
      { id: "q-cap-1", text: "Já possui lucro?", answerType: "toggle", options: ["Sim", "Não"], indicatorsLinked: [] },
      {
        id: "q-cap-2",
        text: "Lucro (R$)",
        helper: "Escreva o valor sem o R$. Caso a empresa ainda não tenha obtido lucro, coloque este valor como 0.",
        answerType: "number",
        indicatorsLinked: []
      },
      { id: "q-cap-3", text: "Já possui faturamento?", answerType: "toggle", options: ["Sim", "Não"], indicatorsLinked: [] },
      {
        id: "q-cap-4",
        text: "Faturamento (R$)",
        helper: "Escreva o valor sem o R$. Caso a empresa ainda não tenha obtido faturamento, coloque este valor como 0.",
        answerType: "number",
        indicatorsLinked: []
      },
      { id: "q-cap-5", text: "Já atingiu o break even point?", answerType: "toggle", options: ["Sim", "Não"], indicatorsLinked: [] },
      {
        id: "q-cap-6",
        text: "Break even point (R$)",
        helper: "Escreva o valor sem o R$. Caso a empresa ainda não tenha atingido, coloque este valor como 0.",
        answerType: "number",
        indicatorsLinked: []
      },
      { id: "q-cap-7", text: "Já atingiu o payback?", answerType: "toggle", options: ["Sim", "Não"], indicatorsLinked: [] },
      {
        id: "q-cap-8",
        text: "Payback (R$)",
        helper: "Escreva o valor sem o R$. Caso a empresa ainda não tenha atingido, coloque este valor como 0.",
        answerType: "number",
        indicatorsLinked: []
      },
      { id: "q-cap-9", text: "Já possui rentabilidade do negócio?", answerType: "toggle", options: ["Sim", "Não"], indicatorsLinked: [] },
      {
        id: "q-cap-10",
        text: "Rentabilidade do negócio (R$)",
        helper: "Escreva o valor sem o R$. Caso a empresa ainda não tenha atingido, coloque este valor como 0.",
        answerType: "number",
        indicatorsLinked: []
      },
      { id: "q-cap-11", text: "Já possui lucratividade do negócio?", answerType: "toggle", options: ["Sim", "Não"], indicatorsLinked: [] },
      {
        id: "q-cap-12",
        text: "Lucratividade do negócio (R$)",
        helper: "Escreva o valor sem o R$. Caso a empresa ainda não tenha atingido, coloque este valor como 0.",
        answerType: "number",
        indicatorsLinked: []
      },
      { id: "q-cap-13", text: "Possui fluxo de caixa?", answerType: "toggle", options: ["Sim", "Não"], indicatorsLinked: [] },
      { id: "q-cap-14", text: "Disserte sobre a pergunta anterior", answerType: "textarea", indicatorsLinked: [] },
      { id: "q-cap-15", text: "Possui sustentabilidade financeira?", answerType: "toggle", options: ["Sim", "Parcial", "Não"], indicatorsLinked: [] },
      { id: "q-cap-16", text: "Disserte sobre a pergunta anterior", answerType: "textarea", indicatorsLinked: [] },
      {
        id: "q-cap-17",
        text: "Informe o valor dos impostos pagos atualmente (Municipal, Estadual e Federal)",
        answerType: "number",
        indicatorsLinked: []
      },
      {
        id: "q-cap-18",
        text: "Possui planejamento para o desenvolvimento do Eixo Capital?",
        answerType: "toggle",
        options: ["Integral", "Parcial", "Não possui planejamento para desenvolver o Eixo Capital"],
        indicatorsLinked: []
      },
      {
        id: "q-cap-score",
        text: "Avaliação do Eixo Capital",
        helper: "Atribua a nota do eixo e registre a justificativa da avaliação.",
        answerType: "none",
        indicatorsLinked: ["ind-axis-capital"]
      }
    ]
  },
  {
    id: "axis-technology",
    name: "Tecnologia",
    description: "Validação da tecnologia, propriedade intelectual, inovação e maturidade tecnológica.",
    indicators: [{ id: "ind-axis-technology", name: "Nota do Eixo Tecnologia" }],
    questions: [
      { id: "q-tec-1", text: "Fez a validação da tecnologia?", answerType: "toggle", options: ["Sim", "Não"], indicatorsLinked: [] },
      {
        id: "q-tec-2",
        text: "Se a resposta anterior foi positiva, nos fale como foi feita a validação",
        answerType: "textarea",
        indicatorsLinked: []
      },
      {
        id: "q-tec-3",
        text: "Possui algum ativo de Propriedade Intelectual solicitado e/ou concedido?",
        answerType: "toggle",
        options: ["Sim", "Não"],
        indicatorsLinked: []
      },
      {
        id: "q-tec-4",
        text: "Se a resposta anterior foi positiva, nos fale quantos",
        helper: "Caso a empresa ainda não possua, coloque este valor como 0.",
        answerType: "number",
        indicatorsLinked: []
      },
      {
        id: "q-tec-5",
        text: "Quais seriam esses ativos de Propriedade Intelectual solicitados e/ou concedidos?",
        answerType: "checkbox",
        options: [
          "Patente",
          "Marca",
          "Desenho Industrial",
          "Indicação Geográfica",
          "Programas de Computador",
          "Topografias de Circuitos",
          "Proteção Sui Generis",
          "Direito Autoral",
          "Segredo Industrial",
          "Outros"
        ],
        indicatorsLinked: []
      },
      {
        id: "q-tec-6",
        text: "Quais ativos de Propriedade Intelectual foram concedidos?",
        answerType: "textarea",
        indicatorsLinked: []
      },
      { id: "q-tec-7", text: "Possui recursos investidos em inovação?", answerType: "toggle", options: ["Sim", "Não"], indicatorsLinked: [] },
      {
        id: "q-tec-8",
        text: "Qual o valor investido em inovação?",
        helper: "Caso a empresa ainda não possua, coloque este valor como 0.",
        answerType: "number",
        indicatorsLinked: []
      },
      {
        id: "q-tec-9",
        text: "Em poucas palavras, defina a tecnologia e/ou inovação a ser inserida no mercado.",
        answerType: "textarea",
        indicatorsLinked: []
      },
      {
        id: "q-tec-10",
        text: "Qual o Nível de Maturidade Tecnológica da sua empresa?",
        answerType: "select",
        options: [
          "TRL/MRL 1: Ideia da pesquisa iniciada e primeiros indícios de viabilidade traduzidos em P&D futuros.",
          "TRL/MRL 2: Princípios básicos definidos e resultados com aplicações práticas apontando confirmação da ideia inicial.",
          "TRL/MRL 3: Estudos analíticos e/ou laboratoriais verificam se a tecnologia é viável para desenvolvimento.",
          "TRL/MRL 4: Prova de conceito aplicada em ambiente similar ao real, inclusive em escala de laboratório.",
          "TRL/MRL 5: Validação em ambiente relevante de componentes ou arranjos experimentais.",
          "TRL/MRL 6: Protótipo funcional ou modelo representacional demonstrado em ambiente operacional.",
          "TRL/MRL 7: Protótipo demonstrado e validado em ambiente operacional.",
          "TRL/MRL 8: Tecnologia testada e qualificada para ambiente real.",
          "TRL/MRL 9: Tecnologia comprovada em ambiente operacional e produção estabelecida.",
          "Não soube informar sobre a maturidade tecnológica"
        ],
        indicatorsLinked: []
      },
      {
        id: "q-tec-11",
        text: "Possui planejamento para o desenvolvimento do Eixo Tecnologia?",
        answerType: "toggle",
        options: ["Integral", "Parcial", "Não possui planejamento para o desenvolvimento do Eixo Tecnologia"],
        indicatorsLinked: []
      },
      {
        id: "q-tec-score",
        text: "Avaliação do Eixo Tecnologia",
        helper: "Atribua a nota do eixo e registre a justificativa da avaliação.",
        answerType: "none",
        indicatorsLinked: ["ind-axis-technology"]
      }
    ]
  },
  {
    id: "axis-market",
    name: "Mercado",
    description: "Portfólio, canais, clientes, vendas, preço, planejamento e maturidade da empresa.",
    indicators: [{ id: "ind-axis-market", name: "Nota do Eixo Mercado" }],
    questions: [
      {
        id: "q-mar-1",
        text: "Possui um portfólio de produtos e serviços oferecidos?",
        answerType: "toggle",
        options: ["Sim", "Não"],
        indicatorsLinked: []
      },
      { id: "q-mar-2", text: "Disserte sobre a pergunta anterior", answerType: "textarea", indicatorsLinked: [] },
      { id: "q-mar-3", text: "Quais canais de distribuição estão sendo usados nas vendas?", answerType: "textarea", indicatorsLinked: [] },
      {
        id: "q-mar-4",
        text: "Possui lista dos principais clientes mapeados?",
        answerType: "toggle",
        options: ["Sim", "Não"],
        indicatorsLinked: []
      },
      { id: "q-mar-5", text: "Disserte sobre a pergunta anterior", answerType: "textarea", indicatorsLinked: [] },
      { id: "q-mar-6", text: "Possuem vendas já realizadas?", answerType: "toggle", options: ["Sim", "Não"], indicatorsLinked: [] },
      {
        id: "q-mar-7",
        text: "Número de vendas já realizadas",
        helper: "Caso a empresa ainda não possua, coloque este valor como 0.",
        answerType: "number",
        indicatorsLinked: []
      },
      {
        id: "q-mar-8",
        text: "Qual o ticket médio?",
        helper: "Escreva o valor sem o R$. Caso a empresa ainda não possua, coloque este valor como 0.",
        answerType: "number",
        indicatorsLinked: []
      },
      { id: "q-mar-9", text: "Mercado atendido (share)?", answerType: "textarea", indicatorsLinked: [] },
      {
        id: "q-mar-10",
        text: "Como você classifica o preço praticado pela empresa em relação à concorrência?",
        answerType: "toggle",
        options: ["Acima da concorrência", "Abaixo da concorrência", "Similar ao preço da concorrência"],
        indicatorsLinked: []
      },
      {
        id: "q-mar-11",
        text: "Possui planejamento para o desenvolvimento do Eixo Mercado?",
        answerType: "toggle",
        options: ["Integral", "Parcial", "Não possui planejamento para o desenvolvimento do Eixo Mercado"],
        indicatorsLinked: []
      },
      {
        id: "q-mar-score",
        text: "Avaliação do Eixo Mercado",
        helper: "Atribua a nota do eixo e registre a justificativa da avaliação.",
        answerType: "none",
        indicatorsLinked: ["ind-axis-market"]
      },
      {
        id: "q-mar-12",
        text: "Informe o nível de maturidade da empresa",
        answerType: "select",
        options: [
          "Skate: Modelo de Negócios definido e/ou validado",
          "Bicicleta: Produto e/ou Serviço pronto",
          "Carro: Vendas realizadas com o Produto e/ou Serviço",
          "Avião: Vendas realizadas com o Produto e/ou Serviço e processos de gestão definidos",
          "Foguete: Com graduação ou sendo adequada para graduar"
        ],
        indicatorsLinked: []
      }
    ]
  }
];
