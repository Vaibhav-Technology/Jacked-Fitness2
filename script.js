/* =========================================================
   JACKED FITNESS — SCRIPT
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURATION — EDIT BUSINESS DETAILS HERE
   --------------------------------------------------------- */
const CONFIG = {
  businessName: 'Jacked Fitness',

  // Number exactly as supplied: 07057056620 (Indian mobile, 10 digits after the leading 0).
  // For tel: links the supplied number is used unchanged.
  phoneDisplay: '07057056620',
  phoneTel: '07057056620',

  // WhatsApp needs international format with no "+", spaces or leading 0.
  // 07057056620 -> drop the trunk "0" and add India's country code 91 -> 917057056620.
  // Please confirm with the owner that this number is on WhatsApp.
  whatsappNumber: '917057056620',

  address: 'Survey No. 159, Dharmaveer project Anandgram Sambhaji Raje Chowk, A/2, Dr Nanasaheb Dharmadhikari Marg, near Tarwala Nagar, Shiv Nagar, Panchawati, Lamkhade Mala, Nashik, Maharashtra 422004',

  whatsappGreeting: 'Hello Jacked Fitness, I would like to know more about your gym membership and facilities.',

  // PLACEHOLDER: paste the official Google reviews link here once verified.
  // While empty, the button opens a Google Maps search for the business.
  googleReviewsUrl: ''
};

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const waLink = (text) => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
const mapsDirections = () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CONFIG.address)}`;

/* ---------- Apply configuration to links ---------- */
function applyConfig() {
  $$('[data-call]').forEach(a => {
    a.href = `tel:${CONFIG.phoneTel}`;
    if (a.classList.contains('phone-link') || a.closest('.footer-text')) a.textContent = CONFIG.phoneDisplay;
  });
  $$('[data-whatsapp]').forEach(a => { a.href = waLink(CONFIG.whatsappGreeting); });
  $$('[data-directions]').forEach(a => { a.href = mapsDirections(); });
  const addr = $('#address-text');
  if (addr) addr.textContent = CONFIG.address;
  const rev = $('#reviews-link');
  if (rev) {
    rev.href = CONFIG.googleReviewsUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.businessName + ' ' + CONFIG.address)}`;
  }
  const yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();
}

/* ---------- Sticky header + active link ---------- */
function initHeader() {
  const header = $('#header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const links = $$('.nav-link');
  const sections = links.map(l => $(l.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));
}

/* ---------- Mobile menu ---------- */
function initMenu() {
  const toggle = $('#menu-toggle');
  const nav = $('#main-nav');
  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  window.matchMedia('(min-width: 960px)').addEventListener('change', () => setOpen(false));
}

/* ---------- Scroll reveal with stagger ---------- */
function initReveal() {
  const items = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('in')); return; }
  // Stagger siblings inside grids
  $$('.card-grid, .feature-grid, .gallery, .highlights').forEach(group => {
    $$('.reveal', group).forEach((el, i) => el.style.setProperty('--stagger', `${(i % 6) * 0.09}s`));
  });
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(i => io.observe(i));
}

/* ---------- Count-up for review total ---------- */
function initCountUp() {
  $$('[data-count]').forEach(el => {
    const target = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = target; return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        obs.unobserve(el);
        const start = performance.now(), dur = 1400;
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    io.observe(el);
  });
}

/* ---------- Subtle hero parallax ---------- */
function initParallax() {
  if (reduceMotion) return;
  const content = $('.hero-content');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking || window.scrollY > window.innerHeight) return;
    ticking = true;
    requestAnimationFrame(() => {
      content.style.transform = `translateY(${window.scrollY * 0.15}px)`;
      content.style.opacity = String(1 - window.scrollY / (window.innerHeight * 0.9));
      ticking = false;
    });
  }, { passive: true });
}

/* ---------- Image fallback (if a photo fails to load) ---------- */
const FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
  '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1C2025"/><stop offset="1" stop-color="#08090B"/></linearGradient></defs>' +
  '<rect width="800" height="600" fill="url(#g)"/>' +
  '<g fill="#C6FF00" opacity=".85"><rect x="250" y="270" width="30" height="60" rx="5"/><rect x="290" y="245" width="30" height="110" rx="5"/>' +
  '<rect x="320" y="293" width="160" height="14"/><rect x="480" y="245" width="30" height="110" rx="5"/><rect x="520" y="270" width="30" height="60" rx="5"/></g></svg>');

