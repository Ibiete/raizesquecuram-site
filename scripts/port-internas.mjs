// Porta o miolo das páginas internas do pacote do Drive ("Todas as páginas",
// pasta 1mgb_d_2aCA04KQZWfaHXA3FJOhs99HAI) para o site:
//  - css/internas.css: styles.css + internas.css do pacote, com todo seletor
//    isolado sob .rq-int (não vaza para o topo/rodapé/formulário globais);
//  - src/pages/<pagina>.html: <main> de cada página com nosso topo/rodapé;
//  - assets/int2/: só os arquivos referenciados.
// Rodar de novo sobrescreve esses arquivos (ajustes finos ficam em
// css/internas-ajustes.css e no próprio script).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';

const PKG = process.env.RQC_PKG || path.join(os.homedir(), 'raizesquecuram/design-source-todas/Raizes_que_Curam_Todas_as_Paginas_Completas/todas-internas');
const ROOT = path.resolve('.');
const PAGES = {
  'aprender': 'Aprender — oficina Farmácia Viva',
  'rede-de-agentes': 'Rede de Agentes',
  'multiplicar': 'Multiplicar — formação de multiplicadores',
  'festival': 'Festival online de saberes',
  'faca-parte': 'Faça Parte',
};
const DESCRIPTIONS = {};

