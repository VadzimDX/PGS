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
    function updateTimerDisplay(days, hours, minutes) {
      heroTimer.querySelector('.days').innerHTML = days;
      heroTimer.querySelector('.hours').innerHTML = ('0' + hours).slice(-2);
      heroTimer.querySelector('.minutes').innerHTML = ('0' + minutes).slice(-2);
    }
    function formatDate(date) {
      const d = new Date(date);
      const day = ('0' + d.getUTCDate()).slice(-2);
      const month = ('0' + (d.getUTCMonth() + 1)).slice(-2);
      const year = d.getUTCFullYear();
      return `${day}.${month}.${year}`;
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
        updateTimerDisplay(days, hours, minutes);
        updateDateBlocks(activeRange.start, activeRange.end);
      } else if (lastPastRange) {
        updateTimerDisplay(0, 0, 0);
        updateDateBlocks(lastPastRange.start, lastPastRange.end);
      } else if (firstFutureRange) {
        updateTimerDisplay(0, 0, 0);
        updateDateBlocks(firstFutureRange.start, firstFutureRange.end);
      } else {
        updateTimerDisplay(0, 0, 0);
        const dateRangeEl = document.querySelector('.hero .date-range');
        if (dateRangeEl) dateRangeEl.textContent = '–';
      }
    }
    timer = setInterval(calculate, 1000);
    calculate();
  }
  countdownHero([
    { start: '2026-01-16T09:00:00Z', end: '2026-02-15T09:00:00Z' }
  ]);
})();
// Сортировка блоков баннеров
(function () {
  // Конфигурация блоков с датами
  const blocksConfig = {
    'subscription': {
      start: '2026-01-17T00:00:00Z',
      end: '2026-01-21T23:59:59Z'
    },
    'lootboxes': {
      start: '2026-01-18T00:00:00Z',
      end: '2026-01-23T23:59:59Z'
    },
    'tournament': {
      start: '2026-01-19T00:00:00Z',
      end: '2026-01-25T23:59:59Z'
    },
    'bonuses': {
      start: '2026-01-09T00:00:00Z',
      end: '2026-02-15T23:59:59Z'
    },
    'lottery': {
      start: '2026-01-01T00:00:00Z',
      end: '2026-02-02T23:59:59Z'
    }
  };
  function sortBanners() {
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
      const startA = new Date(configA.start).getTime();
      const startB = new Date(configB.start).getTime();
      const endA = new Date(configA.end).getTime();
      const endB = new Date(configB.end).getTime();
      const isActiveA = now >= startA && now <= endA;
      const isActiveB = now >= startB && now <= endB;
      const isFinishedA = now > endA;
      const isFinishedB = now > endB;
      if (isActiveA && !isActiveB && !isFinishedB) return -1;
      if (!isActiveA && isActiveB && !isFinishedA) return 1;
      if (isActiveA && isActiveB) return startA - startB;
      const notStartedA = now < startA;
      const notStartedB = now < startB;
      if (notStartedA && !notStartedB) return -1;
      if (!notStartedA && notStartedB) return 1;
      if (notStartedA && notStartedB) return startA - startB;
      if (isFinishedA && isFinishedB) return endA - endB;
      return 0;
    });
    blocks.forEach(block => {
      bannersSection.appendChild(block);
    });
  }
  function updateDateRanges() {
    const bannersSection = document.querySelector('.banners');
    if (!bannersSection) return;
    const blocks = Array.from(bannersSection.children);
    blocks.forEach(block => {
      const className = block.className.split(' ')[1];
      const config = blocksConfig[className];
      if (!config) return;
      const startDate = new Date(config.start);
      const endDate = new Date(config.end);
      const startDay = ('0' + startDate.getUTCDate()).slice(-2);
      const startMonth = ('0' + (startDate.getUTCMonth() + 1)).slice(-2);
      const endDay = ('0' + endDate.getUTCDate()).slice(-2);
      const endMonth = ('0' + (endDate.getUTCMonth() + 1)).slice(-2);
      const dateRange = `${startDay}.${startMonth} - ${endDay}.${endMonth}`;
      const dateRangeEl = block.querySelector('.date-range');
      if (dateRangeEl) {
        dateRangeEl.textContent = dateRange;
      }
    });
  }
  function updateBannersStates() {
    const bannersSection = document.querySelector('.banners');
    if (!bannersSection) return;
    const blocks = Array.from(bannersSection.children);
    const now = new Date().getTime();
    blocks.forEach(block => {
      const className = block.className.split(' ')[1];
      const config = blocksConfig[className];
      if (!config) return;
      const startDate = new Date(config.start).getTime();
      const endDate = new Date(config.end).getTime();
      const stateTimer = block.querySelector('.state-timer');
      const stateButton = block.querySelector('.state-button');
      const stateCompleted = block.querySelector('.state-completed');
      const disableOverlay = block.querySelector('.disable-overlay');
      // Проверяем наличие элементов перед обращением к ним
      if (!stateTimer || !stateButton || !stateCompleted || !disableOverlay) return;
      // Определяем состояние
      if (now < startDate) {
        block.querySelector('.banner-container').classList.remove('completed', 'active');
        block.querySelector('.banner-container').classList.add('upcoming');
        // Еще не начато - показываем таймер
        stateTimer.style.display = 'flex';
        stateButton.style.display = 'none';
        stateCompleted.style.display = 'none';
        disableOverlay.style.display = 'none';
        
        // Обновляем таймер
        const remaining = Math.floor((startDate - now) / 1000);
        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        
        stateTimer.querySelector('.days').textContent = days;
        stateTimer.querySelector('.hours').textContent = ('0' + hours).slice(-2);
        stateTimer.querySelector('.minutes').textContent = ('0' + minutes).slice(-2);
        
      } else if (now >= startDate && now <= endDate) {
        block.querySelector('.banner-container').classList.remove('completed', 'upcoming');
        block.querySelector('.banner-container').classList.add('active');
        // В процессе - показываем кнопку
        stateTimer.style.display = 'none';
        stateButton.style.display = 'block';
        stateCompleted.style.display = 'none';
        disableOverlay.style.display = 'none';
        
      } else {
        // Завершено - показываем текст и оверлей
        block.querySelector('.banner-container').classList.remove('active', 'upcoming');
        block.querySelector('.banner-container').classList.add('completed');
        stateTimer.style.display = 'none';
        stateButton.style.display = 'none';
        stateCompleted.style.display = 'grid';
        disableOverlay.style.display = 'block';
      }
    });
  }
  // Запускаем при загрузке
  sortBanners();
  updateDateRanges();
  updateBannersStates();
  // Обработчик клика на кнопку
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('state-button')) {
      e.preventDefault();
      const banner = e.target.closest('.banner-card');
      const dropdown = banner.querySelector('.banner-dropdown');
      const dropdownContent = dropdown?.querySelector('.dropdown-content');
      
      // Проверяем, есть ли контент в дропдауне
      const hasContent = dropdownContent && dropdownContent.children.length > 0;
      
      if (hasContent) {
        // Есть дропдаун - открываем/закрываем его
        dropdown.classList.toggle('active');
      } else {
        // Нет дропдауна - переходим по ссылке
        const href = e.target.getAttribute('href');
        if (href && href !== '#') {
          window.location.href = href;
        }
      }
    }
  });
  // Обновляем каждую секунду (для таймеров в баннерах)
  setInterval(() => {
    sortBanners();
    updateDateRanges();
    updateBannersStates();
  }, 60000);
})();
