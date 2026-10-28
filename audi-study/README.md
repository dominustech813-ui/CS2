# AUDI STUDY IA — Projeto do Theo

Cópia adaptada do projeto original `theoccosta2020-cell/audi-IA-1` para o repositório CS2, em `audi-study/index.html`, sem alterar a Copa CDL.

## Funcionalidades
- Preserva as aulas de Inglês, quizzes, acompanhamento e treino por voz existentes.
- Agenda avaliações e conteúdos de provas no navegador.
- Monta cronogramas básicos conforme as provas.
- Permite pedir simulados, resumos, revisões e explicações via chat.

## Integração com uma IA real
A interface tenta `/api/chat`. Como GitHub Pages é estático, é preciso hospedar o servidor de IA separadamente. O exemplo em `worker/audi-ai.js` funciona como **Cloudflare Worker**, após implantação e configuração.

1. Implante `worker/audi-ai.js` em um Worker seu.
2. Cadastre `OPENAI_API_KEY` como **secret** do Worker, nunca em arquivos do repositório ou HTML.
3. Configure `ALLOWED_ORIGIN` com a origem do site (exemplo: `https://dominustech813-ui.github.io`).
4. Na aba **IA** do site, em configuração, informe a URL completa do Worker (HTTPS) e salve.
5. Faça um teste real de envio e resposta. Uma chave válida do provedor poderá gerar cobrança por uso.

**Estado atual:** a interface e o planejador estão no GitHub. A IA generativa só estará operacional depois que houver Worker implantado, segredo configurado e teste de ponta a ponta. Para uso público, acrescente autenticação e limites de uso para evitar abuso e custos inesperados.

Dados das provas e conversas são armazenados localmente no navegador. Não envie informações sensíveis de crianças para serviços externos sem revisar consentimento e privacidade.
