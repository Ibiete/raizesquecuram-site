// Gera assets/*.webp a partir da pasta do Drive (blocos da home) baixada em
// ~/raizesquecuram/design-source (não versionada) + fotos ampliadas no Magnific
// em ~/raizesquecuram/upscaled. Elementos com transparência têm as margens
// vazias cortadas (trim) antes do resize.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const SRC = process.env.RQC_SRC || path.join(os.homedir(), 'raizesquecuram/design-source');
const UP = process.env.RQC_UP || path.join(os.homedir(), 'raizesquecuram/upscaled');
const OUT = path.resolve('assets');
fs.mkdirSync(OUT, { recursive: true });

const chat = (bloco, sub, stamp) => {
  const dir = path.join(SRC, bloco, sub);
  const f = fs.readdirSync(dir).find((n) => n.includes(stamp));
  if (!f) throw new Error(`não achei ${stamp} em ${dir}`);
  return path.join(dir, f);
};
const proto = (bloco, file) => {
  const dir = path.join(SRC, bloco);
  const sub = fs.readdirSync(dir).find((n) => n.endsWith('_HTML_CSS'));
  const inner = fs.readdirSync(path.join(dir, sub)).find((n) => fs.statSync(path.join(dir, sub, n)).isDirectory() && n !== 'assets');
  return path.join(dir, sub, inner, 'assets', file);
};
const I = (s) => chat('BLOCO INICIAL', 'imagens do bloco', s);
const R = (s) => chat('BLOCO REDE DE AGENTES', 'imagens do bloco', s);
const O = (s) => chat('BLOCO OFICINA', 'imagens do bloco', s);
const F = (s) => chat('BLOCO FESTIVAL', 'Imagens do bloco', s);
const M = (s) => chat('BLOCO MULTIPLICADORES', 'Imagens do bloco', s);
const C = (s) => chat('BLOCO CONHEÇA', 'Imagens Bloco', s);
const A = (s) => chat('BLOCO COMO ATUAMOS', 'Imagens Bloco', s);
const P = (s) => chat('BLOCO FAÇA PARTE', 'Imagens bloco', s);
const Q = (s) => chat('BLOCO PARCEIROS E APOIADORES', 'Imagens Bloco', s);
const D = (s) => chat('RODAPE', 'imagens rodape', s);
const U = (n) => path.join(UP, `${n}.jpg`);

