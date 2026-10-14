/**
 * Phase 1 marketing-page behaviours, ported for React.
 *
 * These touch the DOM directly rather than being rewritten as state, because
 * the markup they drive was migrated verbatim from the Phase 1 prototype and
 * the brief asks for the existing UX to be preserved, not re-derived.
 * Each initialiser returns a cleanup function for useEffect.
 */

type Cleanup = () => void;

const $ = <T extends Element = Element>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);
const $$ = <T extends Element = Element>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

/** Sticky header shadow once the page scrolls. */
export function initHeader(): Cleanup {
  const hdr = $("#hdr");
  if (!hdr) return () => {};
  const onScroll = () => hdr.classList.toggle("stuck", window.scrollY > 8);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
  return () => removeEventListener("scroll", onScroll);
}

/** Reveal-on-scroll, plus the one-shot bar animations. */
export function initReveal(): Cleanup {
  const animate = (el: Element) => {
    el.classList.add("in");
    $$<HTMLElement>("i[data-w]", el).forEach((bar) => {
      bar.style.width = `${bar.dataset.w}%`;
    });
    $$<HTMLElement>(".arow[data-w]", el).forEach((row) => {
      const fill = $<HTMLElement>("i", row);
      if (fill) fill.style.width = `${row.dataset.w}%`;
    });
  };

  const all = $$(".r");

  if (!("IntersectionObserver" in window)) {
    all.forEach(animate);
    return () => {};
  }

  // Whatever is already on screen is shown without animating, before the
  // hidden state is switched on at all. The first paint already drew these
  // elements; hiding them in order to fade them back in is what used to delay
  // the largest paint by seconds, and it animates content the visitor has been
  // looking at since the page arrived.
  const offScreen: Element[] = [];
  for (const el of all) {
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) animate(el);
    else offScreen.push(el);
  }

  // Only now does anything become hidden, and only what is still out of sight.
  document.documentElement.classList.add("js-reveal");

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        animate(en.target);
        io.unobserve(en.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
  );
  offScreen.forEach((el) => io.observe(el));

  return () => {
    io.disconnect();
    document.documentElement.classList.remove("js-reveal");
  };
}

/** FAQ accordion — one panel open at a time. */
export function initFaq(): Cleanup {
  const items = $$("#faqlist .fq");
  const handlers: Array<[Element, () => void]> = [];

  items.forEach((fq) => {
    const btn = $(".fq-b", fq);
    const panel = $<HTMLElement>(".fq-p", fq);
    if (!btn || !panel) return;

    const onClick = () => {
      const isOpen = fq.classList.contains("on");
      $$("#faqlist .fq.on").forEach((open) => {
        open.classList.remove("on");
        const p = $<HTMLElement>(".fq-p", open);
        if (p) p.style.maxHeight = "";
      });
      if (!isOpen) {
        fq.classList.add("on");
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    };
    btn.addEventListener("click", onClick);
    handlers.push([btn, onClick]);
  });

  return () => handlers.forEach(([el, fn]) => el.removeEventListener("click", fn));
}


/** Student reviews carousel — pages by however many cards currently fit. */
export function initCarousel(): Cleanup {
  const track = $<HTMLElement>("#ttrack");
  const prev = $<HTMLButtonElement>("#tprev");
  const next = $<HTMLButtonElement>("#tnext");
  const dots = $<HTMLElement>("#tdots");
  if (!track || !prev || !next || !dots) return () => {};

  const cards = $$<HTMLElement>(".tcard", track);
  let page = 0;

  const perPage = () => (innerWidth <= 660 ? 1 : innerWidth <= 980 ? 2 : 3);
  const pages = () => Math.max(1, Math.ceil(cards.length / perPage()));

  const render = () => {
    const per = perPage();
    const total = pages();
    page = Math.min(page, total - 1);

    const step = cards[0].getBoundingClientRect().width + 22;
    track.style.transform = `translateX(${-page * step * per}px)`;
    prev.disabled = page === 0;
    next.disabled = page >= total - 1;

    if (dots.children.length !== total) {
      dots.innerHTML = "";
      for (let i = 0; i < total; i++) {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `Review page ${i + 1}`);
        b.dataset.page = String(i);
        dots.appendChild(b);
      }
    }
    $$(".tdots button", dots.parentElement ?? document).forEach((b, i) =>
      b.classList.toggle("on", i === page),
    );
  };

  const goPrev = () => { if (page > 0) { page--; render(); } };
  const goNext = () => { if (page < pages() - 1) { page++; render(); } };
  const onDot = (e: Event) => {
    const b = (e.target as Element).closest<HTMLElement>("button");
    if (b?.dataset.page) { page = Number(b.dataset.page); render(); }
  };

  let timer: ReturnType<typeof setTimeout>;
  const onResize = () => { clearTimeout(timer); timer = setTimeout(render, 120); };

  prev.addEventListener("click", goPrev);
  next.addEventListener("click", goNext);
  dots.addEventListener("click", onDot);
  addEventListener("resize", onResize);
  render();

  return () => {
    prev.removeEventListener("click", goPrev);
    next.removeEventListener("click", goNext);
    dots.removeEventListener("click", onDot);
    removeEventListener("resize", onResize);
    clearTimeout(timer);
  };
}

