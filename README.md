# UXDriven — homepage institucional

Experiência web autoral da UXDriven: UX/UI, sites de alta conversão, engenharia de produtos digitais e integrações com IA. Projeto estático, sem etapa de build ou dependências obrigatórias, pronto para Vercel.

## Arquivos

- `index.html`: estrutura semântica, SEO, metadados e mockups conceituais.
- `style.css`: identidade, animações, composições e layouts responsivos.
- `script.js`: intro, cursor, partículas, navegação, tabs, comparador e gerador de briefing.
- `assets/logo.svg` e `assets/favicon.svg`: assinatura minimalista UXDriven.

## Publicar na Vercel

1. Em **Add New → Project**, importe `UXDriven/homepage`.
2. Selecione **Other** no framework preset, deixe **Root Directory** como `./`, sem build command.
3. Publique. A Vercel passa a atualizar automaticamente a cada push na branch principal, se a integração GitHub estiver habilitada para este repositório.

Para testar localmente, abra `index.html` no navegador ou execute `npx serve .` na pasta do projeto.

## Observações para produção

- Os três trabalhos em `Concept Studies` são **demonstrações**, não cases/clientes reais.
- O formulário de briefing prepara texto e permite cópia, mas **não transmite dados** a servidor ou email. Conectar o canal oficial da UXDriven (form endpoint, email corporativo ou WhatsApp Business) antes do lançamento comercial.
- As referências a provedores de IA indicam possibilidades técnicas de integração e não constituem parcerias oficiais.
- Não há métricas ou depoimentos fictícios. A comparação CRO/UX é uma simulação ilustrativa.
- Motion reduzido, navegação por teclado, estados de foco, menu mobile e abas acessíveis estão contemplados.
