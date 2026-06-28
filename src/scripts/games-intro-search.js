/** Поиск и «случайный квест» на intro-портала games. */
(function () {
  var root = document.querySelector('[data-games-intro]');
  if (!root) return;

  var input = root.querySelector('[data-games-search-input]');
  var output = root.querySelector('[data-games-search-output]');
  var results = root.querySelector('[data-games-search-results]');
  var countEl = root.querySelector('[data-games-search-count]');
  var emptyEl = root.querySelector('[data-games-search-empty]');
  var randomBtn = root.querySelector('[data-games-random]');
  var randomOut = root.querySelector('[data-games-random-out]');
  var chipRoot = root.querySelector('[data-games-chips]');

  var indexEl = document.getElementById('games-search-index');
  if (!indexEl || !input || !results || !output) return;

  var index = [];
  try {
    index = JSON.parse(indexEl.textContent || '[]');
  } catch (e) {
    return;
  }

  var activeCategory = 'all';
  var highlighted = -1;
  var isOpen = false;

  function normalize(value) {
    return (value || '').toLowerCase().trim();
  }

  function haystack(item) {
    return normalize([item.title, item.description, item.category, item.href].join(' '));
  }

  function filterItems() {
    var query = normalize(input.value);
    return index.filter(function (item) {
      var catOk = activeCategory === 'all' || item.categoryKey === activeCategory;
      if (!catOk) return false;
      if (!query) return true;
      return haystack(item).indexOf(query) !== -1;
    });
  }

  function shouldShowResults() {
    return isOpen && (input.value.trim() !== '' || activeCategory !== 'all');
  }

  function setOpen(next) {
    isOpen = next;
    root.querySelector('.games-intro__search-wrap')?.classList.toggle('is-open', isOpen);
  }

  function renderResults(items) {
    highlighted = -1;
    results.innerHTML = '';
    var limit = 10;
    var show = shouldShowResults();

    if (show) {
      items.slice(0, limit).forEach(function (item, i) {
        var li = document.createElement('li');
        li.className = 'games-intro__result';
        li.setAttribute('role', 'option');
        li.setAttribute('data-index', String(i));
        li.innerHTML =
          '<a class="games-intro__result-link" href="' +
          item.href +
          '">' +
          '<span class="games-intro__result-title">' +
          escapeHtml(item.title) +
          '</span>' +
          (item.category
            ? '<span class="games-intro__result-cat">' + escapeHtml(item.category) + '</span>'
            : '') +
          (item.description
            ? '<span class="games-intro__result-desc">' + escapeHtml(item.description) + '</span>'
            : '') +
          '</a>';
        results.appendChild(li);
      });
    }

    var visible = items.length;
    if (countEl) {
      if (input.value.trim() || activeCategory !== 'all') {
        countEl.textContent =
          visible === 0 ? 'Ничего не найдено' : 'Найдено: ' + visible + (visible > limit ? ' · топ-' + limit : '');
      } else {
        countEl.textContent = index.length + ' материалов в базе · начните вводить запрос';
      }
    }

    if (emptyEl) {
      emptyEl.hidden = !show || visible !== 0;
    }

    output.hidden = !show;
    results.hidden = !show || visible === 0;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function applyFilter() {
    renderResults(filterItems());
  }

  function moveHighlight(delta) {
    var items = results.querySelectorAll('.games-intro__result');
    if (!items.length) return;
    highlighted = (highlighted + delta + items.length) % items.length;
    items.forEach(function (el, i) {
      el.classList.toggle('is-highlighted', i === highlighted);
    });
    var active = items[highlighted];
    if (active) {
      active.scrollIntoView({block: 'nearest'});
    }
  }

  function followHighlighted() {
    if (highlighted < 0) return;
    var link = results.querySelectorAll('.games-intro__result')[highlighted];
    if (link) {
      var a = link.querySelector('a');
      if (a) a.click();
    }
  }

  input.addEventListener('input', function () {
    setOpen(true);
    applyFilter();
  });

  input.addEventListener('focus', function () {
    setOpen(true);
    applyFilter();
  });

  input.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveHighlight(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveHighlight(-1);
    } else if (event.key === 'Enter') {
      if (highlighted >= 0) {
        event.preventDefault();
        followHighlighted();
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
      input.blur();
      applyFilter();
    }
  });

  document.addEventListener('click', function (event) {
    if (!root.contains(event.target)) {
      setOpen(false);
      applyFilter();
    }
  });

  if (chipRoot) {
    chipRoot.addEventListener('click', function (event) {
      var chip = event.target.closest('[data-games-chip]');
      if (!chip) return;
      activeCategory = chip.getAttribute('data-games-chip') || 'all';
      chipRoot.querySelectorAll('[data-games-chip]').forEach(function (el) {
        el.classList.toggle('is-active', el === chip);
      });
      setOpen(true);
      applyFilter();
      input.focus();
    });
  }

  if (randomBtn && randomOut) {
    randomBtn.addEventListener('click', function () {
      var pool = index.filter(function (item) {
        return !item.isIntro;
      });
      if (!pool.length) return;
      var pick = pool[Math.floor(Math.random() * pool.length)];
      randomOut.innerHTML =
        '<a class="games-intro__loot-link" href="' +
        pick.href +
        '">' +
        escapeHtml(pick.title) +
        '</a>';
      randomOut.hidden = false;
      randomBtn.classList.add('is-rolled');
      window.setTimeout(function () {
        randomBtn.classList.remove('is-rolled');
      }, 450);
    });
  }

  applyFilter();
})();
