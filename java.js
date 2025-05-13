// --- Theme Toggle ---
const themeToggle = document.getElementById('theme-toggle');
const bodyElement = document.body; // Use bodyElement consistently for clarity
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

// Function to update pixel colors (used by theme switcher)
let pixelColors = []; // Initialize as empty, will be set by applyTheme

function updatePixelColors(theme) {
    if (theme === 'light') {
        pixelColors = [
            "rgba(120, 120, 120, 0.12)", "rgba(125, 125, 125, 0.10)", "rgba(130, 130, 130, 0.09)",
            "rgba(135, 135, 135, 0.08)", "rgba(140, 140, 140, 0.07)", "rgba(145, 145, 145, 0.06)",
            "rgba(150, 150, 150, 0.05)", "rgba(155, 155, 155, 0.04)", "rgba(160, 160, 160, 0.04)",
            "rgba(165, 165, 165, 0.03)"
        ];
    } else { // dark theme (original subtle grays)
        pixelColors = [
            "rgba(120, 120, 120, 0.2)", "rgba(115, 115, 115, 0.18)", "rgba(110, 110, 110, 0.16)",
            "rgba(105, 105, 105, 0.14)", "rgba(100, 100, 100, 0.12)", "rgba(95, 95, 95, 0.1)",
            "rgba(90, 90, 90, 0.09)", "rgba(85, 85, 85, 0.08)", "rgba(80, 80, 80, 0.07)",
            "rgba(75, 75, 75, 0.06)"
        ];
    }
    // Re-apply to existing pixels if they exist
    const currentPixels = document.querySelectorAll(".pixel");
    currentPixels.forEach((pixel, index) => {
        if (pixelColors.length > 0) {
            pixel.style.backgroundColor = pixelColors[index % pixelColors.length];
        }
    });
}


function applyTheme(theme) {
    if (theme === 'light') {
        bodyElement.classList.add('light-mode');
    } else {
        bodyElement.classList.remove('light-mode');
    }
    updatePixelColors(theme); // Update pixel colors
}

