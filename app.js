// Midori dig-like v2 — pasos progresivos, tonos verdes, 'kits' en UI
const THEMES = {
  huerta:       { name: 'Huerta',        price: 5490 },
  selvatico:    { name: 'Selvático',     price: 6490 },
  nativas:      { name: 'Nativas',       price: 5990 },
  mediterraneo: { name: 'Mediterráneo',  price: 6790 },
};

// Ahora tenemos pasos 0 a 6
const steps = {
  0: document.querySelector('[data-step="0"]'),
  1: document.querySelector('[data-step="1"]'),
  2: document.querySelector('[data-step="2"]'),
  3: document.querySelector('[data-step="3"]'),
  4: document.querySelector('[data-step="4"]'),
  5: document.querySelector('[data-step="5"]'),
  6: document.querySelector('[data-step="6"]'),
};

const kits = []; // cada kit seleccionado
let tipoActual = null; // 'canteros' | 'macetas'

// ----------------------
// Utils
// ----------------------
function formatCurrency(num) {
  try {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      maximumFractionDigits: 0
    }).format(num);
  } catch {
    return `$${Math.round(num)}`;
  }
}

function toast(msg){
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}

function setYear(){
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

// Abrir/cerrar pasos (0..6)
function openStep(n){
  for (const i of [0,1,2,3,4,5,6]) {
    if (!steps[i]) continue;
    if (i <= n) steps[i].classList.add('open');
    else steps[i].classList.remove('open');
  }
}

// ----------------------
// Paso 0: tipo de kit
// ----------------------
function initTypeStep(){
  document.querySelectorAll('.choose-type[data-type]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      tipoActual = btn.getAttribute('data-type'); // 'canteros' | 'macetas'
      toast('Tipo seleccionado: ' + (tipoActual === 'canteros' ? 'Canteros' : 'Macetas'));
      openStep(1);
      steps[1]?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ----------------------
// Paso 1: tema
// ----------------------
function initThemes(){
  document.querySelectorAll('.choose[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!tipoActual) {
        toast('Elegí primero el tipo de kit.');
        openStep(0);
        steps[0]?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      const key = btn.getAttribute('data-theme');
      const t = THEMES[key];
      if (!t) return;

      const kit = {
        tipoKit:   tipoActual,
        theme:     key,
        themeName: t.name,
        largo:     null,
        ancho:     null,
        aspect:    'sol',
        posicion:  'un-lado',
        situacion: 'nivel-suelo',
        seguridad: 'amigable',
        polinizadoras: false,
        instalacion: false,
        mantenimiento: false,
        price:     t.price,
      };
      kits.push(kit);
      toast('Tema seleccionado: ' + t.name);
      renderSummary();
      openStep(2);
      steps[2]?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ----------------------
// Paso 2: dimensiones
// ----------------------
function initDimsForm(){
  const form = document.getElementById('dims-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!kits.length) { toast('Elegí un tema primero.'); return; }
    const current = kits[kits.length - 1];
    const largo = form.largo.value ? parseInt(form.largo.value, 10) : null;
    const ancho = form.ancho.value ? parseInt(form.ancho.value, 10) : null;
    if (!largo || !ancho) { toast('Ingresá largo y ancho.'); return; }
    current.largo = largo;
    current.ancho = ancho;
    toast('Dimensiones guardadas.');
    renderSummary();
    openStep(3);
    steps[3]?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ----------------------
// Paso 3 y 4: radios
// (no abren pasos siguientes solos)
// ----------------------
function initConfigRadios(){
  // Paso 3: config (aspect, posicion, situacion)
  document.querySelectorAll('[data-step="3"] input[type="radio"]').forEach(r => {
    r.addEventListener('change', () => {
      if (!kits.length) return;
      const current = kits[kits.length - 1];
      current[r.name] = r.value;
      renderSummary();
    });
  });

  // Paso 4: seguridad + polinizadoras (manejo de radios va acá)
  document.querySelectorAll('[data-step="4"] input').forEach(inp => {
    inp.addEventListener('change', () => {
      if (!kits.length) return;
      const current = kits[kits.length - 1];
      if (inp.type === 'checkbox' && inp.name === 'polinizadoras') {
        current.polinizadoras = inp.checked;
      } else if (inp.type === 'radio') {
        current[inp.name] = inp.value; // seguridad
      }
      renderSummary();
    });
  });
}

// ----------------------
// Paso 3: botón Guardar (abre 4)
// ----------------------
function initConfigSave(){
  const btn = document.getElementById('btn-save-config');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!kits.length) { toast('Elegí un tema primero.'); return; }
    openStep(4);
    steps[4]?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ----------------------
// Paso 4: botón Guardar (abre 5)
// ----------------------
function initRequirementsSave(){
  const btn = document.getElementById('btn-save-reqs');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!kits.length) { toast('Elegí un tema primero.'); return; }

    const current = kits[kits.length - 1];
    // aseguramos últimos valores:
    const pol = document.getElementById('polinizadoras');
    if (pol) current.polinizadoras = !!pol.checked;
    const seg = document.querySelector('[data-step="4"] input[name="seguridad"]:checked');
    if (seg) current.seguridad = seg.value;

    renderSummary();
    openStep(5);
    steps[5]?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ----------------------
// Paso 5: Servicios opcionales
// ----------------------
function initServices(){
  const chkInst = document.getElementById('srv-instalacion');
  const chkMant = document.getElementById('srv-mantenimiento');
  const btnSave = document.getElementById('btn-save-services');

  if (!chkInst || !chkMant || !btnSave) return;

  [chkInst, chkMant].forEach(inp => {
    inp.addEventListener('change', () => {
      if (!kits.length) return;
      const current = kits[kits.length - 1];
      if (inp.name === 'instalacion')   current.instalacion = inp.checked;
      if (inp.name === 'mantenimiento') current.mantenimiento = inp.checked;
      renderSummary();
    });
  });

  btnSave.addEventListener('click', () => {
    if (!kits.length) { toast('Elegí un tema primero.'); return; }
    // aseguramos valores finales:
    const current = kits[kits.length - 1];
    current.instalacion   = !!chkInst.checked;
    current.mantenimiento = !!chkMant.checked;
    renderSummary();
    openStep(6);
    steps[6]?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ----------------------
// Resumen
// ----------------------
function renderSummary(){
  const list = document.getElementById('summary-list');
  if (!list) return;
  list.innerHTML = '';
  let subtotal = 0;

  kits.forEach((k, i) => {
    const dims = (k.largo && k.ancho) ? ` — ${k.largo}×${k.ancho} cm` : '';
    const tipo = k.tipoKit === 'macetas' ? 'Macetas' : 'Canteros';

    const extras = [];
    if (k.polinizadoras)  extras.push('Polinizadoras');
    if (k.instalacion)    extras.push('Instalación');
    if (k.mantenimiento)  extras.push('Mantenimiento');
    const extrasBadge = extras.length
      ? ` <small style="opacity:.75">• ${extras.join(' • ')}</small>`
      : '';

    const servicios =
      (k.instalacion   ? 2500 : 0) +
      (k.mantenimiento ? 2500 : 0);

    const itemBase = k.price || 0;
    const itemTotal = itemBase + servicios;
    subtotal += itemTotal;

    const li = document.createElement('li');
    li.innerHTML =
      `<span>${i+1}. ${tipo} — ${k.themeName}${dims}${extrasBadge}</span>` +
      `<strong>${formatCurrency(itemTotal)}</strong>`;
    list.appendChild(li);
  });

  const subtotalEl = document.getElementById('subtotal');
  const totalEl    = document.getElementById('total');
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (totalEl)    totalEl.textContent    = formatCurrency(subtotal);
}

// ----------------------
// Paso 6: agregar otro kit
// ----------------------
function initAddAnother(){
  const btn = document.getElementById('add-kit');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!kits.length) { toast('Elegí un tema primero.'); return; }
    const last = kits[kits.length - 1];
    kits.push({
      ...last,
      largo: null,
      ancho: null
    });
    toast('Se agregó otro kit.');
    renderSummary();
    openStep(2);
    steps[2]?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ----------------------
// Layout toggle paso 3
// ----------------------
function initConfigLayoutToggle(){
  const opts = document.getElementById('config-options');
  if (!opts) return;
  const apply = (mode) => {
    opts.classList.toggle('opt-vertical',   mode === 'vertical');
    opts.classList.toggle('opt-horizontal', mode === 'horizontal');
  };
  document.querySelectorAll('input[name="layout3"]').forEach(r => {
    r.addEventListener('change', () => apply(r.value));
  });
  apply('vertical'); // estado inicial
}

// ----------------------
// Checkout
// ----------------------
function initCheckout(){
  const btn = document.getElementById('btn-checkout');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!kits.length) { toast('Agregá al menos un kit.'); return; }
    console.log('Checkout Midori - kits:', kits);
    toast('¡Listo! Te contactaremos para coordinar el pago.');
  });
}

// ----------------------
// Init general
// ----------------------
document.addEventListener('DOMContentLoaded', () => {
  setYear();
  openStep(0);           // solo Paso 0 abierto al inicio
  initTypeStep();        // abre Paso 1
  initThemes();          // abre Paso 2
  initDimsForm();        // abre Paso 3
  initConfigLayoutToggle();
  initConfigSave();      // Guardar 3 → 4
  initConfigRadios();    // radios 3 y 4
  initRequirementsSave();// Guardar 4 → 5
  initServices();        // Guardar 5 → 6
  initAddAnother();
  initCheckout();
});

