"use strict";
(() => {
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const pipelineStages = [...document.querySelectorAll("[data-pipeline-stage]")];
  const pipelineLinks = [...document.querySelectorAll(".pipeline-connector")];

  window.addEventListener("skyforge:deploy-step", (event) => {
    const step = Number(event.detail?.step ?? -1);
    pipelineStages.forEach((stage, index) => {
      stage.classList.toggle("is-active", index === step);
      stage.classList.toggle("is-complete", index < step || step >= 4);
    });
    pipelineLinks.forEach((link, index) => link.classList.toggle("is-complete", index < step || step >= 4));
  });

  const statusCards = [...document.querySelectorAll("[data-status-service]")];
  const baseLatencies = [42, 31, 26, 18];
  let statusTick = 0;
  const updateStatus = () => {
    statusTick += 1;
    statusCards.forEach((card, index) => {
      const drift = ((statusTick * (index + 3)) % 9) - 4;
      const latency = Math.max(8, baseLatencies[index] + drift);
      const target = card.querySelector("[data-status-latency]");
      if (target) target.textContent = `${latency} ms`;
    });
    const updated = document.querySelector("#statusDemoUpdated");
    if (updated) updated.textContent = `Demo telemetry · updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
  };
  updateStatus();
  if (!reduced) setInterval(updateStatus, 5500);

  let metricTick = 0;
  const updateLiveMetrics = () => {
    metricTick += 1;
    const cpu = 29 + ((metricTick * 7) % 18);
    const ram = 4.7 + ((metricTick * 3) % 12) / 10;
    const cpuText = document.querySelector("[data-live-cpu]");
    const cpuBar = document.querySelector("[data-live-cpu-bar]");
    const ramText = document.querySelector("[data-live-ram]");
    const ramBar = document.querySelector("[data-live-ram-bar]");
    if (cpuText) cpuText.textContent = `${cpu.toFixed(1)}%`;
    if (cpuBar) cpuBar.style.setProperty("--meter", `${cpu.toFixed(1)}%`);
    if (ramText) ramText.textContent = `${ram.toFixed(1)} / 8 GB`;
    if (ramBar) ramBar.style.setProperty("--meter", `${((ram / 8) * 100).toFixed(1)}%`);
    document.querySelectorAll("[data-live-server-cpu]").forEach((el, index) => {
      const value = 18 + ((metricTick * (index + 5) * 3) % 28);
      el.textContent = `CPU ${value}%`;
    });
  };
  updateLiveMetrics();
  if (!reduced) setInterval(updateLiveMetrics, 3200);

  const reveal = [...document.querySelectorAll(".company-about-grid, .why-grid article, .security-matrix article, .project-card, .founder-card, .status-service-grid article")];
  if ("IntersectionObserver" in window && !reduced) {
    reveal.forEach((el) => el.classList.add("upgrade-reveal"));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("upgrade-visible");
      observer.unobserve(entry.target);
    }), { threshold: .1 });
    reveal.forEach((el) => observer.observe(el));
  }
})();
