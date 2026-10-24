# raizesquecuram-site

Site do projeto **Raízes que Curam** — [raizesquecuram.com](https://raizesquecuram.com).

HTML/CSS/JS estático servido por `nginx:alpine`. Imagem publicada em `ghcr.io/ibiete/raizesquecuram-site` a cada push em `main`.

## Estrutura
- `index.html` — home (12 blocos do "Escopo completo da Home", out/2026)
- `privacidade.html` — política de privacidade (texto-base)
- `css/site.css`, `js/site.js` — estilo e interações (menu, carrossel, formulário)
- `assets/` — WebP gerados por `npm run assets`

## Assets
`npm run assets` regera `assets/*.webp` a partir da pasta do Drive da home
(blocos com "imagem completa", protótipo HTML/CSS e "imagens do bloco"),
baixada em `~/raizesquecuram/design-source`, e das fotos ampliadas no Magnific
em `~/raizesquecuram/upscaled` (originais fora do git). Caminhos alteráveis por
`RQC_SRC` / `RQC_UP`.

## Formulário
Todos os CTAs abrem o mesmo diálogo com o interesse pré-selecionado e enviam para
`https://painel.raizesquecuram.com/api/forms/raizesquecuram-site-interesse/submit`
(NAIIAN ONE › Formulários, tenant `raizesquecuram`). Campos lidos pelo CRM:
`name`, `email`, `phone`, `message`; o resto entra na submissão/e-mail.

A landing anterior está na tag `v0-landing`.
