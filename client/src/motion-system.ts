/**
 * Motion system — single init point for all scroll-driven animation.
 * Zero React re-renders per frame. Everything via CSS custom properties
 * and data attributes on <html>.
 */

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ─── Scroll custom properties ──────────────────────────────────── */

let ticking = false;

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const html = document.documentElement;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

    html.style.setProperty("--scroll-y", String(scrollTop));
    html.style.setProperty("--scroll-progress", String(progress.toFixed(4)));

    if (scrollTop > 10) {
      html.classList.add("has-scrolled");
    } else {
      html.classList.remove("has-scrolled");
    }

    if (scrollTop > 400) {
      html.classList.add("scrolled-deep");
    } else {
      html.classList.remove("scrolled-deep");
    }

    // Parallax offsets for data-parallax elements
    if (!REDUCED) {
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.parallax ?? "0.15");
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        const offset = (center - viewCenter) * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
    }

    ticking = false;
  });
}

/* ─── IntersectionObserver for reveals ──────────────────────────── */

function setupReveals() {
  if (REDUCED) {
    // Instant reveal for reduced-motion
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      el.setAttribute("data-revealed", "");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const delay = el.dataset.delay ?? "0";
          setTimeout(() => {
            el.setAttribute("data-revealed", "");
          }, parseFloat(delay));
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])").forEach((el) => {
    observer.observe(el);
  });
}

/* ─── Count-up animation ────────────────────────────────────────── */

function setupCountUp() {
  if (REDUCED) return;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const target = parseInt(el.dataset.count ?? "0", 10);
          const suffix = el.dataset.countSuffix ?? "";
          const duration = 1200;
          const start = performance.now();

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out quad
            const eased = 1 - (1 - progress) * (1 - progress);
            const current = Math.round(eased * target);
            el.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    counterObserver.observe(el);
  });
}

/* ─── Scroll progress rail ──────────────────────────────────────── */

function createProgressRail() {
  if (document.getElementById("scroll-progress-rail")) return;

  const rail = document.createElement("div");
  rail.id = "scroll-progress-rail";
  rail.setAttribute("aria-hidden", "true");
  rail.innerHTML = '<div id="scroll-progress-fill"></div>';
  document.body.prepend(rail);

  const fill = document.getElementById("scroll-progress-fill")!;
  const update = () => {
    const progress = parseFloat(document.documentElement.style.getPropertyValue("--scroll-progress") ?? "0");
    fill.style.width = `${progress * 100}%`;
  };

  // Update on scroll via MutationObserver on html style
  const mo = new MutationObserver(update);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
}

/* ─── Back to top button ────────────────────────────────────────── */

function createBackToTop() {
  if (document.getElementById("back-to-top")) return;

  const btn = document.createElement("button");
  btn.id = "back-to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.setAttribute("type", "button");
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
  document.body.appendChild(btn);

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Show/hide based on scroll depth
  const update = () => {
    if (document.documentElement.classList.contains("scrolled-deep")) {
      btn.classList.add("is-visible");
    } else {
      btn.classList.remove("is-visible");
    }
  };

  const mo = new MutationObserver(update);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
}

/* ─── Header condense on scroll ─────────────────────────────────── */

function setupHeaderCondense() {
  // Handled by .has-scrolled class on <html> via CSS
  // Just ensure the class is managed
}

/* ─── Marquee strip ─────────────────────────────────────────────── */

function setupMarquees() {
  if (REDUCED) {
    // For reduced motion, make marquees horizontally scrollable
    document.querySelectorAll<HTMLElement>("[data-marquee]").forEach((el) => {
      el.style.overflowX = "auto";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (el.style as any).webkitOverflowScrolling = "touch";
      el.classList.add("marquee--reduced");
    });
    return;
  }

  document.querySelectorAll<HTMLElement>("[data-marquee]").forEach((el) => {
    if (el.querySelector(".marquee__track")) return;

    const content = el.innerHTML;
    el.innerHTML = '';
    el.classList.add("marquee");

    const track = document.createElement("div");
    track.className = "marquee__track";
    track.innerHTML = `<div class="marquee__content">${content}</div><div class="marquee__content" aria-hidden="true">${content}</div>`;
    el.appendChild(track);
  });
}

/* ─── MutationObserver for route changes ────────────────────────── */

function setupMutationObserver() {
  const main = document.querySelector("main");
  if (!main) return;

  const mo = new MutationObserver(() => {
    setupReveals();
    setupCountUp();
    setupMarquees();
  });

  mo.observe(main, { childList: true, subtree: true });
}

/* ─── Init ──────────────────────────────────────────────────────── */

export function initMotionSystem() {
  if (REDUCED) {
    document.documentElement.classList.add("prefers-reduced-motion");
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // initial state

  setupHeaderCondense();
  createProgressRail();
  createBackToTop();
  setupReveals();
  setupCountUp();
  setupMarquees();
  setupMutationObserver();
}