// [saída, origem, largura máx, opções]
const jobs = [
  // marca e fundos
  ['logo', proto('BLOCO INICIAL', 'logo-oficial.png'), 640, { trim: true }],
  ['logo-branca', D('Imagens Rodape'), 560, { trim: true }],
  ['papel', A('11_47_10'), 1600, { q: 62 }],
  ['textura-verde', proto('RODAPE', 'textura-verde.jpg'), 1000, { q: 60 }],
  ['textura-terracota', C('11_48_32'), 1600, { q: 62 }],
  ['papel-rasgado', I('Faixa de papel'), 1800, { trim: true }],
  ['montanhas-nevoa', I('12_02_56'), 1800, { q: 64 }],
  ['raizes', I('12_02_55'), 1500, { trim: true, q: 70 }],
  ['raizes-2', I('12_02_53'), 1500, { trim: true, q: 70 }],
  // hero + revelação + públicos
  ['hero-calendula', U('hero-calendula'), 1700, { q: 74 }],
  ['ic-folha', I('12_02_05'), 120, { trim: true }],
  ['ic-pessoas', I('12_02_06'), 120, { trim: true }],
  ['ic-broto', I('12_02_08'), 120, { trim: true }],
  ['broto-mini', I('12_02_09'), 80, { trim: true }],
  ['broto-terra', I('12_03_19'), 80, { trim: true }],
  ['ramo-a', I('12_03_11'), 520, { trim: true }],
  ['ramo-b', I('12_03_12'), 420, { trim: true }],
  ['ramo-c', I('12_03_14'), 420, { trim: true }],
  ['ramo-linha', I('12_02_10'), 360, { trim: true }],
  ['flor-linha', I('12_02_12'), 300, { trim: true }],
  ['descoberta', U('descoberta'), 900],
  ['experiencia', U('experiencia'), 900],
  ['conhecimento', U('conhecimento'), 900],
  ['aprendizes', U('aprendizes'), 900],
  ['agentes', U('agentes'), 900],
  ['multiplicadores-card', U('multiplicadores-card'), 900],
  // rede de agentes
  ['ic-cultivo', R('11_58_58'), 120, { trim: true }],
  ['ic-pesquisa', R('11_59_00'), 120, { trim: true }],
  ['ic-fito', R('11_59_01'), 120, { trim: true }],
  ['ic-bio', R('11_59_02'), 120, { trim: true }],
  ['ic-educacao', R('11_59_04'), 120, { trim: true }],
  ['ic-saberes', R('11_59_05'), 120, { trim: true }],
  ['guardias', R('Seis guardi'), 1500, { trim: true }],
  ['mapa-notebook', R('11_59_39'), 1400, { trim: true }],
  ['montanhas', R('11_59_23'), 1800, { trim: true, q: 66 }],
  // perfis e histórias
  ['perfil-cecilia', proto('BLOCO PERFIS E HISTÓRIAS', 'cecilia.jpg'), 760, { q: 74, crop: { left: 0, top: 0, width: 900, height: 590 } }],
  ['perfil-rafael', proto('BLOCO PERFIS E HISTÓRIAS', 'rafael.jpg'), 760, { q: 74, crop: { left: 0, top: 0, width: 900, height: 590 } }],
  ['perfil-luana', proto('BLOCO PERFIS E HISTÓRIAS', 'luana.jpg'), 760, { q: 74, crop: { left: 0, top: 0, width: 900, height: 590 } }],
  ['camomila-canto', P('11_44_49'), 520, { trim: true }],
  // oficina
  ['modelo-1', U('modelo-1'), 560, { q: 74 }],
  ['modelo-2', U('modelo-2'), 560, { q: 74 }],
  ['modelo-3', U('modelo-3'), 560, { q: 74 }],
  ['modelo-4', U('modelo-4'), 560, { q: 74 }],
  ['ryan', U('ryan'), 420, { q: 76 }],
  ['ic-quintal', O('11_54_33'), 110, { trim: true }],
  ['ic-parede', O('11_54_34'), 110, { trim: true }],
  ['ic-moldura', O('11_54_36'), 110, { trim: true }],
  ['ic-vertical', O('11_54_37'), 110, { trim: true }],
  ['ic-calendario', O('11_54_39'), 90, { trim: true }],
  ['ic-local', O('11_54_40'), 90, { trim: true }],
  ['galho-topo', O('11_54_41'), 700, { trim: true }],
  ['alecrim-esq', O('11_54_42'), 520, { trim: true }],
  ['alecrim-dir', O('11_54_44'), 520, { trim: true }],
  // festival
  ['festival-colagem', F('Colheita'), 1400, { trim: true, q: 76 }],
  ['ic-dias', F('11_52_46'), 120, { trim: true }],
  ['ic-master', F('11_52_48'), 120, { trim: true }],
  ['ic-vozes', F('11_52_49'), 120, { trim: true }],
  ['ic-online', F('11_52_51'), 120, { trim: true }],
  ['broto-terra-2', F('11_52_52'), 80, { trim: true }],
  ['calendula-canto', F('11_52_53'), 640, { trim: true }],
  ['alecrim-canto', F('11_52_55'), 640, { trim: true }],
  // multiplicadores
  ['roda-saberes', M('rculo de ervas'), 1300, { trim: true, q: 74 }],
  ['ic-ensinar', M('11_50_55'), 130, { trim: true }],
  ['ic-mobilizar', M('11_50_56'), 130, { trim: true }],
  ['ic-iniciativas', M('11_50_58'), 130, { trim: true }],
  // conheça
  ['mulher-jardim', C('Mulher no Jardim'), 1100, { trim: true, q: 76 }],
  ['ic-circula', C('11_48_26'), 130, { trim: true }],
  ['ic-conectam', C('11_48_28'), 130, { trim: true }],
  ['ic-territorios', C('11_48_29'), 130, { trim: true }],
  ['ic-possibilidades', C('11_48_31'), 130, { trim: true }],
  // como atuamos
  ['colagem-atuamos', A('Colagem Bot'), 1000, { trim: true, q: 76 }],
  ['ic-formacoes', A('11_47_04'), 130, { trim: true }],
  ['ic-encontros', A('11_47_06'), 130, { trim: true }],
  ['ic-apoio', A('11_47_07'), 130, { trim: true }],
  ['ic-articulacao', A('11_47_08'), 130, { trim: true }],
  // faça parte
  ['fp-aprender', P('11_43_42'), 220, { trim: true }],
  ['fp-agentes', P('11_44_45'), 220, { trim: true }],
  ['fp-multiplicar', P('11_44_46'), 220, { trim: true }],
  ['fp-apoiar', P('11_44_48'), 220, { trim: true }],
  ['fp-canto-camomila', P('11_44_49'), 460, { trim: true }],
  ['fp-canto-ramo', P('11_44_51'), 360, { trim: true }],
  ['fp-canto-alecrim', P('11_44_52'), 460, { trim: true }],
  ['fp-canto-calendula', P('11_44_53'), 460, { trim: true }],
  ['fp-broto', P('11_44_55'), 90, { trim: true }],
  // parceiros
  ['ic-formacao-ouro', Q('11_41_48'), 130, { trim: true }],
  ['ic-conexao-ouro', Q('11_41_49'), 130, { trim: true }],
  ['ic-rede-ouro', Q('11_41_50'), 130, { trim: true }],
  ['ouro-folhas', Q('11_41_52'), 420, { trim: true }],
  ['galho-luz', Q('11_41_53'), 700, { trim: true }],
  ['ouro-canto', Q('11_41_55'), 520, { trim: true }],
  ['tigela-canto', Q('11_41_56'), 900, { trim: true }],
  ['divisor-ouro-raiz', Q('11_41_58'), 1400, { trim: true }],
  ['ouro-ramo', Q('11_41_59'), 200, { trim: true }],
  ['ouro-flor', Q('11_42_00'), 200, { trim: true }],
  // rodapé
  ['rodape-esq', D('11_39_24'), 560, { trim: true }],
  ['rodape-dir', D('11_39_25'), 560, { trim: true }],
  ['ramos-ouro', D('11_39_27'), 900, { trim: true }],
  ['divisor-folha', D('11_39_30'), 900, { trim: true }],
  ['divisor-raiz', D('11_39_31'), 1200, { trim: true }],
  ['ouro-broto', D('11_39_32'), 90, { trim: true }],
];

