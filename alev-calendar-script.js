(function () {
  fitty('.fit-text');
  const CIRCLE_IMAGE_CLASSES = {
    PREV: 'circle-prev-day',
    CURRENT: 'circle-current-day',
    FUTURE: 'circle-future-day',
  }; 
  const CIRCLE_IMAGES = {
    PREV: 'https://alev-wordpress-prod.s3.amazonaws.com/uploads/2025/12/circle-prev-day.png',
    CURRENT: 'https://alev-wordpress-prod.s3.amazonaws.com/uploads/2025/12/circle-current-day.png',
    FUTURE: 'https://alev-wordpress-prod.s3.amazonaws.com/uploads/2025/12/circle-future-day.png',
  }; 
  const CIRCLE_SIZE = window.matchMedia('(max-width: 768px)').matches ? 70 : 110;
  const CURRENT_DAY_SIZE = window.matchMedia('(max-width: 768px)').matches ? 70 : 110;
  const createImage = className => {
    return document.createElementNS('http://www.w3.org/2000/svg', 'image');
  }; 
  const createCircleImage = dayType => {
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    const size = dayType === 'CURRENT' ? CURRENT_DAY_SIZE : CIRCLE_SIZE;
    image.setAttributeNS(null, 'href', CIRCLE_IMAGES[dayType]);
    image.setAttributeNS(null, 'width', size);
    image.setAttributeNS(null, 'height', size);
    image.setAttributeNS(null, 'class', CIRCLE_IMAGE_CLASSES[dayType]);
    return image;
  }; 
  const calculateCirclePosition = (gElement, forceSize = null) => {
    const path = gElement.querySelector('path');
    if (!path) return null; 
    const bbox = path.getBBox();
    const mobileOffsetY = window.matchMedia('(max-width: 768px)').matches ? -14 : -20;
    const mobileOffsetX = window.matchMedia('(max-width: 768px)').matches ? 0 : 0;
    const size = forceSize || (gElement.classList.contains('day-btn_current_day') ? CURRENT_DAY_SIZE : CIRCLE_SIZE);
    return {
      x: bbox.x + (bbox.width - size) / 2 + mobileOffsetX,
      y: bbox.y + (bbox.height - size) / 2 + mobileOffsetY,
    };
  }; 
  const handleCircleImages = gElement => {
    const existingCircle = gElement.querySelector(`.${CIRCLE_IMAGE_CLASSES.PREV}, 
        .${CIRCLE_IMAGE_CLASSES.CURRENT}, 
        .${CIRCLE_IMAGE_CLASSES.FUTURE}`);
    const path = gElement.querySelector('path');
    if (path) {
        if (gElement.classList.contains('day-btn_current_day')) {
        const bbox = path.getBBox();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;
        path.setAttribute('transform', `translate(${centerX} ${centerY}) scale(1.2) translate(${-centerX} ${-centerY})`);
        } else {
        path.removeAttribute('transform');
        }
    }
    if (!existingCircle) {
        let circleType;
        if (gElement.classList.contains('day-btn_prev_day')) circleType = 'PREV';
        if (gElement.classList.contains('day-btn_current_day')) circleType = 'CURRENT';
        if (gElement.classList.contains('day-btn_future_day')) circleType = 'FUTURE';
        if (circleType) {
        const newCircle = createCircleImage(circleType);
        const position = calculateCirclePosition(gElement);
        if (position) {
            newCircle.setAttributeNS(null, 'x', position.x);
            newCircle.setAttributeNS(null, 'y', position.y);
            const pathElement = gElement.querySelector('path');
            if (pathElement) {
            pathElement.insertAdjacentElement('beforebegin', newCircle);
            } else {
            gElement.appendChild(newCircle);
            }
            if (path) {
            newCircle.onclick = path.onclick;
            path.style.pointerEvents = 'none';
            }
          }
        }
      }
    };
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const gElement = mutation.target; 
        if (gElement.classList.contains('day-btn')) {
          handleCircleImages(gElement); 
          if (
            !gElement.classList.contains('day-btn_current_day') &&
            !gElement.classList.contains('day-btn_prev_day') &&
            !gElement.classList.contains('day-btn_future_day')
          ) {
          }
        }
      }
    });
  }); 
  const initializeCalendarDays = () => {
    const startDate = new Date('2025-12-18');
    const currentDate = new Date();
    let timeDiff = currentDate - startDate;
    let originalDaysPassed = timeDiff >= 0 ? Math.floor(timeDiff / (1000 * 3600 * 24)) + 1 : 0; 
    const totalCalendarDays = 31;
    const daysPassed = Math.min(originalDaysPassed, totalCalendarDays);
    const isCalendarExpired = originalDaysPassed > totalCalendarDays; 
    document.querySelectorAll('[data-popup-trigger]').forEach(dayElement => {
      const trigger = dayElement.getAttribute('data-popup-trigger');
      const dayNumber = parseInt(trigger.match(/\d+/)?.[0] || 0); 
      dayElement.classList.remove('day-btn_prev_day', 'day-btn_current_day', 'day-btn_future_day');
      dayElement.style.pointerEvents = 'auto';
      dayElement.style.filter = ''; 
      if (currentDate < startDate) {
        dayElement.classList.add('day-btn_future_day');
        dayElement.style.pointerEvents = 'none';
        return;
      } 
      if (isCalendarExpired) {
        dayElement.classList.add(
          dayNumber <= totalCalendarDays ? 'day-btn_prev_day' : 'day-btn_future_day'
        );
      } else {
        if (dayNumber === daysPassed) {
          dayElement.classList.add('day-btn_current_day');
        } else if (dayNumber < daysPassed) {
          dayElement.classList.add('day-btn_prev_day');
        } else {
          dayElement.classList.add('day-btn_future_day');
        }
      } 
      if (dayElement.classList.contains('day-btn_future_day')) {
        dayElement.style.pointerEvents = 'none';
      }
    }); 
    document.addEventListener('click', e => {
      const trigger = e.target.closest('[data-popup-trigger]');
      if (!trigger || trigger.classList.contains('day-btn_future_day')) return; 
      const popupId = trigger.getAttribute('data-popup-trigger');
      const popupModal = document.querySelector(`[data-popup-modal="${popupId}"]`); 
      if (popupModal) {
        document.querySelectorAll('.popup-modal').forEach(m => m.classList.remove('is--visible'));
        popupModal.classList.add('is--visible');
        document.querySelector('.popup-overlay').classList.add('is-blacked-out');
        document.body.style.overflow = 'hidden'; 
        if (trigger.classList.contains('day-btn_prev_day')) {
          const baseButton = popupModal.querySelector('.base-button');
          if (baseButton) {
            baseButton.classList.add('disabled');
          }
        }
      }
    }); 
    document.querySelectorAll('.popup-modal__close, .popup-overlay').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.popup-modal').forEach(m => m.classList.remove('is--visible'));
        document.querySelector('.popup-overlay').classList.remove('is-blacked-out');
        document.body.style.overflow = 'initial';
      });
    }); 
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.popup-modal').forEach(m => m.classList.remove('is--visible'));
        document.querySelector('.popup-overlay').classList.remove('is-blacked-out');
        document.body.style.overflow = 'initial';
      }
    });
  }; 
  const initialize = () => {
    document.querySelectorAll('g.day-btn').forEach(element => {
      observer.observe(element, { attributes: true, attributeFilter: ['class'] });
    });
  };
  const initializeAccordions = () => {
    const accordions = document.querySelectorAll('.accordion'); 
    const openAccordion = accordion => {
      const content = accordion.querySelector('.accordion__content');
      accordion.classList.add('accordion__active');
      content.style.maxHeight = content.scrollHeight + 'px';
    }; 
    const closeAccordion = accordion => {
      const content = accordion.querySelector('.accordion__content');
      accordion.classList.remove('accordion__active');
      content.style.maxHeight = null;
    }; 
    accordions.forEach(accordion => {
      const intro = accordion.querySelector('.accordion__intro');
      const content = accordion.querySelector('.accordion__content');
      intro.onclick = () => {
        if (content.style.maxHeight) {
          closeAccordion(accordion);
        } else {
          accordions.forEach(accordion => closeAccordion(accordion));
          openAccordion(accordion);
        }
      };
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initialize();
      initializeCalendarDays();
      initializeAccordions();
    });
  } else {
    initialize();
    initializeCalendarDays();
    initializeAccordions();
  }
})();