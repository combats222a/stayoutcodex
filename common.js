/* ============================================================================
   STAY OUT WIKI — общий скрипт для всех страниц внутри ru/ и en/
   ----------------------------------------------------------------------------
   На каждой странице нужны ДВА тега <script> в таком порядке (важно!):

     <script src="ПУТЬ_ДО_NAV/_nav.js"></script>
     <script src="ПУТЬ_ДО_КОРНЯ/common.js" defer></script>

   _nav.js лежит в ru/ и en/ (рядом с index.html этого языка).
   common.js лежит в корне репозитория.

     ru/index.html                 → "_nav.js"      и  "../common.js"
     ru/zadaniya/zadaniya.html     → "../_nav.js"   и  "../../common.js"
     en/sobytiya/buldozer.html     → "../_nav.js"   и  "../../common.js"

   _nav.js просто кладёт HTML навбара в window.STAYOUT_NAV_HTML — без fetch(),
   поэтому работает и при открытии файла напрямую (file://), и на сервере,
   и на GitHub Pages.

   Сама база языка (langBase) вычисляется из реального location.pathname,
   поэтому common.js одинаково работает и в корне домена, и в подпапке
   (например user.github.io/repo/ru/...).
   ============================================================================ */

function _stayoutLangInfo() {
  var path = location.pathname;
  var lang = path.indexOf('/en/') > -1 ? 'en' : 'ru';
  var marker = '/' + lang + '/';
  var idx = path.indexOf(marker);
  var langBase = idx > -1 ? path.slice(0, idx + marker.length) : ('/' + lang + '/');
  return { path: path, lang: lang, marker: marker, idx: idx, langBase: langBase };
}

// ── Переключение языка (зовётся из навбара: onclick="switchLang('en')") ─────
function switchLang(lang) {
  try { localStorage.setItem('lang', lang); } catch (e) {}
  var info = _stayoutLangInfo();
  if (lang === info.lang) return;
  if (info.idx === -1) { location.href = lang + '/index.html'; return; }
  var rest = info.path.slice(info.idx + info.marker.length);
  location.href = info.path.slice(0, info.idx) + '/' + lang + '/' + rest;
}

// ── Копирование промокода (используется на index.html) ──────────────────────
function copyCode(id, btn) {
  var el = document.getElementById(id);
  if (!el) return;
  var text = el.textContent.trim();
  navigator.clipboard.writeText(text).then(function () {
    var orig = btn.textContent;
    btn.textContent = btn.getAttribute('data-copied-label') || '✓ Copied';
    btn.classList.add('copied');
    setTimeout(function () { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
  });
}

// ── Вставка навбара ───────────────────────────────────────────────────────────
// Разметка навбара приходит не через fetch() (он блокируется браузером для
// file://), а из обычного <script src=".../_nav.js"> — такой скрипт грузится
// и при локальном открытии файла, и на сервере, и на GitHub Pages одинаково.
// _nav.js просто кладёт HTML в window.STAYOUT_NAV_HTML.
document.addEventListener('DOMContentLoaded', function () {
  var holder = document.getElementById('site-nav');
  if (!holder) return;
  var info = _stayoutLangInfo();

  var html = window.STAYOUT_NAV_HTML;
  if (!html) {
    // _nav.js не подключён на странице или не успел выполниться раньше common.js
    return;
  }
  holder.innerHTML = html;

  // data-href="что-то.html" → реальный href относительно базы языка
  holder.querySelectorAll('[data-href]').forEach(function (el) {
    el.setAttribute('href', info.langBase + el.getAttribute('data-href'));
  });

  // Подсветка активного пункта по имени файла
  var page = info.path.split('/').pop().replace('.html', '');
  holder.querySelectorAll('.nav-links a, .nav-dropdown a').forEach(function (a) {
    if (a.dataset.page === page) a.classList.add('active');
  });

  // Бургер-меню (кнопка и дропдаун теперь внутри подгруженного навбара)
  var burger = holder.querySelector('#navBurger');
  var dropdown = holder.querySelector('#navDropdown');
  if (burger && dropdown) {
    burger.addEventListener('click', function () {
      dropdown.classList.toggle('open');
    });
  }
});

// ── Если в localStorage сохранён ДРУГОЙ язык — уводим на его зеркало ────────
(function () {
  var saved;
  try { saved = localStorage.getItem('lang'); } catch (e) { saved = null; }
  if (!saved) return;
  var info = _stayoutLangInfo();
  if (saved === info.lang || info.idx === -1) return;
  var rest = info.path.slice(info.idx + info.marker.length);
  location.replace(info.path.slice(0, info.idx) + '/' + saved + '/' + rest);
})();
