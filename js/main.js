(() => {
  'use strict';

  const root = document.documentElement;

  // Tema claro/escuro
  const themeToggle = document.querySelector('.theme-toggle');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)');

  const currentTheme = () => root.dataset.theme || (prefersLight.matches ? 'light' : 'dark');

  themeToggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* armazenamento indisponível */ }
  });

  // Menu mobile
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  const setMenu = (open) => {
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinks.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Borda do cabeçalho ao rolar
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Animação de entrada e link ativo no menu.
  // A classe "js" (que esconde os elementos até animar) só é ligada aqui, junto com o observer,
  // para o conteúdo nunca ficar invisível se o script falhar.
  if ('IntersectionObserver' in window) {
    root.classList.add('js');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    const links = new Map(
      [...navLinks.querySelectorAll('a')].map((a) => [a.getAttribute('href').slice(1), a])
    );
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.remove('active'));
        links.get(entry.target.id)?.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  }

  // Galeria de projetos: lê os repositórios públicos do GitHub.
  // Fica de fora: forks, o repositório de perfil e repositórios com o tópico "ocultar".
  const GITHUB_USER = 'Joshpcbrrj';
  const HIDE_TOPIC = 'ocultar';
  const CACHE_KEY = 'gh-repos';
  const CACHE_TTL = 10 * 60 * 1000;

  const LANG_COLORS = {
    Java: '#b07219', JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
    HTML: '#e34c26', CSS: '#563d7c', Kotlin: '#A97BFF', Shell: '#89e051',
    Dockerfile: '#384d54', Portugol: '#6db33f', 'C#': '#178600', PHP: '#4F5D95'
  };

  const grid = document.getElementById('project-grid');
  const filters = document.getElementById('project-filters');

  const el = (tag, props = {}, children = []) => {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...children);
    return node;
  };

  const prettyName = (name) => name.replace(/[-_]+/g, ' ').trim();

  const loadRepos = async () => {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY));
      if (cached && Date.now() - cached.time < CACHE_TTL) return cached.repos;
    } catch (e) { /* sem cache */ }

    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!res.ok) throw new Error(`GitHub respondeu ${res.status}`);

    const repos = (await res.json())
      .filter((r) => !r.fork && r.name.toLowerCase() !== GITHUB_USER.toLowerCase())
      .filter((r) => !(r.topics || []).includes(HIDE_TOPIC))
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .map(({ name, description, html_url, homepage, language, stargazers_count, topics, pushed_at }) =>
        ({ name, description, html_url, homepage, language, stargazers_count, topics, pushed_at }));

    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), repos })); } catch (e) { /* sem cache */ }
    return repos;
  };

  const projectCard = (repo) => {
    const cover = el('div', { className: 'project-cover' }, [
      el('img', {
        src: `https://opengraph.githubassets.com/1/${GITHUB_USER}/${repo.name}`,
        alt: '', loading: 'lazy', width: 600, height: 300,
        onerror() { cover.remove(); }
      })
    ]);

    const meta = el('div', { className: 'project-meta' });
    if (repo.language) {
      const lang = el('span', { className: 'lang', textContent: repo.language });
      lang.style.setProperty('--lang', LANG_COLORS[repo.language] || 'var(--accent)');
      meta.append(lang);
    }
    if (repo.stargazers_count) meta.append(el('span', { textContent: `★ ${repo.stargazers_count}` }));
    meta.append(el('span', {
      textContent: `Atualizado em ${new Date(repo.pushed_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`
    }));

    const links = el('div', { className: 'project-links' }, [
      el('a', { href: repo.html_url, target: '_blank', rel: 'noopener', textContent: 'Código ↗' })
    ]);
    if (repo.homepage) {
      links.append(el('a', { href: repo.homepage, target: '_blank', rel: 'noopener', textContent: 'Ver online ↗' }));
    }

    const card = el('article', { className: 'card project' }, [
      cover,
      el('div', { className: 'project-body' }, [
        el('h3', { textContent: prettyName(repo.name) }),
        el('p', { textContent: repo.description || 'Sem descrição.' }),
        meta,
        links
      ])
    ]);
    card.dataset.lang = repo.language || 'Outros';
    return card;
  };

  const renderFilters = (repos) => {
    const langs = [...new Set(repos.map((r) => r.language || 'Outros'))].sort((a, b) =>
      a === 'Outros' ? 1 : b === 'Outros' ? -1 : a.localeCompare(b));
    if (langs.length < 2) return;

    const buttons = ['Todos', ...langs].map((lang) => el('button', { type: 'button', textContent: lang }));
    buttons.forEach((btn, i) => {
      btn.setAttribute('aria-pressed', String(i === 0));
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        grid.querySelectorAll('.project').forEach((card) => {
          card.hidden = btn.textContent !== 'Todos' && card.dataset.lang !== btn.textContent;
        });
      });
      filters.append(el('li', {}, [btn]));
    });
    filters.hidden = false;
  };

  if (grid) {
    loadRepos()
      .then((repos) => {
        grid.replaceChildren(...repos.map(projectCard));
        if (!repos.length) grid.append(el('p', { className: 'projects-empty', textContent: 'Nenhum projeto público ainda.' }));
        renderFilters(repos);
      })
      .catch(() => {
        grid.replaceChildren(el('p', {
          className: 'projects-empty',
          textContent: 'Não foi possível carregar os projetos agora. Veja todos no GitHub pelo botão abaixo.'
        }));
      });
  }

  // Ano atual no rodapé
  document.getElementById('ano').textContent = new Date().getFullYear();
})();