// página interna "Raízes que Curam" (pasta Drive 1aPqEU-VlXx2gpDCVbirEZ6SSP7Oj9ZWG)
const SRC_INT = process.env.RQC_SRC_INT || path.join(os.homedir(), 'raizesquecuram/design-source-interna/Raizes_que_Curam_Pagina_Interna_Completa/raizes-que-curam/assets');
const N = (f) => path.join(SRC_INT, f);
jobs.push(
  ['int-hero', N('hero-recorte.webp'), 1448, { q: 76 }],
  ['int-hero-rect', N('hero.webp'), 1100, { q: 74 }],
  ['int-observar', N('observar.webp'), 1100, { q: 74 }],
  ['int-cultivar', N('cultivar.webp'), 1100, { q: 74 }],
  ['int-trocar', N('trocar.webp'), 1100, { q: 74 }],
  ['int-trocar-recorte', N('trocar-recorte.webp'), 1300, { trim: true, q: 76 }],
  ['int-agente', N('agente.webp'), 800, { q: 74 }],
  ['int-multiplicador', N('multiplicador.webp'), 800, { q: 74 }],
  ['int-alecrim', N('alecrim.png'), 520, { trim: true }],
  ['int-camomila', N('camomila.png'), 520, { trim: true }],
);

let total = 0;
for (const [name, src, width, opt = {}] of jobs) {
  let img = sharp(src);
  if (opt.crop) img = sharp(await img.extract(opt.crop).toBuffer());
  if (opt.trim) img = sharp(await img.trim({ threshold: 1 }).toBuffer());
  const meta = await img.metadata();
  const out = path.join(OUT, `${name}.webp`);
  await img
    .resize({ width: Math.min(width, meta.width), withoutEnlargement: true })
    .webp({ quality: opt.q ?? 80, alphaQuality: 90, effort: 5 })
    .toFile(out);
  const { size } = fs.statSync(out);
  const m = await sharp(out).metadata();
  total += size;
  console.log(`${name.padEnd(22)} ${String(m.width).padStart(5)}x${String(m.height).padEnd(5)} ${(size / 1024).toFixed(0).padStart(5)} KB`);
}
console.log(`total ${(total / 1024 / 1024).toFixed(2)} MB`);
