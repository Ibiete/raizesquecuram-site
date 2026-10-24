// Monta as páginas: src/pages/<nome>.html + partials (topo, rodapé, formulário)
// → index.html na raiz ou <nome>/index.html (URL limpa /<nome>/).
// Os arquivos gerados são versionados (o Dockerfile só copia, sem Node).
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const partial = (n) => fs.readFileSync(path.join(root, 'src/partials', `${n}.html`), 'utf8').replace(/\n$/, '');
const parts = { header: partial('header'), footer: partial('footer'), 'form-dialog': partial('form-dialog') };
const ASSET_VERSION = process.env.ASSET_VERSION || '2';

for (const file of fs.readdirSync(path.join(root, 'src/pages'))) {
  const name = file.replace(/\.html$/, '');
  let html = fs.readFileSync(path.join(root, 'src/pages', file), 'utf8');
  html = html.replace(/^[ \t]*<!-- @([\w-]+) -->/gm, (m, key) => {
    if (!(key in parts)) throw new Error(`partial desconhecido: ${key} em ${file}`);
    return parts[key];
  });
  // item de menu da página atual
  html = html.replace(`data-nav="${name}"`, `data-nav="${name}" aria-current="page"`);
  html = html.replace(/(\/(?:css\/site\.css|js\/site\.js))\?v=\d+/g, `$1?v=${ASSET_VERSION}`);
  const out = name === 'index' ? 'index.html' : name === 'privacidade' ? 'privacidade.html' : path.join(name, 'index.html');
  fs.mkdirSync(path.dirname(path.join(root, out)), { recursive: true });
  // o comentário vai depois do <!DOCTYPE> (antes dele o navegador cai em quirks mode)
  html = html.replace(/^(<!DOCTYPE html>\n)/i, '$1<!-- Gerado por scripts/build.mjs a partir de src/ — não editar aqui -->\n');
  fs.writeFileSync(path.join(root, out), html);
  console.log('→', out);
}