function toggleUserTheme() {
    const currentTheme = bodyElement.classList.contains('light-mode') ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

if (themeToggle) {
    themeToggle.addEventListener('click', toggleUserTheme);
}

// --- Card Mouse Gradient Effect ---
const handleOnMouseMove = e => {
  const { currentTarget: target } = e;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  target.style.setProperty("--mouse-x", `${x}px`);
  target.style.setProperty("--mouse-y", `${y}px`);
}
document.querySelectorAll(".card").forEach(card => {
  card.onmousemove = e => handleOnMouseMove(e);
});

// --- Trailing Pixels Mouse Effect ---
const coords = { x: 0, y: 0 };
const pixels = document.querySelectorAll(".pixel"); // Get pixels again for this scope if needed, or pass from global

window.addEventListener("mousemove", function(e){
  coords.x = e.clientX;
  coords.y = e.clientY;

  // Reduced to first 2 for even more subtle start
  // Ensure pixels array is not empty and pixelColors is initialized
  if (pixels.length > 0 && pixelColors.length > 0) {
      pixels.slice(0, 2).forEach(pixel => { 
          if (parseFloat(pixel.style.opacity) < 0.01) {
              pixel.style.opacity = 0.4; 
          }
      });
  }
});

function animatePixels() {
  let targetX = coords.x;
  let targetY = coords.y;

  if (pixelColors.length === 0) { // Don't run if colors not set yet (e.g., on initial load race condition)
      requestAnimationFrame(animatePixels);
      return;
  }

  pixels.forEach(function (pixel, index) {
      const pixelCurrentX = pixel.x || 0; // Ensure x and y are initialized
      const pixelCurrentY = pixel.y || 0;
      const dx = targetX - pixelCurrentX;
      const dy = targetY - pixelCurrentY;

      const easingFactor = 0.35 + index * 0.004;

      const newX = pixelCurrentX + dx * easingFactor;
      const newY = pixelCurrentY + dy * easingFactor;

      pixel.style.left = newX - (pixel.offsetWidth / 2) + "px";
      pixel.style.top = newY - (pixel.offsetHeight / 2) + "px";

      pixel.x = newX;
      pixel.y = newY;

      const scale = Math.max(0, (pixels.length - index * 1.6) / pixels.length);
      pixel.style.transform = `scale(${scale})`;
      pixel.style.opacity = scale > 0.08 ? (0.45 * scale) : 0;

      targetX = newX;
      targetY = newY;
  });

  requestAnimationFrame(animatePixels);
}

// --- Intersection Observer for Scroll Animations ---
const scrollAnimationClasses = [
  'anim-fade-up', 'anim-scale-pop', 'anim-slide-left',
  'anim-slide-right', 'anim-rotate-in'
];
const defaultAnimation = 'anim-fade-up';

const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observerCallback = (entries, observer) => {
  entries.forEach((entry) => {
      const target = entry.target;
      if (entry.isIntersecting) {
          scrollAnimationClasses.forEach(animClass => target.classList.remove(animClass));
          const animationClassToApply = target.dataset.animation || defaultAnimation;
          if (scrollAnimationClasses.includes(animationClassToApply)) {
            target.classList.add(animationClassToApply);
          } else {
            target.classList.add(defaultAnimation);
          }
          target.classList.add('is-visible');
          // observer.unobserve(target); // Uncomment to animate only once
      } else {
          // Optional: Reset animation
          // if (target.classList.contains('is-visible')) {
          //     target.classList.remove('is-visible', ...scrollAnimationClasses.map(s => s)); // Spread scrollAnimationClasses
          // }
      }
  });
};
const animationObserver = new IntersectionObserver(observerCallback, observerOptions);

function observeElements() {
  const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
  elementsToAnimate.forEach(el => {
      animationObserver.observe(el);
  });
}

// --- Active Nav Link Highlighting ---
const navLinks = document.querySelectorAll('nav .nav-links a');
const sections = document.querySelectorAll('section[id]');

function changeNavActiveState() {
    let currentSectionId = '';
    const navHeight = document.querySelector('nav')?.offsetHeight || 70;
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        // const sectionHeight = section.clientHeight; // Not used here
        if (pageYOffset >= sectionTop - (navHeight + 40)) { // Increased buffer
            currentSectionId = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
}


// --- Document Ready ---
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme FIRST (this calls applyTheme, which calls updatePixelColors)
  const localTheme = localStorage.getItem('theme');
  if (localTheme) {
      applyTheme(localTheme);
  } else if (prefersDarkScheme.matches) {
      applyTheme('dark');
  } else {
      applyTheme('light'); // Default to light if no preference and system is not dark
  }

  // Initialize individual pixel properties (x, y, opacity, and initial color based on theme)
  pixels.forEach(function (pixel, index) {
    pixel.x = 0;
    pixel.y = 0;
    if (pixelColors.length > 0) {
        pixel.style.backgroundColor = pixelColors[index % pixelColors.length];
    } else {
        // Fallback color if pixelColors somehow not initialized (should not happen)
        pixel.style.backgroundColor = "rgba(100,100,100,0.1)";
    }
    pixel.style.opacity = 0;
  });

  animatePixels(); // Start pixel animation

  const elementsToAnimateOnLoad = document.querySelectorAll('.animate-on-scroll');
  elementsToAnimateOnLoad.forEach((el, idx) => {
      setTimeout(() => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom >= 0 && !el.classList.contains('is-visible')) {
              const animationClassToApply = el.dataset.animation || defaultAnimation;
              if (scrollAnimationClasses.includes(animationClassToApply)) {
                  el.classList.add(animationClassToApply);
              } else {
                  el.classList.add(defaultAnimation);
              }
              el.classList.add('is-visible');
          }
      }, 100 + idx * 80);
  });

  observeElements();

  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
  }

  if (navLinks.length > 0 && sections.length > 0) {
    changeNavActiveState();
    window.addEventListener('scroll', changeNavActiveState);
  }
});
