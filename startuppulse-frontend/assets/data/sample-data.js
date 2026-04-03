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
      incubationYear: 3,
      status: "Incubada",
      classification: "Satisfatória",
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
      incubationYear: 2,
      status: "Incubada",
      classification: "Satisfatória",
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
      incubationYear: 1,
      status: "Incubada",
      classification: "Satisfatória",
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
      incubationYear: 4,
      status: "Incubada",
      classification: "Satisfatória",
      currentScore: 4.52,
      employees: 12,
      capital: "R$ 250.000",
      products: "Solução de prontuário e compliance clínico.",
      notes: "Empresa próxima de graduação.",
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
      incubationYear: 2,
      status: "Incubada",
      classification: "Satisfatória",
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
      incubationYear: 1,
      status: "Crítica",
      classification: "Inapta",
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
      incubationYear: 3,
      status: "Graduada",
      classification: "Apta a Graduar",
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
      incubationYear: 2,
      status: "Incubada",
      classification: "Satisfatória",
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
    version: "v1-mvp",
    scale: [1, 2, 3, 4, 5],
    scaleLabels: {
      1: "Insuficiente",
      2: "Baixo",
      3: "Razoável",
      4: "Bom",
      5: "Excelente"
    },
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
    Histórico inicial de avaliações salvas.
    O sistema continuará adicionando novos registros em memória e no localStorage.
  */
  savedEvaluations: [
    {
      id: "eval-001",
      companyId: "emp-004",
      companyName: "MedVault Health",
      evaluator: "Analista Demo",
      date: "2026-03-20",
      axisScores: {
        Empreendedor: 4.5,
        Gestão: 4.0,
        Capital: 4.0,
        Tecnologia: 5.0,
        Mercado: 4.0
      },
      overallScore: 4.3,
      classification: "Apta a Graduar"
    }
  ]
};
