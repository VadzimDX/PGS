(function () {
  const accordions = document.querySelectorAll(".accordion");
  const openAccordion = (accordion) => {
      const content = accordion.querySelector(".accordion__content");
      accordion.classList.add("accordion__active");
      content.style.maxHeight = content.scrollHeight + "px";
  };
  const closeAccordion = (accordion) => {
      const content = accordion.querySelector(".accordion__content");
      accordion.classList.remove("accordion__active");
      content.style.maxHeight = null;
  };
  accordions.forEach((accordion) => {
      const intro = accordion.querySelector(".accordion__intro");
      const content = accordion.querySelector(".accordion__content");
      intro.onclick = () => {
          if (content.style.maxHeight) {
              closeAccordion(accordion);
          } else {
              accordions.forEach((accordion) => closeAccordion(accordion));
              openAccordion(accordion);
          }
      };
  });
})();
// Таймер hero блока
(function () {
  function countdownHero(ranges) {
    const heroTimer = document.querySelector('.hero .timer');
    if (!heroTimer || !Array.isArray(ranges) || ranges.length === 0) return;
    
    let timer;
    
    function updateTimerDisplay(days, hours, minutes, seconds) {
      heroTimer.querySelector('.days').innerHTML = days;
      heroTimer.querySelector('.hours').innerHTML = ('0' + hours).slice(-2);
      heroTimer.querySelector('.minutes').innerHTML = ('0' + minutes).slice(-2);
      heroTimer.querySelector('.seconds').innerHTML = ('0' + seconds).slice(-2);
    }
    
    function formatDate(date) {
      const d = new Date(date);
      const day = ('0' + d.getUTCDate()).slice(-2);
      const month = ('0' + (d.getUTCMonth() + 1)).slice(-2);
      return `${day}.${month}`;
    }
    
    function updateDateBlocks(start, end) {
      const dateRangeText = `${formatDate(start)} - ${formatDate(end)}`;
      const hero = document.querySelector('.hero');
      const dateRangeEl = hero?.querySelector('.date-range');
      if (dateRangeEl) dateRangeEl.textContent = dateRangeText;
    }
    
    function calculate() {
      const now = new Date().getTime();
      let activeRange = null;
      let lastPastRange = null;
      let firstFutureRange = null;
      for (let range of ranges) {
        const start = new Date(range.start).getTime();
        const end = new Date(range.end).getTime();
        
        if (now >= start && now < end) {
          activeRange = range;
          break;
        }
        if (end < now) {
          lastPastRange = range;
        }
        if (!firstFutureRange && start > now) {
          firstFutureRange = range;
        }
      }
      if (activeRange) {
        const endTime = new Date(activeRange.end).getTime();
        let remaining = Math.floor((endTime - now) / 1000);
        let days = Math.floor(remaining / 86400);
        remaining %= 86400;
        let hours = Math.floor(remaining / 3600);
        remaining %= 3600;
        let minutes = Math.floor(remaining / 60);
        let seconds = remaining % 60;
        updateTimerDisplay(days, hours, minutes, seconds);
        updateDateBlocks(activeRange.start, activeRange.end);
      } else if (lastPastRange) {
        updateTimerDisplay(0, 0, 0, 0);
        updateDateBlocks(lastPastRange.start, lastPastRange.end);
      } else if (firstFutureRange) {
        updateTimerDisplay(0, 0, 0, 0);
        updateDateBlocks(firstFutureRange.start, firstFutureRange.end);
      } else {
        updateTimerDisplay(0, 0, 0, 0);
        const dateRangeEl = document.querySelector('.hero .date-range');
        if (dateRangeEl) dateRangeEl.textContent = '–';
      }
    }
    timer = setInterval(calculate, 1000);
    calculate();
  }
  window.initHeroTimer = countdownHero;
})();
// Сортировка блоков баннеров
(function () {
  let cachedConfig = null;
  function sortBanners(blocksConfig) {
    const bannersSection = document.querySelector('.banners');
    if (!bannersSection) return;
    const blocks = Array.from(bannersSection.children);
    const now = new Date().getTime();
    blocks.sort((a, b) => {
      const classNameA = a.className.split(' ')[1];
      const classNameB = b.className.split(' ')[1];
      const configA = blocksConfig[classNameA];
      const configB = blocksConfig[classNameB];
      if (!configA || !configB) return 0;
      const startA = configA.startTime;
      const startB = configB.startTime;
      const endA = configA.endTime;
      const endB = configB.endTime;
      const isActiveA = now >= startA && now <= endA;
      const isActiveB = now >= startB && now <= endB;
      const isFinishedA = now > endA;
      const isFinishedB = now > endB;
      // Завершенные акции всегда в конце
      if (isFinishedA && !isFinishedB) return 1;
      if (!isFinishedA && isFinishedB) return -1;
      if (isFinishedA && isFinishedB) return endA - endB;
      // Активные акции в начале
      if (isActiveA && !isActiveB) return -1;
      if (!isActiveA && isActiveB) return 1;
      if (isActiveA && isActiveB) return startA - startB;
      // Будущие акции после активных
      const notStartedA = now < startA;
      const notStartedB = now < startB;
      if (notStartedA && notStartedB) return startA - startB;
      return 0;
    });
    
    blocks.forEach(block => bannersSection.appendChild(block));
  }
  function updateDateRanges(blocksConfig) {
    const bannersSection = document.querySelector('.banners');
    if (!bannersSection) return;
    
    const blocks = Array.from(bannersSection.children);
    blocks.forEach(block => {
      const className = block.className.split(' ')[1];
      const config = blocksConfig[className];
      if (!config) return;
      const dateRangeEl = block.querySelector('.date-range');
      if (dateRangeEl) {
        dateRangeEl.textContent = config.dateRange;
      }
    });
  }
  function updateBannersStates(blocksConfig) {
    const bannersSection = document.querySelector('.banners');
    if (!bannersSection) return;
    
    const blocks = Array.from(bannersSection.children);
    const now = new Date().getTime();
    
    blocks.forEach(block => {
      const className = block.className.split(' ')[1];
      const config = blocksConfig[className];
      if (!config) return;
      const container = block.querySelector('.banner-container');
      const stateTimer = block.querySelector('.state-timer');
      const stateButton = block.querySelector('.state-button');
      const stateCompleted = block.querySelector('.state-completed');
      const disableOverlay = block.querySelector('.disable-overlay');
      if (!container || !stateTimer || !stateButton || !stateCompleted || !disableOverlay) return;
      const startDate = config.startTime;
      const endDate = config.endTime;
      if (now < startDate) {
        container.classList.remove('completed', 'active');
        container.classList.add('upcoming');
        stateTimer.style.display = 'flex';
        stateButton.style.display = 'none';
        stateCompleted.style.display = 'none';
        disableOverlay.style.display = 'none';
        
      } else if (now >= startDate && now <= endDate) {
        container.classList.remove('completed', 'upcoming');
        container.classList.add('active');
        stateTimer.style.display = 'none';
        stateButton.style.display = 'grid';
        stateCompleted.style.display = 'none';
        disableOverlay.style.display = 'none';
        
      } else {
        container.classList.remove('active', 'upcoming');
        container.classList.add('completed');
        stateTimer.style.display = 'none';
        stateButton.style.display = 'none';
        stateCompleted.style.display = 'grid';
        disableOverlay.style.display = 'block';
      }
    });
  }
  function updateTimersOnly(blocksConfig) {
    const bannersSection = document.querySelector('.banners');
    if (!bannersSection) return;
    
    const blocks = Array.from(bannersSection.children);
    const now = new Date().getTime();
    
    blocks.forEach(block => {
      const className = block.className.split(' ')[1];
      const config = blocksConfig[className];
      if (!config) return;
      const stateTimer = block.querySelector('.state-timer');
      if (!stateTimer || stateTimer.style.display === 'none') return;
      const startDate = config.startTime;
      if (now >= startDate) return;
      const remaining = Math.floor((startDate - now) / 1000);
      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;
      const daysEl = stateTimer.querySelector('.days');
      const hoursEl = stateTimer.querySelector('.hours');
      const minutesEl = stateTimer.querySelector('.minutes');
      const secondsEl = stateTimer.querySelector('.seconds');
      if (daysEl) daysEl.textContent = days;
      if (hoursEl) hoursEl.textContent = ('0' + hours).slice(-2);
      if (minutesEl) minutesEl.textContent = ('0' + minutes).slice(-2);
      if (secondsEl) secondsEl.textContent = ('0' + seconds).slice(-2);
    });
  }
  function preprocessConfig(config) {
    const processed = {};
    for (const [key, value] of Object.entries(config)) {
      const startDate = new Date(value.start);
      const endDate = new Date(value.end);
      processed[key] = {
        ...value,
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        dateRange: formatDateRange(startDate, endDate)
      };
    }
    return processed;
  }
  function formatDateRange(startDate, endDate) {
    const startDay = ('0' + startDate.getUTCDate()).slice(-2);
    const startMonth = ('0' + (startDate.getUTCMonth() + 1)).slice(-2);
    const endDay = ('0' + endDate.getUTCDate()).slice(-2);
    const endMonth = ('0' + (endDate.getUTCMonth() + 1)).slice(-2);
    return `${startDay}.${startMonth} - ${endDay}.${endMonth}`;
  }
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('state-button')) {
      e.preventDefault();
      const banner = e.target.closest('.banner-card');
      const dropdown = banner.querySelector('.banner-dropdown');
      const dropdownContent = dropdown?.querySelector('.dropdown-content');
      const hasContent = dropdownContent && dropdownContent.children.length > 0;
      if (hasContent) {
        dropdown.classList.toggle('active');
      } else {
        const href = e.target.getAttribute('href');
        if (href && href !== '#') {
          window.location.href = href;
        }
      }
    }
  });  
  window.initBanners = function(config) {
    cachedConfig = preprocessConfig(config);
    sortBanners(cachedConfig);
    updateDateRanges(cachedConfig);
    updateBannersStates(cachedConfig);
    
    // Обновляем только таймеры каждую секунду
    setInterval(() => {
      updateTimersOnly(cachedConfig);
    }, 1000);
    
    // Полное обновление состояний каждую минуту
    setInterval(() => {
      sortBanners(cachedConfig);
      updateBannersStates(cachedConfig);
    }, 60000);
  };
})();
// ============================================
// ======= НАСТРОЙКА ДАТ (РЕДАКТИРУЕМ ЗДЕСЬ) =======
// ============================================
// НАСТРОЙКА HERO-БЛОКА
window.initHeroTimer([
  { start: '2026-01-16T09:00:00Z', end: '2026-02-15T09:00:00Z' }
]);
// НАСТРОЙКА БАННЕРОВ
window.initBanners({
  'subscription': {
    start: '2026-02-01T00:00:00Z',
    end: '2026-02-01T23:59:59Z'
  },
  'lootboxes': {
    start: '2026-01-22T00:00:00Z',
    end: '2026-02-22T23:59:59Z'
  },
  'tournament': {
    start: '2026-01-01T00:00:00Z',
    end: '2026-01-24T23:59:59Z'
  },
  'bonuses': {
    start: '2026-01-23T00:00:00Z',
    end: '2026-01-23T23:59:59Z'
  },
  'lottery': {
    start: '2026-01-01T00:00:00Z',
    end: '2026-01-01T23:59:59Z'
  },
  'calendar': {
    start: '2026-01-09T00:00:00Z',
    end: '2026-02-22T23:59:59Z'
  },
  'promo-page': {
    start: '2026-01-16T00:00:00Z',
    end: '2026-02-01T23:59:59Z'
  }
});
