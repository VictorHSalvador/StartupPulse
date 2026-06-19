# StartupPulse - MVP Front-end

Projeto front-end funcional em **Bootstrap + jQuery** para monitoramento de empresas incubadas.

## O que este MVP faz
- Dashboard da incubadora
- Cadastro e edição de empresas
- Avaliação por eixos do CERNE
- Registro de consultorias
- Exportação para JSON e Excel
- Importação de JSON e Excel
- Estrutura preparada para futura evolução para MCDA / ELECTRE-TRI

## Como executar
Como o projeto usa arquivos JS locais, o ideal é abrir com um servidor HTTP simples.

### Opção 1 - Python
```bash
python -m http.server 8000
```
Depois abra:
```text
http://localhost:8000
```

### Opção 2 - VS Code
Use a extensão **Live Server**.

## Estrutura
- `index.html`: interface principal
- `assets/css/style.css`: estilos do projeto
- `assets/js/data-service.js`: leitura, escrita, persistência e importação/exportação
- `assets/js/calculation-service.js`: regras provisórias de cálculo
- `assets/js/ui-service.js`: render helpers e feedback visual
- `assets/js/app.js`: fluxo principal da aplicação
- `assets/data/sample-data.js`: dados iniciais de demonstração

