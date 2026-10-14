// Apresentação visual de 2,2 segundos; a barra não representa um download.
(() => {
  const opening = document.getElementById('opening');
  if (!opening) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motion.matches;
  try { reduced ||= JSON.parse(localStorage.getItem('rc-accessibility'))?.motion === true; } catch {}
  if (reduced || window.location.hash) { opening.remove(); return; }
  const siblings = [...document.body.children].filter(el => el !== opening && el.tagName !== 'SCRIPT');
  const originalInert = siblings.map(el => el.inert);
  let timer, exitTimer, leaving = false, finished = false;
  function cleanup() {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    clearTimeout(exitTimer);
    siblings.forEach((el, i) => { el.inert = originalInert[i]; });
    document.body.classList.remove('opening-active');
    document.removeEventListener('keydown', onKey);
    motion.removeEventListener('change', onMotion);
    opening.remove();
    document.getElementById('topo')?.focus({ preventScroll: true });
  }
  function leave(immediate = false) {
    if (immediate) { cleanup(); return; }
    if (leaving || finished) return;
    leaving = true;
    clearTimeout(timer);
    opening.classList.add('opening-leaving');
    exitTimer = setTimeout(cleanup, 450);
  }
  function onMotion(event) { if (event.matches) leave(true); }
  function onKey(event) {
    if (event.key === 'Escape' || event.key === 'Tab') { event.preventDefault(); leave(true); }
  }
  siblings.forEach(el => { el.inert = true; });
  document.body.classList.add('opening-active');
  opening.hidden = false;
  opening.focus({ preventScroll: true });
  document.addEventListener('keydown', onKey);
  motion.addEventListener('change', onMotion);
  opening.addEventListener('animationend', event => {
    if (event.target.id === 'openingFill' && event.animationName === 'opening-progress') leave();
    if (event.target === opening && event.animationName === 'opening-fade') cleanup();
  });
  timer = setTimeout(() => leave(), 2250);
})();
const menuButton = document.getElementById('menuBtn');
const menu = document.getElementById('links');
function closeMenu() {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  menuButton.textContent = '☰';
}
menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  menuButton.textContent = open ? '✕' : '☰';
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.nav')) closeMenu();
});
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(section => observer.observe(section));
  document.documentElement.classList.add('js');
}
const discordButton = document.getElementById('discordBtn');
const toast = document.getElementById('toast');
let toastTimeout;
discordButton.addEventListener('click', async () => {
  let message;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(discordButton.dataset.copy);
    } else {
      const input = document.createElement('textarea');
      input.value = discordButton.dataset.copy;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand('copy');
      input.remove();
      discordButton.focus();
      if (!copied) throw new Error('Falha ao copiar');
    }
    message = 'Discord copiado: ' + discordButton.dataset.copy;
  } catch {
    message = 'Não foi possível copiar. Meu Discord é rd0512.';
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3500);
});
// Demonstração local: conteúdo fixo, sem executar código externo.
const examples = {
  html: { file: 'hello-world.html', code: '<developer>\n  nome: "Rodrigo"\n  foco: "front-end"\n  aprendizado: contínuo\n</developer>', title: 'Olá, eu sou Rodrigo.', text: 'Uma ideia começa com uma estrutura.', status: 'HTML: a estrutura da página.' },
  css: { file: 'style.css', code: '.ideia {\n  background: #c5f277;\n  border-radius: 8px;\n  padding: 14px;\n}', title: 'Um pouco de personalidade.', text: 'CSS transforma a apresentação.', status: 'CSS: clique em Executar para aplicar o estilo.' },
  js: { file: 'script.js', code: 'botao.addEventListener("click", () => {\n  cliques += 1;\n  mensagem.textContent =\n    `Você interagiu ${cliques} vez(es)!`;\n});', title: 'Agora é com você.', text: 'Execute o exemplo para interagir.', status: 'JavaScript: cada clique atualiza o resultado.' }
};
const languageButtons = [...document.querySelectorAll('[data-language]')];
const codeContent = document.getElementById('codeContent');
const demoPreview = document.getElementById('demoPreview');
const demoStatus = document.getElementById('demoStatus');
const runButton = document.getElementById('runDemo');
let language = 'html';
let demoClicks = 0;
function selectLanguage(value) {
  language = value;
  demoClicks = 0;
  const example = examples[value];
  document.getElementById('codeFilename').textContent = example.file;
  codeContent.textContent = example.code;
  demoPreview.classList.remove('styled');
  demoPreview.querySelector('strong').textContent = example.title;
  demoPreview.querySelector('span').textContent = example.text;
  demoStatus.textContent = example.status;
  runButton.firstChild.textContent = 'Executar exemplo ';
  languageButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === value)));
}
languageButtons.forEach(button => button.addEventListener('click', () => selectLanguage(button.dataset.language)));
document.getElementById('nextLanguage').addEventListener('click', () => {
  const sequence = Object.keys(examples);
  selectLanguage(sequence[(sequence.indexOf(language) + 1) % sequence.length]);
});
runButton.addEventListener('click', () => {
  if (language === 'css') {
    const applied = demoPreview.classList.toggle('styled');
    demoStatus.textContent = applied ? 'Estilo aplicado! Cor, espaçamento e bordas com CSS.' : 'Estilo removido. Clique para aplicar novamente.';
    runButton.firstChild.textContent = applied ? 'Remover estilo ' : 'Executar exemplo ';
  } else if (language === 'js') {
    demoClicks += 1;
    demoPreview.querySelector('strong').textContent = `Você interagiu ${demoClicks} ${demoClicks === 1 ? 'vez' : 'vezes'}!`;
    demoStatus.textContent = `Evento de clique recebido. Contador: ${demoClicks}.`;
  } else {
    demoPreview.querySelector('strong').textContent = 'Estrutura pronta. Olá, mundo!';
    demoStatus.textContent = 'HTML organiza o título e o texto que você vê no resultado.';
  }
});
// Preferências também respeitam a configuração de movimento do sistema.
const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const preferenceButtons = {
  contrast: document.getElementById('contrastToggle'),
  text: document.getElementById('textToggle'),
  motion: document.getElementById('motionToggle')
};
let preferences = { contrast: false, text: false, motion: false };
try {
  const saved = JSON.parse(localStorage.getItem('rc-accessibility'));
  if (saved) Object.keys(preferences).forEach(key => { preferences[key] = saved[key] === true; });
} catch { /* O site continua funcionando quando o armazenamento está bloqueado. */ }
function applyPreferences() {
  document.documentElement.classList.toggle('high-contrast', preferences.contrast);
  document.documentElement.classList.toggle('large-text', preferences.text);
  document.documentElement.classList.toggle('reduce-motion', preferences.motion || systemMotion.matches);
  Object.entries(preferenceButtons).forEach(([key, button]) => {
    button.setAttribute('aria-pressed', String(key === 'motion' ? preferences.motion || systemMotion.matches : preferences[key]));
  });
  preferenceButtons.motion.disabled = systemMotion.matches;
  preferenceButtons.motion.textContent = systemMotion.matches ? 'Movimento reduzido pelo sistema' : 'Reduzir movimento';
}
Object.entries(preferenceButtons).forEach(([key, button]) => button.addEventListener('click', () => {
  preferences[key] = !preferences[key];
  applyPreferences();
  try { localStorage.setItem('rc-accessibility', JSON.stringify(preferences)); } catch {}
}));
document.getElementById('resetAccess').addEventListener('click', () => {
  preferences = { contrast: false, text: false, motion: false };
  applyPreferences();
  try { localStorage.removeItem('rc-accessibility'); } catch {}
});
systemMotion.addEventListener('change', applyPreferences);
applyPreferences();
const accessPanel = document.getElementById('accessPanel');
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && accessPanel.open) {
    accessPanel.open = false;
    accessPanel.querySelector('summary').focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.access-tools')) accessPanel.open = false;
});





