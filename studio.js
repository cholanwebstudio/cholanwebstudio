const filters = document.querySelector('.filters');
const projects = [...document.querySelectorAll('.project')];
const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');


filters.hidden = false;
filters.addEventListener('click', (event) => {
  const selected = event.target.closest('button[data-filter]');
  if (!selected) return;

  for (const button of filters.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button === selected));
  }

  let count = 0;
  for (const project of projects) {
    const visible = selected.dataset.filter === 'all' || project.dataset.category === selected.dataset.filter;
    if (visible && project.hidden && motion.matches) {
      project.classList.remove('reveal');
      requestAnimationFrame(() => project.classList.add('reveal'));
    }
    project.hidden = !visible;
    if (visible) count++;
  }

  document.querySelector('#results').textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown`;
});

if ('IntersectionObserver' in window && motion.matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('reveal');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.16 });

  for (const project of projects) observer.observe(project);
}

const previewControls = document.querySelector('.preview-controls');
const hotelPanel = document.querySelector('#hotel-preview-panel');
const hotelViews = {
  overview: ['1.webp', 'Hotel VKM Cuddalore', 'Residency & Mahal · Cuddalore'],
  rooms: ['residency%20suite.webp', 'Rooms & suites', 'AC rooms and family suites'],
  events: ['vkm%20marrage.webp', 'Event venues', 'Marriage and function halls'],
};
previewControls.hidden = false;
previewControls.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-preview]');
  if (!button || button.getAttribute('aria-pressed') === 'true') return;
  const [image, title, description] = hotelViews[button.dataset.preview];
  hotelPanel.querySelector('img').src = 'https://hotelvkm.in/' + image;
  hotelPanel.querySelector('strong').textContent = title;
  hotelPanel.querySelector('span').textContent = description;
  for (const choice of previewControls.querySelectorAll('button')) {
    choice.setAttribute('aria-pressed', String(choice === button));
  }
  if (motion.matches) {
    hotelPanel.classList.remove('swap');
    requestAnimationFrame(() => hotelPanel.classList.add('swap'));
  }
});

const catalogue = new Map([
  ['sparklers', { name: 'Sparklers', price: 75 }],
  ['flower-pots', { name: 'Flower Pots', price: 120 }],
  ['gift-box', { name: 'Festive Gift Box', price: 450 }],
]);
const bill = new Map();
const flashForm = document.querySelector('#flash-form');
const flashItem = document.querySelector('#flash-item');
const quantityField = document.querySelector('#flash-quantity');
const receipt = document.querySelector('#receipt-items');
const clearBill = document.querySelector('#clear-bill');
const billStatus = document.querySelector('#bill-status');
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
document.querySelector('.flash-demo').hidden = false;

function renderBill(message) {
  receipt.replaceChildren();
  let total = 0;
  for (const [sku, quantity] of bill) {
    const product = catalogue.get(sku);
    const amount = product.price * quantity;
    total += amount;
    const row = document.createElement('li');
    const label = document.createElement('span');
    const value = document.createElement('strong');
    label.textContent = product.name + ' × ' + quantity;
    value.textContent = currency.format(amount);
    row.append(label, value);
    receipt.append(row);
  }
  document.querySelector('#receipt-empty').hidden = bill.size > 0;
  document.querySelector('#receipt-total').textContent = currency.format(total);
  clearBill.disabled = bill.size === 0;
  billStatus.textContent = message + ' Total ' + currency.format(total) + '.';
}

flashForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const sku = flashItem.value;
  const quantity = quantityField.valueAsNumber;
  if (!catalogue.has(sku) || !quantityField.checkValidity()) return;
  bill.set(sku, (bill.get(sku) ?? 0) + quantity);
  renderBill('Item added.');
});
clearBill.addEventListener('click', () => {
  bill.clear();
  renderBill('Bill cleared.');
  flashItem.focus();
});

const brandVideo = document.querySelector('.hero-video');
const filmFrame = document.querySelector('.film-frame');
const portraitFilm = window.matchMedia('(max-width:740px) and (orientation:portrait)');
function revealBrandFilm() {
  filmFrame.classList.add('video-ready');
}
function showBrandPoster() {
  filmFrame.classList.remove('video-ready');
}
function configureBrandFilm() {
  showBrandPoster();
  brandVideo.muted = true;
  brandVideo.autoplay = motion.matches;
  if (!motion.matches) {
    brandVideo.pause();
    return;
  }
  const source = portraitFilm.matches ? brandVideo.dataset.mobileSrc : brandVideo.dataset.desktopSrc;
  if (brandVideo.getAttribute('src') !== source) {
    brandVideo.src = source;
    brandVideo.load();
  }
  const playback = brandVideo.play();
  if (playback) playback.catch(showBrandPoster);
}
brandVideo.addEventListener('playing', revealBrandFilm);
brandVideo.addEventListener('error', showBrandPoster);
portraitFilm.addEventListener('change', configureBrandFilm);
motion.addEventListener('change', configureBrandFilm);
configureBrandFilm();
const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
header.classList.add('nav-enhanced');
menuButton.hidden = false;
function closeMenu() {
  header.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
});
primaryNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && header.classList.contains('menu-open')) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!header.contains(event.target)) closeMenu();
});
window.matchMedia('(max-width:640px)').addEventListener('change', closeMenu);

const filmToggle = document.querySelector('#film-toggle');
function updateFilmToggle() {
  filmToggle.hidden = !motion.matches || Boolean(brandVideo.error);
  filmToggle.textContent = brandVideo.paused ? 'Play film' : 'Pause film';
}
filmToggle.addEventListener('click', () => {
  if (brandVideo.paused) brandVideo.play().catch(showBrandPoster);
  else brandVideo.pause();
});
for (const event of ['playing','pause','error']) brandVideo.addEventListener(event, updateFilmToggle);
motion.addEventListener('change', updateFilmToggle);
updateFilmToggle();

// Render one visible client homepage at a time at a scaled browser viewport.
const featuredImage = document.querySelector('.desktop-preview img');
const featuredScreen = document.createElement('div');
featuredScreen.className = 'featured-screen';
featuredImage.replaceWith(featuredScreen);
featuredScreen.append(featuredImage);
const screens = [featuredScreen, ...document.querySelectorAll('.project-preview')];
const ratios = new Map();
let activeScreen;
let liveFrame;
let automatic = motion.matches && !navigator.connection?.saveData;

function fitLiveFrame() {
  if (!liveFrame) return;
  const width = activeScreen.clientWidth;
  const viewport = window.innerWidth <= 600 ? 390 : 1100;
  const scale = width / viewport;
  liveFrame.style.width = viewport + 'px';
  liveFrame.style.height = Math.ceil(activeScreen.clientHeight / scale) + 'px';
  liveFrame.style.transform = 'scale(' + scale + ')';
}
const screenResize = new ResizeObserver(fitLiveFrame);
const buttons = new Map();
function showLive(screen) {
  if (screen === activeScreen) return;
  if (activeScreen) {
    screenResize.unobserve(activeScreen);
    buttons.get(activeScreen).textContent = 'Play live preview';
    liveFrame.remove();
  }
  activeScreen = screen;
  liveFrame = null;
  if (!screen) return;
  const project = screen.closest('article');
  const link = project.querySelector('a[href^="https:"]');
  liveFrame = document.createElement('iframe');
  liveFrame.className = 'live-site-frame';
  liveFrame.title = project.querySelector('h3').textContent + ' live preview';
  liveFrame.tabIndex = -1;
  liveFrame.setAttribute('aria-hidden', 'true');
  liveFrame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  liveFrame.allow = 'autoplay';
  liveFrame.src = link.href;
  fitLiveFrame();
  screen.append(liveFrame);
  screenResize.observe(screen);
  buttons.get(screen).textContent = 'Stop live preview';
}
const liveObserver = new IntersectionObserver(entries => {
  for (const entry of entries) ratios.set(entry.target, entry.intersectionRatio);
  if (activeScreen && !ratios.get(activeScreen)) showLive(null);
  if (!automatic) return;
  const best = screens.filter(screen => ratios.get(screen) >= 0.45)
    .sort((a,b) => ratios.get(b) - ratios.get(a))[0];
  if (best) showLive(best);
}, {threshold:[0,0.45,0.7,0.95,1]});
for (const screen of screens) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'preview-toggle';
  button.textContent = 'Play live preview';
  button.addEventListener('click', () => {
    automatic = false;
    showLive(activeScreen === screen ? null : screen);
  });
  const container = screen === featuredScreen ? document.querySelector('.featured-copy') : screen.closest('article');
  container.append(button);
  buttons.set(screen, button);
  liveObserver.observe(screen);
}
motion.addEventListener('change', () => {
  automatic = motion.matches && !navigator.connection?.saveData;
  if (!automatic) showLive(null);
});
