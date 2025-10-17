// js/i18n.js
window.I18N = (function(){
  const state = {
    lang: 'en',
    dict: {},
    supported: [],
    files: {},
    onLangApplied: null
  };

  function $(sel){ return Array.from(document.querySelectorAll(sel)); }

  function setText(el, key){
    const val = t(key, el.textContent.trim());
    if (el.hasAttribute('data-i18n-html')) {
      el.innerHTML = val;
    } else {
      el.textContent = val;
    }
  }

  function apply(){
    $('[data-i18n]').forEach(el => setText(el, el.getAttribute('data-i18n')));
    $('[data-i18n-html]').forEach(el => setText(el, el.getAttribute('data-i18n-html')));
    if (typeof state.onLangApplied === 'function') state.onLangApplied(state.lang);
  }

  function t(key, fallback=''){
    const d = state.dict || {};
    const parts = key.split('.');
    let cur = d;
    for (const p of parts){
      if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
      else { cur = undefined; break; }
    }
    return (typeof cur === 'string' ? cur : fallback);
  }

  async function load(lang){
    const url = state.files[lang];
    if (!url) throw new Error(`No i18n file for lang ${lang}`);
    const res = await fetch(url, {cache:'no-store'});
    if (!res.ok) throw new Error(`Load i18n failed: ${res.status}`);
    state.dict = await res.json();
  }

  async function setLang(lang){
    if (!state.supported.includes(lang)) lang = 'en';
    state.lang = lang;
    localStorage.setItem('lang', lang);
    await load(lang);
    apply();
  }

  function toggle(){
    const idx = state.supported.indexOf(state.lang);
    const next = state.supported[(idx+1) % state.supported.length] || 'en';
    setLang(next);
  }

  async function init(opts){
    state.supported = opts.supported || ['en','zh'];
    state.files = opts.files || {en:'./i18n/en.json', zh:'./i18n/zh.json'};
    state.onLangApplied = opts.onLangApplied || null;
    await setLang(opts.defaultLang || 'en');
  }

  return { init, setLang, toggle, t };
})();