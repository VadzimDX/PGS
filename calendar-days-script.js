(function () {
    // Constants
    const PRIMARY_IMAGE_CLASS = 'background-image';
    const PRIMARY_IMAGE_SRC = 'https://alev-wordpress-prod.s3.amazonaws.com/uploads/2025/02/light1-02.png';
    const PRIMARY_WIDTH = 320;
    const PRIMARY_HEIGHT = 320;
  
    const SECONDARY_IMAGE_CLASS = 'background-image2';
    const SECONDARY_IMAGE_SRC = 'https://alev-wordpress-prod.s3.amazonaws.com/uploads/2025/02/light2-02.png';
    const SECONDARY_WIDTH = 105;
    const SECONDARY_HEIGHT = 105;
  
    // Helper functions
    const createImage = (className, src) => {
      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      image.setAttributeNS(null, 'href', src);
  
      if (className === PRIMARY_IMAGE_CLASS) {
        image.setAttributeNS(null, 'width', PRIMARY_WIDTH);
        image.setAttributeNS(null, 'height', PRIMARY_HEIGHT);
      } else {
        image.setAttributeNS(null, 'width', SECONDARY_WIDTH);
        image.setAttributeNS(null, 'height', SECONDARY_HEIGHT);
      }
  
      image.setAttributeNS(null, 'class', className);
      return image;
    };
  
    const calculatePrimaryPosition = (gElement, image) => {
      const rect = gElement.querySelector('.day-btn__bg');
      if (!rect || !image) return null;
  
      const rectX = parseFloat(rect.getAttribute('x'));
      const rectY = parseFloat(rect.getAttribute('y'));
      const rectWidth = parseFloat(rect.getAttribute('width'));
      const rectHeight = parseFloat(rect.getAttribute('height'));
  
      const imgWidth = parseFloat(image.getAttribute('width'));
      const imgHeight = parseFloat(image.getAttribute('height'));
  
      return {
        x: rectX + (rectWidth - imgWidth) / 2,
        y: rectY + (rectHeight - imgHeight) / 2,
      };
    };
  
    const calculateSecondaryPosition = gElement => {
      const border = gElement.querySelector('.day-btn__border');
      if (!border) return null;
  
      return {
        x: parseFloat(border.getAttribute('x')) - 4,
        y: parseFloat(border.getAttribute('y')) - 47,
      };
    };
  
    const handlePrimaryImage = gElement => {
      let existingImage = gElement.querySelector(`.${PRIMARY_IMAGE_CLASS}`);
  
      if (!existingImage) {
        const newImage = createImage(PRIMARY_IMAGE_CLASS, PRIMARY_IMAGE_SRC);
        const position = calculatePrimaryPosition(gElement, newImage);
        if (position) {
          newImage.setAttributeNS(null, 'x', position.x);
          newImage.setAttributeNS(null, 'y', position.y);
          const firstChild = gElement.firstChild;
          if (firstChild) {
            gElement.insertBefore(newImage, firstChild);
          } else {
            gElement.appendChild(newImage);
          }
          existingImage = newImage;
        }
      }
  
      if (existingImage) {
        const position = calculatePrimaryPosition(gElement, existingImage);
        if (position) {
          existingImage.setAttributeNS(null, 'x', position.x);
          existingImage.setAttributeNS(null, 'y', position.y);
        }
      }
    };
  
    const handleSecondaryImage = gElement => {
      if (!gElement.querySelector(`.${SECONDARY_IMAGE_CLASS}`)) {
        const newImage = createImage(SECONDARY_IMAGE_CLASS, SECONDARY_IMAGE_SRC);
        const border = gElement.querySelector('.day-btn__border');
  
        if (border) {
          const position = calculateSecondaryPosition(gElement);
          if (position) {
            newImage.setAttributeNS(null, 'x', position.x);
            newImage.setAttributeNS(null, 'y', position.y);
            border.insertAdjacentElement('afterend', newImage);
          }
        }
      }
    };
  
    // Observer setup
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const gElement = mutation.target;
  
          if (
            gElement.classList.contains('day-btn_current_day') &&
            gElement.classList.contains('day-btn')
          ) {
            handlePrimaryImage(gElement);
            handleSecondaryImage(gElement);
          } else {
            gElement
              .querySelectorAll(`.${PRIMARY_IMAGE_CLASS}, .${SECONDARY_IMAGE_CLASS}`)
              .forEach(img => img.remove());
          }
        }
      });
    });
  
    // Calendar initialization
    const initializeCalendarDays = () => {
      const startDate = new Date('2026-02-09');
      const currentDate = new Date();
      // const currentDate = new Date('2025-03-12T00:00:00Z');
      const timeDiff = currentDate - startDate;
      const daysPassed = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
      const bodyBlackout = document.querySelector('.popup-overlay');
      const totalCalendarDays = 28;
  
      document.querySelectorAll('[data-popup-trigger]').forEach(dayElement => {
        const trigger = dayElement.getAttribute('data-popup-trigger');
        const dayNumber = parseInt(trigger.match(/\d+$/)[0]);
  
        dayElement.classList.remove('day-btn_prev_day', 'day-btn_current_day', 'day-btn_future_day');
        dayElement.style.filter = '';
        dayElement.style.pointerEvents = 'auto';
  
        if (currentDate < startDate) {
          dayElement.classList.add('day-btn_future_day');
          return;
        }
  
        if (dayNumber === daysPassed) {
          dayElement.classList.add('day-btn_current_day');
        } else if (dayNumber < daysPassed && dayNumber <= totalCalendarDays) {
          dayElement.classList.add('day-btn_prev_day');
        } else {
          dayElement.classList.add('day-btn_future_day');
          dayElement.style.pointerEvents = 'none';
        }
  
        const popupModal = document.querySelector(`[data-popup-modal="${trigger}"]`);
        if (popupModal) {
          const button = popupModal.querySelector('.base-button');
          if (button) {
            const isActiveDay = dayNumber === daysPassed && daysPassed <= totalCalendarDays;
            button.classList.toggle('disabled', !isActiveDay);
            button.style.filter = isActiveDay ? '' : 'grayscale(100%)';
          }
        }
      });
  
      // Event listeners for modals
      document.addEventListener('click', e => {
        const trigger = e.target.closest('[data-popup-trigger]');
        if (!trigger || trigger.classList.contains('day-btn_future_day')) return;
  
        const popupId = trigger.getAttribute('data-popup-trigger');
        const popupModal = document.querySelector(`[data-popup-modal="${popupId}"]`);
  
        if (popupModal) {
          document.querySelectorAll('.popup-modal').forEach(m => m.classList.remove('is--visible'));
          popupModal.classList.add('is--visible');
          bodyBlackout.classList.add('is-blacked-out');
          document.body.style.overflow = 'hidden';
        }
      });
  
      document.querySelectorAll('.popup-modal__close, .popup-overlay').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.popup-modal').forEach(m => m.classList.remove('is--visible'));
          bodyBlackout.classList.remove('is-blacked-out');
          document.body.style.overflow = 'initial';
        });
      });
  
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.popup-modal').forEach(m => m.classList.remove('is--visible'));
          bodyBlackout.classList.remove('is-blacked-out');
          document.body.style.overflow = 'initial';
        }
      });
    };
  
    // Initialize active elements and observer
    const initialize = () => {
      const activeElements = document.querySelectorAll('g.day-btn.day-btn_current_day');
      activeElements.forEach(element => {
        handlePrimaryImage(element);
        handleSecondaryImage(element);
      });
  
      document.querySelectorAll('g.day-btn').forEach(element => {
        observer.observe(element, { attributes: true, attributeFilter: ['class'] });
      });
    };
  
    // Accordion functionality
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
  
    // DOM ready handlers
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


