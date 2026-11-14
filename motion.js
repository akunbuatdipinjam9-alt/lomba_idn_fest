"use strict";
(() => {
  if (!window.matchMedia || !window.IntersectionObserver) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia(
    "(min-width: 1000px) and (min-height: 740px)",
  );
  const root = document.documentElement;
  const dashboard = document.querySelector("#dashboard");
  const journey = document.querySelector(".network-journey");
  const ending = document.querySelector("#contact");
  const hero = document.querySelector(".hero");
  const nodes = [...document.querySelectorAll(".network-node")];
  const stages = ["overview", "compute", "analytics", "deployment"];
  const stepNav = document.createElement("nav");
  stepNav.className = "dashboard-story-steps";
  stepNav.setAttribute("aria-label", "Dashboard story chapters");
  stages.forEach((stage) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = stage[0].toUpperCase() + stage.slice(1);
    button.addEventListener("click", () => {
      if (desktop.matches && !reduced.matches) {
        const index = stages.indexOf(stage);
        const start =
          dashboard.getBoundingClientRect().top + window.scrollY - 85;
        const range = Math.max(
          1,
          dashboard.offsetHeight - window.innerHeight + 85,
        );
        window.scrollTo({
          top: start + range * ((index + 0.1) / 4),
          behavior: "smooth",
        });
      }
      state.console = stage;
      renderConsole();
      updateSteps();
    });
    stepNav.append(button);
  });
  dashboard.querySelector(".dashboard-shell").before(stepNav);
  const updateSteps = () =>
    [...stepNav.children].forEach((button, index) => {
      const active = stages[index] === state.console;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-current", active ? "step" : "false");
    });
  document
    .querySelectorAll("[data-console]")
    .forEach((button) => button.addEventListener("click", updateSteps));
  const revealElements = [
    ...document.querySelectorAll(
      "#about h2, #about .team-feature, #products .section-heading, #products .product-card, #pricing .section-heading, #pricing article, #faq .section-heading, .faq-list, #contact .cta-inner",
    ),
  ];
  revealElements.forEach((element, index) => {
    element.classList.add("scroll-reveal");
    element.style.setProperty(
      "--reveal-delay",
      `${element.matches(".product-card, article") ? (index % 4) * 90 : 0}ms`,
    );
  });
  const revealObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        }
      }),
    { threshold: 0.12 },
  );
  revealElements.forEach((element) => revealObserver.observe(element));
  const counted = new Set();
  const countObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting || counted.has(entry.target)) return;
        counted.add(entry.target);
        countObserver.unobserve(entry.target);
        if (reduced.matches) return;
        const element = entry.target;
        const goal = Number(element.dataset.count);
        const decimals = Number(element.dataset.decimals || 0);
        const start = performance.now();
        const tick = (time) => {
          const progress = reduced.matches
            ? 1
            : Math.min(1, (time - start) / 1050);
          element.textContent =
            (goal * (1 - Math.pow(1 - progress, 3))).toFixed(decimals) +
            element.dataset.suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    { threshold: 0.65 },
  );
  document
    .querySelectorAll("[data-count]")
    .forEach((element) => countObserver.observe(element));
  const clamp = (value) => Math.max(0, Math.min(1, value));
  let frame = 0;
  let chapter = -1;
  const update = () => {
    frame = 0;
    if (reduced.matches) return;
    const height = window.innerHeight;
    const networkRect = journey.getBoundingClientRect();
    const networkProgress = desktop.matches
      ? clamp(
          (140 - networkRect.top) /
            Math.max(1, journey.offsetHeight - height + 140),
        )
      : clamp(
          (height * 0.8 - networkRect.top) / Math.max(1, journey.offsetHeight),
        );
    journey.style.setProperty("--network-progress", networkProgress);
    nodes.forEach((node, index) =>
      node.classList.toggle("is-active", networkProgress >= index / 4),
    );
    const dashRect = dashboard.getBoundingClientRect();
    const visible = dashRect.top < height && dashRect.bottom > 0;
    dashboard.classList.toggle("is-in-view", visible);
    if (
      desktop.matches &&
      visible &&
      dashRect.top <= 85 &&
      dashRect.bottom >= height * 0.6
    ) {
      const progress = clamp(
        (85 - dashRect.top) / Math.max(1, dashboard.offsetHeight - height + 85),
      );
      const next = Math.min(3, Math.floor(progress * 4));
      if (chapter !== next) {
        chapter = next;
        state.console = stages[next];
        renderConsole();
        updateSteps();
      }
      const cpu = dashboard.querySelector(".dash-stat:nth-child(2) strong");
      if (cpu && next < 2)
        cpu.textContent = (28 + progress * 24).toFixed(1) + "%";
      if (next === 2) {
        const value = dashboard.querySelector(".dash-stat strong");
        if (value) value.textContent = (32 + progress * 14).toFixed(1) + "%";
      }
      dashboard
        .querySelectorAll(".scroll-deploy li")
        .forEach((item, index) =>
          item.classList.toggle(
            "is-complete",
            (progress - 0.75) * 4 >= index / 4,
          ),
        );
      const instance = dashboard.querySelector(".scroll-instance");
      if (instance) instance.style.opacity = progress >= 0.94 ? "1" : ".3";
    }
    if (hero.getBoundingClientRect().bottom > 0)
      hero.style.setProperty(
        "--hero-parallax",
        `${Math.min(28, window.scrollY * 0.045)}px`,
      );
    const endRect = ending.getBoundingClientRect();
    ending.style.setProperty(
      "--ending-progress",
      clamp((height - endRect.top) / (height + endRect.height)),
    );
  };
  const queueUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const configure = () => {
    root.classList.toggle("motion-ready", !reduced.matches);
    document
      .querySelector("#consoleContent")
      .setAttribute(
        "aria-live",
        desktop.matches && !reduced.matches ? "off" : "polite",
      );
    if (reduced.matches) {
      revealElements.forEach((element) => element.classList.add("is-revealed"));
      journey.style.setProperty("--network-progress", 1);
      nodes.forEach((node) => node.classList.add("is-active"));
      dashboard
        .querySelectorAll(".scroll-deploy li")
        .forEach((item) => item.classList.add("is-complete"));
    }
    chapter = -1;
    queueUpdate();
  };
  window.addEventListener("scroll", queueUpdate, { passive: true });
  window.addEventListener("resize", queueUpdate, { passive: true });
  reduced.addEventListener("change", configure);
  desktop.addEventListener("change", configure);
  document.querySelectorAll(".faq-list details").forEach((detail) => {
    const summary = detail.querySelector("summary");
    const body = detail.querySelector("p");
    let animation;
    summary.addEventListener("click", (event) => {
      if (reduced.matches || !body.animate) return;
      event.preventDefault();
      if (animation) animation.cancel();
      const closing = detail.open;
      if (!closing) detail.open = true;
      const full = body.scrollHeight;
      animation = body.animate(
        closing
          ? [
              { height: `${full}px`, opacity: 1 },
              { height: "0px", opacity: 0 },
            ]
          : [
              { height: "0px", opacity: 0 },
              { height: `${full}px`, opacity: 1 },
            ],
        { duration: 230, easing: "ease-out" },
      );
      body.style.overflow = "hidden";
      animation.onfinish = () => {
        if (closing) detail.open = false;
        body.style.overflow = "";
        animation = null;
      };
    });
  });
  updateSteps();
  configure();
})();
