// Raízes que Curam — interações da home (sem dependências)
(() => {
  const FORM_ENDPOINT = 'https://painel.raizesquecuram.com/api/forms/raizesquecuram-site-interesse/submit';

  // Eventos de clique (instrumentação): ficam em window.dataLayer para quando
  // houver GA4/Tag Manager; sem ferramenta instalada, nada sai do navegador.
  window.dataLayer = window.dataLayer || [];
  const track = (event, extra = {}) => window.dataLayer.push({ event, ...extra });
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-track]');
    if (el) track('cta_click', { cta: el.dataset.track });
  });

  // menu
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('menu-principal');
  const closeMenu = () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menu'); };
  toggle.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  nav.addEventListener('click', (e) => { if (e.target.closest('a, button')) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // carrossel de histórias
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const track = root.querySelector('[data-track]');
    const slides = [...track.children];
    const prev = root.querySelector('[data-prev]');
    const next = root.querySelector('[data-next]');
    const dots = root.querySelector('[data-dots]');
    const step = () => slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
    const current = () => Math.round(track.scrollLeft / step());
    const perView = () => Math.max(1, Math.round(track.clientWidth / step()));
    const pages = () => Math.max(1, slides.length - perView() + 1);
    const go = (i) => track.scrollTo({ left: i * step(), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    const render = () => {
      const n = pages();
      if (dots.children.length !== n) {
        dots.innerHTML = '';
        for (let i = 0; i < n; i++) {
          const b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', `Ir para a história ${i + 1}`);
          b.addEventListener('click', () => go(i));
          dots.appendChild(b);
        }
      }
      const c = Math.min(current(), n - 1);
      [...dots.children].forEach((d, i) => d.setAttribute('aria-current', String(i === c)));
      prev.disabled = c <= 0;
      next.disabled = c >= n - 1;
      dots.hidden = n < 2;
    };
    prev.addEventListener('click', () => go(Math.max(0, current() - 1)));
    next.addEventListener('click', () => go(Math.min(pages() - 1, current() + 1)));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.min(pages() - 1, current() + 1)); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.max(0, current() - 1)); }
    });
    track.addEventListener('scroll', () => requestAnimationFrame(render), { passive: true });
    window.addEventListener('resize', render);
    render();
  });

  // formulário de interesse — cada CTA abre o mesmo diálogo com textos próprios
  const PRESETS = {
    geral: { interesse: 'Quero aprender', eyebrow: 'Faça parte', title: 'Que bom ter você por aqui.', intro: 'Escolha como quer participar e deixe seu contato. A equipe do Raízes que Curam vai te chamar com os próximos passos.' },
    aprender: { interesse: 'Quero aprender', eyebrow: 'Aprendizes', title: 'Vamos começar pelo começo.', intro: 'Conte onde você está e o que te interessa. Avisamos sobre oficinas, encontros e conteúdos para dar os primeiros passos com as plantas medicinais.', msg: 'O que você gostaria de aprender?' },
    agente: { interesse: 'Rede de Agentes — já trabalho com plantas medicinais', eyebrow: 'Rede de Agentes', title: 'Coloque seu trabalho no mapa.', intro: 'O mapeamento está começando. Deixe seu contato e conte um pouco da sua atuação — vamos te chamar para o cadastro completo. Nada é publicado sem a sua autorização.', msg: 'Conte sobre sua atuação com plantas medicinais', org: true },
    mapa: { interesse: 'Rede de Agentes — já trabalho com plantas medicinais', eyebrow: 'Rede de Agentes', title: 'O mapa está sendo cultivado.', intro: 'Os primeiros cadastros estão em andamento e o mapa abre quando houver perfis aprovados. Deixe seu contato para ser avisada(o) — e, se você atua com plantas medicinais, já pode entrar na rede.', msg: 'Você atua com plantas medicinais? Conte um pouco' },
    historias: { interesse: 'Rede de Agentes — já trabalho com plantas medicinais', eyebrow: 'Perfis e histórias', title: 'As histórias estão chegando.', intro: 'Estamos reunindo, com autorização de cada pessoa, as trajetórias que vão aparecer aqui. Quer ser avisada(o) — ou tem uma história para compartilhar?', msg: 'Quer compartilhar sua história? Conte um pouco' },
    multiplicar: { interesse: 'Quero ser Multiplicador', eyebrow: 'Multiplicadores', title: 'Que bom que você quer multiplicar.', intro: 'Este é um cadastro de interesse: avisamos você quando as próximas oportunidades de formação forem abertas.', msg: 'Que saberes você gostaria de compartilhar no seu território?' },
    oficina: { interesse: 'Oficina Farmácia Viva', eyebrow: 'Oficina presencial', title: 'Quatro modelos de farmácia viva.', intro: 'As datas e o local da próxima turma estão em confirmação (previsão: janeiro de 2027, no Espírito Santo). Deixe seu contato para receber a abertura das inscrições em primeira mão.' },
    festival: { interesse: 'Festival — quero participar', eyebrow: 'Festival online', title: 'Quero participar do festival.', intro: 'O festival está previsto para março de 2027, 100% online. Entre na lista de interesse para receber a programação e o link de inscrição assim que abrirem.' },
    'festival-proposta': { interesse: 'Festival — quero propor uma atividade', eyebrow: 'Festival online', title: 'Proponha uma atividade.', intro: 'Quer facilitar uma masterclass, roda ou vivência? Conte sua ideia — a curadoria entra em contato.', msg: 'Descreva a atividade que você gostaria de propor', org: true },
    parceria: { interesse: 'Parceria e apoio', eyebrow: 'Parceiros e apoiadores', title: 'Vamos cultivar isso juntos.', intro: 'Conte quem é você ou sua organização e como imagina colaborar com o Raízes que Curam.', msg: 'Como você imagina essa parceria?', org: true },
    contato: { interesse: 'Contato geral', eyebrow: 'Contato', title: 'Fale com a gente.', intro: 'Mande sua mensagem — respondemos por e-mail.', msg: 'Sua mensagem' },
  };

  const dialog = document.getElementById('form-dialog');
  const form = document.getElementById('interest-form');
  const status = document.getElementById('form-status');
  const submit = form.querySelector('[type="submit"]');
  const $ = (id) => document.getElementById(id);
  let lastTrigger = null;

  const applyPreset = (key) => {
    const p = PRESETS[key] || PRESETS.geral;
    $('form-eyebrow').textContent = p.eyebrow;
    $('form-title').textContent = p.title;
    $('form-intro').textContent = p.intro;
    $('f-interesse').value = p.interesse;
    $('f-msg-label').textContent = p.msg || 'Quer contar algo mais?';
    $('f-org-wrap').hidden = !p.org;
  };
  $('f-interesse').addEventListener('change', (e) => {
    $('f-org-wrap').hidden = !/Parceria|propor|Agentes/.test(e.target.value);
  });

  const openForm = (key, trigger) => {
    lastTrigger = trigger;
    form.reset();
    status.textContent = '';
    status.className = 'form-status';
    submit.disabled = false;
    form.hidden = false;
    applyPreset(key);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    track('form_open', { form: key });
    setTimeout(() => form.querySelector('[name="name"]').focus(), 30);
  };
  const closeForm = () => { dialog.close ? dialog.close() : dialog.removeAttribute('open'); };
  dialog.addEventListener('close', () => lastTrigger && lastTrigger.focus());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) closeForm(); });
  form.querySelector('[data-close]').addEventListener('click', closeForm);
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-form]');
    if (t) { e.preventDefault(); openForm(t.dataset.form, t); }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form-status';
    const data = Object.fromEntries(new FormData(form));
    if (data.website) return; // honeypot
    if (!data.name?.trim() || !data.email?.trim()) { status.textContent = 'Preencha nome e e-mail.'; status.classList.add('is-error'); return; }
    if (!form.querySelector('[name="email"]').checkValidity()) { status.textContent = 'Confira o e-mail digitado.'; status.classList.add('is-error'); return; }
    if (!data.consentimento) { status.textContent = 'Para enviar, marque a autorização de contato.'; status.classList.add('is-error'); return; }
    // name/email/phone/message são os campos que o NAIIAN ONE lê para criar o
    // contato no CRM; os demais entram na submissão e no e-mail com estes rótulos.
    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || undefined,
      'Como quer participar': data.interesse,
      'Cidade/UF': data.cidade?.trim() || undefined,
      'Organização/iniciativa': data.organizacao?.trim() || undefined,
      message: data.message?.trim() || undefined,
      'Consentimento LGPD': 'Sim — aceitou a política de privacidade',
      'Página': location.hostname + location.pathname,
    };
    submit.disabled = true;
    status.textContent = 'Enviando…';
    try {
      const res = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(String(res.status));
      status.textContent = 'Recebemos seu contato. Obrigado por fazer parte — em breve a equipe fala com você.';
      status.classList.add('is-ok');
      submit.hidden = true;
      track('form_submit', { interesse: data.interesse });
      setTimeout(() => { submit.hidden = false; }, 4000);
    } catch (err) {
      status.textContent = 'Não foi possível enviar agora. Tente de novo em instantes.';
      status.classList.add('is-error');
      submit.disabled = false;
    }
  });

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