/** Currency switcher on the pricing grid (NZD primary, INR secondary). */
export function initPricing(): Cleanup {
  const buttons = $$<HTMLButtonElement>("#cur .curb");
  if (buttons.length === 0) return () => {};

  const apply = (cur: string) => {
    buttons.forEach((el) => {
      const active = el.dataset.cur === cur;
      el.classList.toggle("on", active);
      // The class is what the eye reads; this is what a screen reader reads.
      el.setAttribute("aria-pressed", String(active));
    });
    $$(".cur-label").forEach((l) => (l.textContent = cur));
    // Both figures were rendered on the server, so switching currency is a
    // text swap rather than a round trip — and the value can only ever be one
    // the database actually holds.
    $$<HTMLElement>("[data-price]").forEach((el) => {
      const value = cur === "INR" ? el.dataset.inr : el.dataset.nzd;
      if (value) el.textContent = value;
    });
    // The buy buttons point straight at checkout, so the choice made here has
    // to travel in their links too — otherwise someone switches to INR, clicks
    // Get, and is quoted in dollars.
    $$<HTMLAnchorElement>("a[data-cur-link]").forEach((a) => {
      a.href = a.href.replace(/([?&]currency=)(NZD|INR)/, `$1${cur}`);
    });
    // Written where the server can read it as well: the pricing page and
    // checkout render on the server, and they must agree with this toggle
    // without asking the student to choose a second time. localStorage stays
    // for the pages that were already reading it.
    try {
      document.cookie = `kpp_currency=${cur};path=/;max-age=${180 * 24 * 60 * 60};samesite=lax`;
    } catch {}
    try { localStorage.setItem("kpp.cur", cur); } catch {}
  };

  const handlers: Array<[HTMLButtonElement, () => void]> = [];
  buttons.forEach((b) => {
    const fn = () => apply(b.dataset.cur ?? "NZD");
    b.addEventListener("click", fn);
    handlers.push([b, fn]);
  });

  try {
    const fromCookie = /(?:^|;\s*)kpp_currency=(NZD|INR)/.exec(document.cookie)?.[1];
    const saved = fromCookie ?? localStorage.getItem("kpp.cur");
    if (saved === "NZD" || saved === "INR") apply(saved);
  } catch {}

  return () => handlers.forEach(([el, fn]) => el.removeEventListener("click", fn));
}

/**
 * Gives a long in-page jump a short animation of its own.
 *
 * The subject menu and the subject cards scroll to a pricing card rather than
 * navigating to a second copy of the prices. The browser will animate that,
 * but `scroll-behavior: smooth` sets the duration from the distance, and on a
 * phone the pricing section is sixteen thousand pixels down the home page --
 * a measured two seconds of travel through content nobody can read at that
 * speed, which reads as a page that will not load.
 *
 * Cutting the animation entirely was worse: arriving with no travel at all
 * gives the reader nothing to tell them the page moved rather than changed.
 * So the scroll is run here at a fixed duration regardless of distance --
 * long enough to see, short enough not to wait through.
 *
 * Short jumps are left to the browser, where its own timing is already
 * proportionate and there is nothing to improve.
 */
export function initAnchorJumps(): Cleanup {
  /** Beyond this many screens, the browser's own duration becomes a wait. */
  const FAR = 2.5;
  /** Long enough to read as movement, short enough not to be a delay. */
  const DURATION_MS = 420;

  const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

  /** Where the browser itself would have aligned this target. */
  function destinationOf(target: Element) {
    const scroller = document.scrollingElement ?? document.documentElement;
    const padding = parseFloat(getComputedStyle(scroller).scrollPaddingTop) || 0;
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const top = window.scrollY + target.getBoundingClientRect().top - padding - margin;
    const limit = document.documentElement.scrollHeight - window.innerHeight;
    return Math.max(0, Math.min(top, limit));
  }

  let animation = 0;

  function glide(to: number) {
    cancelAnimationFrame(animation);

    const from = window.scrollY;
    const travel = to - from;
    if (Math.abs(travel) < 2) return;

    const started = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - started) / DURATION_MS);
      window.scrollTo({ top: from + travel * easeOut(progress), behavior: "instant" });
      if (progress < 1) animation = requestAnimationFrame(step);
    };
    animation = requestAnimationFrame(step);
  }

  function onClick(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = (event.target as Element | null)?.closest?.("a");
    if (!(link instanceof HTMLAnchorElement)) return;
    if (link.target && link.target !== "_self") return;

    const href = link.getAttribute("href") ?? "";
    const hash = href.startsWith("#") ? href : href.startsWith("/#") ? href.slice(1) : "";
    if (hash.length < 2) return;

    // Only same-page jumps. A link to another page is a navigation, and the
    // browser arrives at the anchor with no scrolling to animate.
    if (href.startsWith("/#") && window.location.pathname !== "/") return;

    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;
    if (Math.abs(target.getBoundingClientRect().top) <= window.innerHeight * FAR) return;

    event.preventDefault();

    // Somebody who has asked for less motion gets none: the arrival is what
    // they came for, and the travel is the part they turned off.
    const stillness = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const to = destinationOf(target);
    if (stillness) window.scrollTo({ top: to, behavior: "instant" });
    else glide(to);

    // The address bar still has to name where the reader is, so the link can be
    // copied and the back button still works. Replacing rather than pushing
    // would lose the way back to the top of the page.
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash);
    }
  }

  // Capture phase, deliberately. React attaches its listeners to the root it
  // rendered into, which is below the document, so a bubbling listener here
  // runs after the Link has already begun its own smooth scroll -- and that
  // animation then plays over this one.  Capturing puts the decision first,
  // where preventDefault can still stop the navigation.
  document.addEventListener("click", onClick, true);
  return () => {
    cancelAnimationFrame(animation);
    document.removeEventListener("click", onClick, true);
  };
}