function initImageFallback() {
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (img.tagName === 'IMG' && img.src !== FALLBACK_IMG && !img.id.startsWith('lb')) {
      img.src = FALLBACK_IMG;
      img.removeAttribute('srcset');
    }
  }, true); // capture: error events do not bubble
}

/* ---------- Lightbox ---------- */
function initLightbox() {
  const box = $('#lightbox'), big = $('#lb-img'), close = $('#lb-close');
  let lastFocus = null;
  const open = (btn) => {
    lastFocus = btn;
    big.src = btn.dataset.full;
    big.alt = $('img', btn).alt;
    big.onerror = () => { big.src = FALLBACK_IMG; };
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    close.focus();
  };
  const shut = () => {
    box.hidden = true; big.src = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  $$('.g-item').forEach(b => b.addEventListener('click', () => open(b)));
  close.addEventListener('click', shut);
  box.addEventListener('click', e => { if (e.target === box) shut(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !box.hidden) shut(); });
}

/* ---------- Copy address ---------- */
function initCopyAddress() {
  const btn = $('#copy-address'), status = $('#copy-status');
  btn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(CONFIG.address);
      } else {
        const ta = document.createElement('textarea');
        ta.value = CONFIG.address; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        if (!ok) throw new Error('copy failed');
      }
      status.textContent = 'Address copied to clipboard.';
    } catch {
      status.textContent = 'Could not copy automatically. Please select the address and copy it manually.';
    }
    setTimeout(() => { status.textContent = ''; }, 4000);
  });
}

/* ---------- Enquiry form: validation + WhatsApp fallback ---------- */
function initForm() {
  const form = $('#enquiry-form');
  const status = $('#form-status');

  const rules = {
    name: (v) => v.trim().length >= 2 ? '' : 'Please enter your full name.',
    phone: (v) => {
      const digits = v.replace(/[\s\-()]/g, '');
      // Accepts 10-digit Indian mobile, optionally with 0, 91 or +91 prefix
      return /^(\+?91|0)?[6-9]\d{9}$/.test(digits) ? '' : 'Enter a valid 10-digit Indian mobile number.';
    },
    email: (v) => (v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) ? '' : 'Enter a valid email address or leave it blank.',
    type: (v) => v ? '' : 'Please choose an enquiry type.',
    message: (v) => v.trim().length >= 5 ? '' : 'Please write a short message (at least 5 characters).'
  };

  const check = (name) => {
    const field = form.elements[name];
    const msg = rules[name](field.value);
    $('#e-' + name).textContent = msg;
    field.closest('.field').classList.toggle('invalid', !!msg);
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  };

  Object.keys(rules).forEach(n => {
    form.elements[n].addEventListener('blur', () => check(n));
    form.elements[n].addEventListener('input', () => { if (form.elements[n].closest('.field').classList.contains('invalid')) check(n); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = '';
    const results = Object.keys(rules).map(check);
    if (results.includes(false)) {
      const firstBad = Object.keys(rules).find(n => form.elements[n].closest('.field').classList.contains('invalid'));
      form.elements[firstBad].focus();
      status.textContent = 'Please fix the highlighted fields.';
      return;
    }
    const f = form.elements;
    const text = [
      `Hello ${CONFIG.businessName}, I have an enquiry.`,
      `Name: ${f.name.value.trim()}`,
      `Phone: ${f.phone.value.trim()}`,
      f.email.value.trim() ? `Email: ${f.email.value.trim()}` : null,
      `Enquiry type: ${f.type.value}`,
      `Message: ${f.message.value.trim()}`
    ].filter(Boolean).join('\n');

    const win = window.open(waLink(text), '_blank', 'noopener');
    status.textContent = win
      ? 'WhatsApp is opening with your message. Your enquiry is only sent once you press Send in WhatsApp.'
      : 'Your browser blocked the new tab. Please allow pop-ups, or call us directly.';
  });
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  initImageFallback();
  initHeader();
  initMenu();
  initReveal();
  initCountUp();
  initParallax();
  initLightbox();
  initCopyAddress();
  initForm();
});
