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