// Digitação decorativa; descrição estática disponível para leitores de tela.
(() => {
  const target = document.getElementById('typingText');
  if (!target) return;
  const phrases = ['Front-end Developer', 'Back-end em formação', 'HTML + CSS + JavaScript', 'Node.js + SQLite'];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer, index = 0, text = phrases[0], deleting = true;
  let reduced = false;
  function refreshMotion() {
    try { reduced = motion.matches || JSON.parse(localStorage.getItem('rc-accessibility'))?.motion === true; }
    catch { reduced = motion.matches; }
    clearTimeout(timer);
    if (reduced) { target.textContent = phrases[0]; return; }
    text = phrases[index];
    target.textContent = text;
    deleting = true;
    timer = setTimeout(step, 1900);
  }
  function step() {
    if (reduced) return;
    if (document.hidden || document.getElementById('opening')) {
      timer = setTimeout(step, 250);
      return;
    }
    const phrase = phrases[index];
    if (deleting) {
      text = text.slice(0, -1);
      target.textContent = text;
      if (!text) {
        deleting = false;
        index = (index + 1) % phrases.length;
        timer = setTimeout(step, 320);
      } else timer = setTimeout(step, 40);
    } else {
      text = phrases[index].slice(0, text.length + 1);
      target.textContent = text;
      if (text === phrases[index]) {
        deleting = true;
        timer = setTimeout(step, 1900);
      } else timer = setTimeout(step, 85);
    }
  }
  motion.addEventListener('change', refreshMotion);
  document.getElementById('motionToggle')?.addEventListener('click', refreshMotion);
  document.getElementById('resetAccess')?.addEventListener('click', refreshMotion);
  window.addEventListener('storage', event => { if (event.key === 'rc-accessibility') refreshMotion(); });
  refreshMotion();
})();
// Effets légers: un seul calcul par image pour le défilement et le pointeur.
(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const effectsAllowed = () => !motion.matches && !document.documentElement.classList.contains('reduce-motion') && !document.documentElement.classList.contains('high-contrast');
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let scrollFrame = 0;
  function updateReading() {
    scrollFrame = 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = `scaleX(${ratio})`;
  }
  function scheduleReading() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateReading);
  }
  window.addEventListener('scroll', scheduleReading, { passive: true });
  window.addEventListener('resize', scheduleReading);
  updateReading();
  document.querySelectorAll('.skills-grid, #projetos, .about-copy').forEach(group => {
    const items = group.querySelectorAll('.skill, .featured-project, :scope > p');
    items.forEach((item, index) => item.style.setProperty('--arrival-delay', Math.min(index * 75, 300) + 'ms'));
  });
  document.querySelectorAll('.skill, .project-copy').forEach(card => {
    let frame = 0, point;
    card.addEventListener('pointermove', event => {
      if (!finePointer.matches || !effectsAllowed()) return;
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!point || !effectsAllowed()) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--light-x', point.x - rect.left + 'px');
        card.style.setProperty('--light-y', point.y - rect.top + 'px');
        card.classList.add('pointer-lit');
      });
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      point = null;
      cancelAnimationFrame(frame);
      frame = 0;
      card.classList.remove('pointer-lit');
    });
  });
  if ('IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('.links a[href^="#"]')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          if (link.getAttribute('href') === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    links.forEach(link => {
      const section = document.querySelector(link.getAttribute('href'));
      if (section) observer.observe(section);
    });
  }
})();
