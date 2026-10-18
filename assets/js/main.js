/* Tig portfolio — behavior layer
   Native APIs only: IntersectionObserver, <dialog>, Clipboard API.
   Motion-independent by default; reduced motion disables tick + reveals. */

(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* Footer year */
  const yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Header background after scroll */
  const header = $("[data-header]");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });

  /* Active section in nav */
  const navLinks = $$("[data-navlink]");
  const sectionIds = navLinks.map((a) => a.getAttribute("href").slice(1)).filter(Boolean);
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) =>
          a.classList.toggle(
            "is-active",
            a.getAttribute("href") === "#" + entry.target.id
          )
        );
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (section) activeObserver.observe(section);
  });

  /* Mobile menu */
  const menuBtn = $("[data-menu-btn]");
  const overlay = $("#menuOverlay");
  const setMenu = (open) => {
    menuBtn.setAttribute("aria-expanded", String(open));
    overlay.hidden = !open;
    menuBtn.textContent = open ? "Close" : "Menu";
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      const first = overlay.querySelector("a");
      if (first) first.focus();
    } else {
      menuBtn.focus();
    }
  };
  menuBtn.addEventListener("click", () => setMenu(overlay.hidden));
  $$("[data-menuclose]").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) setMenu(false);
  });

  /* Scroll reveal — progressive enhancement only */
  const revealEls = $$("[data-reveal]");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* Timecode ticker on work frames (purely visual) */
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  const timecode = (frames) => {
    const f = Math.floor(frames) % 24;
    const s = Math.floor(frames / 24) % 60;
    const m = Math.floor(frames / 1440) % 60;
    const h = Math.floor(frames / 86400);
    return "TC " + [pad(h), pad(m), pad(s), pad(f)].join(":");
  };
  $$(".play-frame").forEach((frame) => {
    const tc = $(".tc", frame);
    if (!tc || reducedMotion.matches) return;
    let raf = 0;
    let count = 0;
    const stop = () => {
      cancelAnimationFrame(raf);
      tc.textContent = "TC 00:00:00:00";
    };
    const start = () => {
      let last = performance.now();
      cancelAnimationFrame(raf);
      const tick = (now) => {
        const step = Math.max(1, Math.round((now - last) / 41.7));
        last = now;
        count += step;
        tc.textContent = timecode(count);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    frame.addEventListener("mouseenter", start);
    frame.addEventListener("mouseleave", stop);
    frame.addEventListener("focusin", start);
    frame.addEventListener("focusout", stop);
  });

  /* Player modal — one dialog, YouTube loads only when opened */
  const dlg = $("#player");
  const stage = $("#playerStage");
  const playerTitle = $("#playerTitle");
  const playerMeta = $("#playerMeta");
  const playerLink = $("#playerLink");
  let lastInvoker = null;

  const openPlayer = (btn) => {
    lastInvoker = btn;
    const id = btn.getAttribute("data-yt");
    playerTitle.textContent = btn.getAttribute("data-title") || "Video";
    playerMeta.textContent = "YOUTUBE — loads on open, not on page load";
    playerLink.href = "https://youtu.be/" + id;
    stage.innerHTML =
      '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&rel=0" title="YouTube video player" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe>';
    dlg.showModal();
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-yt]");
    if (btn) {
      e.preventDefault();
      openPlayer(btn);
    }
  });

  const closePlayer = () => {
    stage.innerHTML = "";
    dlg.close();
  };

  dlg.addEventListener("close", () => {
    stage.innerHTML = "";
    if (lastInvoker) lastInvoker.focus();
  });

  $("[data-player-close]").addEventListener("click", closePlayer);

  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) closePlayer(); /* backdrop click */
  });

  /* Copy email */
  const copyBtn = $("[data-copy]");
  if (copyBtn) {
    const label = $("[data-copy-label]", copyBtn);
    const done = (msg) => {
      label.textContent = msg;
      copyBtn.classList.add("is-copied");
      setTimeout(() => {
        label.textContent = "COPY";
        copyBtn.classList.remove("is-copied");
      }, 1600);
    };
    copyBtn.addEventListener("click", async () => {
      const value = copyBtn.getAttribute("data-copy");
      try {
        await navigator.clipboard.writeText(value);
        done("COPIED");
      } catch {
        /* Legacy fallback for older browsers */
        const input = document.createElement("input");
        input.value = value;
        input.setAttribute("readonly", "");
        input.style.cssText = "position:absolute;left:-9999px";
        document.body.appendChild(input);
        input.select();
        try {
          document.execCommand("copy");
          done("COPIED");
        } catch {
          done("CTRL+C");
        }
        input.remove();
      }
    });
  }
})();
