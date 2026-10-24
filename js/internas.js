// Páginas internas (Aprender, Rede de Agentes, Multiplicar, Festival, Faça Parte).
// Adaptado do internas.js do pacote de design: escolha de perfil, diálogos,
// filtros/mapa da rede. Os formulários enviam de verdade para o NAIIAN ONE
// (mesmo endpoint do formulário da home) em vez de guardar rascunho local.
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('pt-BR');
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PROFILE_LABEL = { aprendiz: 'Quero aprender', agente: 'Já trabalho com plantas medicinais', multiplicador: 'Quero multiplicar', parceiro: 'Quero apoiar o projeto' };

  function chooseProfile(profile, scroll = true) {
    if (!(profile in PROFILE_LABEL)) return;
    $$('[name="perfil"]').forEach((e) => (e.value = profile));
    $$('[data-choose-profile]').forEach((e) => e.setAttribute('aria-pressed', String(e.dataset.chooseProfile === profile)));
    $$('[data-profile-extra]').forEach((e) => {
      const show = e.dataset.profileExtra === profile;
      e.hidden = !show;
      $$('input,select,textarea', e).forEach((i) => (i.disabled = !show));
    });
    const display = $('[data-active-profile]');
    if (display) display.textContent = PROFILE_LABEL[profile];
    if (scroll) $('#cadastro')?.scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth' });
  }
  $$('[data-choose-profile]').forEach((b) => b.addEventListener('click', () => chooseProfile(b.dataset.chooseProfile)));
  if ($('#cadastro')) {
    const profile = new URLSearchParams(location.search).get('perfil');
    chooseProfile(profile || 'aprendiz', false);
    if (profile) requestAnimationFrame(() => requestAnimationFrame(() => $('#cadastro').scrollIntoView({ behavior: 'instant', block: 'start' })));
  }

  // rótulo legível de cada campo, para o e-mail/submissão no painel
  const labelFor = (form, el) => {
    const lab = el.id && form.querySelector(`label[for="${el.id}"]`);
    const text = (lab || el.closest('label'))?.textContent || el.name;
    return text.replace(/\*|\(opcional\)/g, '').replace(/\s+/g, ' ').trim();
  };

  $$('.rq-form[data-form-kind]').forEach((form) => {
    const status = $('[role="status"]', form) || form.appendChild(Object.assign(document.createElement('p'), { className: 'rq-form-status' }));
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const submit = $('[type="submit"]', form);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const payload = { 'Formulário': form.dataset.formLabel };
      for (const el of form.elements) {
        if (!el.name || el.disabled || el.type === 'submit' || el.name === 'consentimento') continue;
        if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) continue;
        const value = el.type === 'checkbox' ? (el.value && el.value !== 'on' ? el.value : 'Sim') : String(el.value).trim();
        if (!value) continue;
        if (el.name === 'nome') payload.name = value;
        else if (el.name === 'email') payload.email = value;
        else if (el.name === 'perfil') payload['Como quer participar'] = PROFILE_LABEL[value] || value;
        else if (el.name === 'mensagem' || el.name === 'resumo') payload.message = value;
        else {
          const key = labelFor(form, el);
          payload[key] = payload[key] ? `${payload[key]}, ${value}` : value;
        }
      }
      payload['Consentimento LGPD'] = 'Sim — aceitou a política de privacidade';
      payload['Página'] = location.hostname + location.pathname;
      submit.disabled = true;
      status.textContent = 'Enviando…';
      try {
        const res = await fetch(window.RQC_FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(String(res.status));
        status.textContent = 'Recebemos seu envio. Obrigado — em breve a equipe do Raízes que Curam fala com você.';
        form.reset();
        if ($('#cadastro') && form.closest('#cadastro')) chooseProfile($('[name="perfil"]', form)?.value || 'aprendiz', false);
        window.RQC_TRACK?.('form_submit', { form: form.dataset.formKind });
      } catch {
        status.textContent = 'Não foi possível enviar agora. Tente de novo em instantes.';
      } finally {
        submit.disabled = false;
      }
    });
  });

  $$('[data-dialog]').forEach((b) => b.addEventListener('click', () => $('#' + b.dataset.dialog)?.showModal()));
  $$('[data-close-dialog]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
  $$('dialog.rq-dialog').forEach((d) => d.addEventListener('click', (e) => {
    if (e.target !== d) return;
    const b = d.getBoundingClientRect();
    if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) d.close();
  }));

  // Rede de Agentes: filtros, lista e mapa (dados em /js/dados-agentes.js; começa vazio)
  const filters = $('#rq-filters');
  if (filters) {
    const agents = Array.isArray(window.RQ_AGENTES) ? window.RQ_AGENTES : [];
    const list = $('#rq-results'), summary = $('#rq-filter-summary'), empty = $('#rq-filter-empty'), svg = $('#rq-map-svg');
    function render() {
      const f = Object.fromEntries(new FormData(filters));
      const selected = agents.filter((a) => (!f.uf || a.uf === f.uf) && (!f.area || (a.areas || []).includes(f.area)) && (!f.cidade || fold(a.cidade).includes(fold(f.cidade))) && (!f.busca || fold([a.nome, a.descricao, ...(a.areas || [])].join(' ')).includes(fold(f.busca))));
      list.replaceChildren();
      selected.forEach((a) => {
        const card = document.createElement('article'); card.className = 'rq-profile-card';
        const h = document.createElement('h3'); h.textContent = a.nome;
        const place = document.createElement('p'); place.textContent = [a.cidade, a.uf].filter(Boolean).join(' · ');
        const bio = document.createElement('p'); bio.textContent = a.descricao;
        const link = document.createElement('button'); link.className = 'rq-btn green rq-action'; link.type = 'button'; link.textContent = 'Ver perfil';
        link.addEventListener('click', () => { const d = $('#perfil-publicado'); $('[data-profile-name]', d).textContent = a.nome; $('[data-profile-location]', d).textContent = place.textContent; $('[data-profile-bio]', d).textContent = a.descricao; d.showModal(); });
        card.append(h, place, bio, link); list.append(card);
      });
      summary.textContent = agents.length ? `${selected.length} perfil(is) publicado(s) encontrado(s).` : 'A rede está em formação. Os primeiros perfis aparecem aqui depois de autorizados e revisados.';
      empty.hidden = selected.length > 0;
      $('#rq-result-heading').textContent = agents.length ? 'Resultados da busca' : 'A rede começa com novas conexões.';
      if (svg) {
        const group = $('#rq-markers', svg); group?.replaceChildren();
        selected.filter((a) => Number.isFinite(a.longitude) && Number.isFinite(a.latitude)).forEach((a) => {
          const x = (a.longitude - Number(svg.dataset.xmin)) * Number(svg.dataset.scale) + 20;
          const y = (Number(svg.dataset.ymax) - a.latitude) * Number(svg.dataset.scale) + 20;
          const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', '5'); c.setAttribute('fill', '#91492f'); group?.append(c);
        });
      }
    }
    filters.addEventListener('submit', (e) => { e.preventDefault(); render(); });
    filters.addEventListener('reset', () => setTimeout(render, 0)); render();
    $$('[data-view]').forEach((b) => b.addEventListener('click', () => {
      $$('[data-view]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $('#rq-map-panel').hidden = b.dataset.view === 'lista';
    }));
    let scale = 1;
    $$('[data-map-zoom]').forEach((b) => b.addEventListener('click', () => { scale = b.dataset.mapZoom === 'reset' ? 1 : Math.max(1, Math.min(2, scale + Number(b.dataset.mapZoom))); if (svg) svg.style.transform = `scale(${scale})`; }));
  }
})();
