// Midori dig-like v2 — pasos progresivos, tonos verdes, 'kits' en UI
const THEMES = {
  huerta:       { name: 'Huerta',        price: 5490 },
  selvatico:    { name: 'Selvático',     price: 6490 },
  nativas:      { name: 'Nativas',       price: 5990 },
  mediterraneo: { name: 'Mediterráneo',  price: 6790 },
};
const steps = {
  0: document.querySelector('[data-step="0"]'),
  1: document.querySelector('[data-step="1"]'),
  2: document.querySelector('[data-step="2"]'),
  3: document.querySelector('[data-step="3"]'),
  4: document.querySelector('[data-step="4"]'),
  5: document.querySelector('[data-step="5"]'),
};
const kits = []; // cada kit seleccionado
let tipoActual = null; // 'canteros' | 'macetas'

// ✅ Paso 0: setear tipo y habilitar Paso 1
function initTypeStep(){
  document.querySelectorAll('.choose-type[data-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      tipoActual = btn.getAttribute('data-type'); // 'canteros' | 'macetas'
      toast('Tipo seleccionado: ' + (tipoActual === 'canteros' ? 'Canteros' : 'Macetas'));
      openStep(1);
      steps[1]?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function formatCurrency(num) {
  try {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(num);
  } catch { return `$${Math.round(num)}`; }
}

function setYear(){
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

// ✅ ABRIR/CERRAR pasos (incluye 0 si existe)
function openStep(n){
  for (const i of [0,1,2,3,4,5]) {
    if (!steps[i]) continue;
    if (i <= n) steps[i].classList.add('open');
    else steps[i].classList.remove('open');
  }
}

// ✅ Paso 1: elegir theme → crea kit y habilita Paso 2
function initThemes(){
  document.querySelectorAll('.choose[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      // El chequeo de tipoActual va *adentro* del click
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
        tipoKit: tipoActual,   // <-- ahora se guarda
        theme: key,
        themeName: t.name,
        largo: null,
        ancho: null,
        aspect: 'sol',
        posicion: 'un-lado',
        situacion: 'nivel-suelo',
        seguridad: 'amigable',
        price: t.price,
      };
      kits.push(kit);
      toast('Tema seleccionado: ' + t.name);
      renderSummary();
      openStep(2);
      steps[2]?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function initDimsForm(){
  const form = document.getElementById('dims-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!kits.length) { toast('Elegí un tema primero.'); return; }
    const current = kits[kits.length - 1];
    const largo = form.largo.value ? parseInt(form.largo.value, 10) : null;
    const ancho = form.ancho.value ? parseInt(form.ancho.value, 10) : null;
    if (!largo || !ancho) { toast('Ingresá largo y ancho.'); return; }
    current.largo = largo; current.ancho = ancho;
    toast('Dimensiones guardadas.');
    renderSummary();
    openStep(3);
    steps[3].scrollIntoView({ behavior: 'smooth' });
  });
}

function initConfigRadios(){
  document.querySelectorAll('[data-step="3"] input[type="radio"]').forEach(r => {
    r.addEventListener('change', () => {
      if (!kits.length) return;
      const current = kits[kits.length - 1];
      current[r.name] = r.value;
      renderSummary();
      // Al tocar cualquier radio, habilitamos el paso 4.
      openStep(4);
    });
  });

  document.querySelectorAll('[data-step="4"] input[type="radio"]').forEach(r => {
    r.addEventListener('change', () => {
      if (!kits.length) return;
      const current = kits[kits.length - 1];
      current[r.name] = r.value;
      renderSummary();
      // Al setear requisitos, habilitamos el paso 5.
      openStep(5);
    });
  });
}

function renderSummary(){
  const list = document.getElementById('summary-list');
  list.innerHTML = '';
  let subtotal = 0;
  kits.forEach((k, i) => {
    const dims = (k.largo && k.ancho) ? ` — ${k.largo}×${k.ancho} cm` : '';
    const li = document.createElement('li');
	const tipo = k.tipoKit === 'macetas' ? 'Macetas' : 'Canteros';
	li.innerHTML = `<span>${i+1}. ${tipo} — ${k.themeName}${dims}</span><strong>${formatCurrency(k.price)}</strong>`;
    list.appendChild(li);
    subtotal += k.price;
  });
  document.getElementById('subtotal').textContent = formatCurrency(subtotal);
  document.getElementById('total').textContent = formatCurrency(subtotal);
}

function initAddAnother(){
  const btn = document.getElementById('add-kit');
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!kits.length) { toast('Elegí un tema primero.'); return; }
    const last = kits[kits.length - 1];
    kits.push({ ...last, largo: null, ancho: null });
    toast('Se agregó otro kit.');
    renderSummary();
    openStep(2);
    steps[2].scrollIntoView({ behavior: 'smooth' });
  });
}

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


function initCheckout(){
  const btn = document.getElementById('btn-checkout');
  btn.addEventListener('click', () => {
    if (!kits.length) { toast('Agregá al menos un kit.'); return; }
    console.log('Checkout Midori - kits:', kits);
    toast('¡Listo! Te contactaremos para coordinar el pago.');
  });
}

function initConfigSave(){
  const btn = document.getElementById('btn-save-config');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!kits.length) { toast('Elegí un tema primero.'); return; }
    openStep(4);
    steps[4]?.scrollIntoView({ behavior: 'smooth' });
  });
}


function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}

// ✅ Inicialización (si tenés Paso 0 arrancá en 0; si no, en 1)
document.addEventListener('DOMContentLoaded', () => {
  setYear();
  openStep( steps[0] ? 0 : 1 );
  if (steps[0]) initTypeStep();  // <-- importante
  initThemes();
  initDimsForm();
  initConfigLayoutToggle();
  initConfigSave();
  initConfigRadios();
  initAddAnother();
  initCheckout();
});