// ───────── CSS
function splitRules(css) {
  const out = []; let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i); if (open < 0) break;
    const prelude = css.slice(i, open).trim();
    let depth = 1, j = open + 1;
    while (depth && j < css.length) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; j++; }
    out.push({ prelude, body: css.slice(open + 1, j - 1) });
    i = j;
  }
  return out;
}
const DROP = /(^|[\s,>+~])\.rq-(header|nav|menu|logo|footer|skip)\b|^@font-face/;
function scopeSelector(sel) {
  sel = sel.trim();
  if (sel === ':root') return ':root';
  if (/^(html|body)$/.test(sel)) return '.rq-int';
  sel = sel.replace(/^body\.rq-newpage\b/, '').replace(/\.rq-newpage\s*/g, '').trim();
  if (!sel) return '.rq-int';
  if (sel === '*') return '.rq-int, .rq-int *';
  return `.rq-int ${sel}`;
}
function scopeCss(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return splitRules(css).map(({ prelude, body }) => {
    if (prelude.startsWith('@media') || prelude.startsWith('@supports')) {
      const inner = scopeCss(body); return inner.trim() ? `${prelude}{${inner}}` : '';
    }
    if (prelude.startsWith('@')) return DROP.test(prelude) ? '' : `${prelude}{${body}}`;
    const sels = prelude.split(/,(?![^(]*\))/).filter((s) => !DROP.test(s.trim()));
    if (!sels.length) return '';
    // html{scroll-*} / body{...}: só o que faz sentido no <main>
    if (/^(html|body)$/.test(prelude.trim()) && /scroll/.test(body)) return '';
    return `${[...new Set(sels.map(scopeSelector))].join(',')}{${body}}`;
  }).join('\n');
}
let css = scopeCss(fs.readFileSync(path.join(PKG, 'styles.css'), 'utf8') + '\n' + fs.readFileSync(path.join(PKG, 'internas.css'), 'utf8'));
css = css.replace(/url\((['"]?)assets\//g, 'url($1/assets/int2/');
fs.writeFileSync(path.join(ROOT, 'css/internas.css'), `/* Gerado por scripts/port-internas.mjs — não editar (ajustes em css/internas-ajustes.css) */\n${css}\n`);

// ───────── páginas
const usedAssets = new Set();
const FORM_LABEL = {
  oficina: 'Oficina Farmácia Viva — interesse', multiplicador: 'Multiplicadores — pré-cadastro',
  'festival-participante': 'Festival — quero participar', 'festival-proposta': 'Festival — proposta de atividade',
  participacao: 'Faça Parte — cadastro', parcerias: 'Parceria e apoio',
};
const CONSENT = (id) => `<label class="rq-check rq-consent"><input type="checkbox" name="consentimento" required /> <span>Concordo que o Raízes que Curam guarde estes dados para entrar em contato comigo sobre esta iniciativa, conforme a <a href="/privacidade.html" target="_blank" rel="noopener">política de privacidade</a>. *</span></label>`;

for (const [page, title] of Object.entries(PAGES)) {
  const src = fs.readFileSync(path.join(PKG, `${page}.html`), 'utf8');
  let main = src.slice(src.indexOf('<main'), src.indexOf('</main>') + '</main>'.length);
  const desc = (src.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  main = main.replace('<main id="conteudo">', `<main id="conteudo" class="rq-int" data-page="${page}">`);

  // links entre páginas → URLs limpas do site
  main = main.replace(/href="(raizes-que-curam|rede-de-agentes|aprender|multiplicar|festival|faca-parte)\.html([^"]*)"/g, (m, p, rest) => `href="/${p}/${rest}"`);
  main = main.replace(/href="index\.html"/g, 'href="/"');
  // assets
  main = main.replace(/(src|href|srcset)="([^"]+)"/g, (m, attr, val) => {
    if (!val.includes('assets/')) return m;
    const fixed = val.replace(/(^|\s|,)assets\//g, (mm, pre) => `${pre}/assets/int2/`);
    for (const f of fixed.matchAll(/\/assets\/int2\/([^\s,"]+)/g)) usedAssets.add(f[1]);
    return `${attr}="${fixed}"`;
  });

  // formulários: envio real (sem rascunho local)
  main = main.replace(/<form class="rq-form" data-draft="([^"]+)">/g, (m, kind) => `<form class="rq-form" data-form-kind="${kind}" data-form-label="${FORM_LABEL[kind] || kind}" novalidate>`);
  main = main.replace(/<p[^>]*>\s*Prévia de cadastro · nesta versão, nenhum dado é enviado\. Prepare ou exporte um rascunho\.\s*<\/p>/g, '');
  main = main.replace(/<label[^>]*>\s*<input[^>]*name="lembrar"[^>]*>[\s\S]*?<\/label>/g, '');
  // "desejo receber informações quando o cadastro oficial estiver disponível" (texto da prévia) → coberto pelo consentimento
  main = main.replace(/<label class="rq-check"><input type="checkbox" name="contato" required>[\s\S]*?<\/label>/g, '');
  main = main.replace(/<button[^>]*data-download[^>]*>[\s\S]*?<\/button>/g, '');
  main = main.replace(/<div[^>]*>\s*<button[^>]*data-restore[^>]*>[\s\S]*?<\/button>\s*<button[^>]*data-clear[^>]*>[\s\S]*?<\/button>\s*<\/div>/g, '');
  main = main.replace(/<button[^>]*data-restore[^>]*>[\s\S]*?<\/button>/g, '').replace(/<button[^>]*data-clear[^>]*>[\s\S]*?<\/button>/g, '');
  main = main.replace(/Preparar (meu interesse|minha pré-inscrição|minha proposta|meu cadastro|proposta de parceria)/g, (m, what) => `Enviar ${what}`);
  // consentimento antes do botão de envio de cada formulário
  main = main.replace(/(<form class="rq-form"[\s\S]*?)(<button[^>]*type="submit")/g, (m, before, btn) => `${before}${CONSENT()}\n${btn}`);

  // textos que descreviam a prévia sem envio
  const swaps = [
    ['Nenhuma cobrança acontece nesta prévia.', 'Nenhuma cobrança acontece no cadastro de interesse.'],
    ['Brasil · sem pontos fictícios', 'Mapa da rede · cadastros em andamento'],
    ['Nesta proposta, você prepara um rascunho. A criação de conta e o envio oficial dependem da ativação do serviço de cadastro.', 'Nesta etapa, você envia seu interesse e a equipe entra em contato. Conta e perfil público virão numa próxima fase.'],
    ['Não solicitamos senha nesta prévia. O acesso oficial deverá usar autenticação segura e confirmação de e-mail.', 'Não pedimos senha. O acesso com conta será ativado com autenticação segura e confirmação de e-mail.'],
  ];
  for (const [a, b] of swaps) main = main.split(a).join(b);
  // "privacidade-previa" → página de privacidade; "acesso-seguro" segue como diálogo informativo
  main = main.replace(/<button([^>]*)data-dialog="privacidade-previa"([^>]*)>([\s\S]*?)<\/button>/g, '<a$1href="/privacidade.html"$2>$3</a>').replace(/ type="button"(?=[^>]*href="\/privacidade\.html")/g, '');

  // diálogos usados pela página
  const dialogs = [];
  if (main.includes('data-dialog="acesso-seguro"')) dialogs.push(`<dialog class="rq-dialog" id="acesso-seguro" aria-labelledby="titulo-acesso"><button class="rq-dialog-close" type="button" data-close-dialog aria-label="Fechar">×</button><h2 id="titulo-acesso">Seu acesso, com segurança.</h2><p>A criação de conta e a entrada por e-mail serão ativadas numa próxima fase, com autenticação segura.</p><p>Por enquanto, envie seu cadastro pelo formulário — a equipe entra em contato e, quando o acesso abrir, você recebe o convite.</p><a class="rq-btn green" href="#cadastro" data-close-dialog>Ir para o cadastro →</a></dialog>`);
  if (page === 'rede-de-agentes') dialogs.push(`<dialog class="rq-dialog" id="perfil-publicado" aria-labelledby="nome-perfil"><button class="rq-dialog-close" type="button" data-close-dialog aria-label="Fechar perfil">×</button><h2 id="nome-perfil" data-profile-name></h2><p data-profile-location></p><p data-profile-bio></p></dialog>`);
  main = main.replace('</main>', `${dialogs.join('\n')}\n</main>`);

  const scripts = [page === 'rede-de-agentes' ? '<script src="/js/dados-agentes.js" defer></script>' : '', '<script src="/js/site.js?v=1" defer></script>', '<script src="/js/internas.js?v=1" defer></script>'].filter(Boolean).join('\n  ');
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Raízes que Curam</title>
  <meta name="description" content="${desc}" />
  <meta name="theme-color" content="#f4ecd9" />
  <meta property="og:title" content="${title} — Raízes que Curam" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:locale" content="pt_BR" />
  <link rel="icon" href="/assets/favicon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400&display=swap" />
  <link rel="stylesheet" href="/css/site.css?v=1" />
  <link rel="stylesheet" href="/css/internas.css?v=1" />
  <link rel="stylesheet" href="/css/internas-ajustes.css?v=1" />
</head>
<body class="page-int">
  <a class="skip-link" href="#conteudo">Ir para o conteúdo</a>

  <!-- @header -->

  ${main}

  <!-- @footer -->

  <!-- @form-dialog -->

  ${scripts}
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, 'src/pages', `${page}.html`), html);
  console.log('página', page, (html.length / 1024).toFixed(0) + ' KB');
}

// assets referenciados (+ url() do CSS)
for (const f of css.matchAll(/\/assets\/int2\/([^)'"\s]+)/g)) usedAssets.add(f[1]);
fs.mkdirSync(path.join(ROOT, 'assets/int2'), { recursive: true });
let bytes = 0;
for (const f of usedAssets) {
  const from = path.join(PKG, 'assets', f);
  if (!fs.existsSync(from)) { console.warn('FALTA asset', f); continue; }
  fs.mkdirSync(path.dirname(path.join(ROOT, 'assets/int2', f)), { recursive: true });
  fs.copyFileSync(from, path.join(ROOT, 'assets/int2', f));
  bytes += fs.statSync(from).size;
}
fs.copyFileSync(path.join(PKG, 'dados-agentes.js'), path.join(ROOT, 'js/dados-agentes.js'));
// PNG grande vira WebP; fotos acima de 1200px são reduzidas
for (const f of [...usedAssets]) {
  const dest = path.join(ROOT, 'assets/int2', f);
  if (!fs.existsSync(dest)) continue;
  if (f.endsWith('.png')) {
    const webp = f.replace(/\.png$/, '.webp');
    await sharp(dest).trim({ threshold: 1 }).resize({ width: 520, withoutEnlargement: true }).webp({ quality: 80, alphaQuality: 90 }).toFile(path.join(ROOT, 'assets/int2', webp));
    fs.unlinkSync(dest);
    for (const pg of Object.keys(PAGES)) {
      const fp = path.join(ROOT, 'src/pages', `${pg}.html`);
      fs.writeFileSync(fp, fs.readFileSync(fp, 'utf8').split(`/assets/int2/${f}`).join(`/assets/int2/${webp}`));
    }
  } else if (f.endsWith('.webp')) {
    const m = await sharp(dest).metadata();
    if (m.width > 1200) {
      const buf = await sharp(dest).resize({ width: 1200 }).webp({ quality: 76, alphaQuality: 90 }).toBuffer();
      fs.writeFileSync(dest, buf);
    }
  }
}
const total = fs.readdirSync(path.join(ROOT, 'assets/int2')).reduce((t, f) => t + fs.statSync(path.join(ROOT, 'assets/int2', f)).size, 0);
console.log(`assets/int2 após otimizar: ${(total / 1024 / 1024).toFixed(1)} MB`);
console.log(`${usedAssets.size} assets, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
