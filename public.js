"use strict";

(() => {
  const currency = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
  const rates = { cpu: 65000, ram: 25000, ssd: 237.5, annualDiscount: 0.2 };
  const historyDays = 90;
  const services = [
    { name: "Compute", incidents: [] },
    { name: "Storage", incidents: [] },
    { name: "Network", incidents: [{ day: 22, minutes: 18 }] },
    { name: "Database", incidents: [{ day: 61, minutes: 10 }] },
    { name: "API", incidents: [] },
  ];
  let toastTimer;

  function money(amount) {
    return "Rp" + currency.format(Math.round(amount));
  }

  function showToast(message) {
    const toast = document.querySelector("#publicToast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2500);
  }

  function estimatePrice(configuration) {
    const compute = configuration.cpu * rates.cpu;
    const memory = configuration.ram * rates.ram;
    const storage = configuration.ssd * rates.ssd;
    const subtotal = (compute + memory + storage) * configuration.region;
    const monthly = Math.round(
      subtotal * (configuration.annual ? 1 - rates.annualDiscount : 1),
    );
    return { compute, memory, storage, monthly, yearly: monthly * 12 };
  }

  function setupCalculator() {
    const form = document.querySelector("#calculatorForm");
    if (!form) return;
    const outputs = Object.fromEntries(
      [
        ["cpu", "cpuValue"],
        ["ram", "ramValue"],
        ["ssd", "ssdValue"],
        ["total", "calcTotal"],
        ["breakdown", "calcBreakdown"],
        ["billing", "calcAnnual"],
      ].map(([name, id]) => [name, document.getElementById(id)]),
    );

    function updateEstimate() {
      const fields = form.elements;
      const configuration = {
        cpu: Number(fields.cpu.value),
        ram: Number(fields.ram.value),
        ssd: Number(fields.ssd.value),
        region: Number(fields.region.value),
        annual: fields.period.value === "yearly",
      };
      const estimate = estimatePrice(configuration);
      const items = [
        [`Compute · ${configuration.cpu} vCPU`, money(estimate.compute)],
        [`Memory · ${configuration.ram} GB`, money(estimate.memory)],
        [`SSD · ${configuration.ssd} GB`, money(estimate.storage)],
        ["Faktor region", `× ${configuration.region}`],
      ];
      if (configuration.annual) items.push(["Diskon tahunan", "20%"]);
      outputs.cpu.textContent = configuration.cpu;
      outputs.ram.textContent = `${configuration.ram} GB`;
      outputs.ssd.textContent = `${configuration.ssd} GB`;
      outputs.total.textContent = money(estimate.monthly);
      outputs.breakdown.innerHTML = items
        .map(
          ([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`,
        )
        .join("");
      outputs.billing.textContent = configuration.annual
        ? `Total tahunan simulasi: ${money(estimate.yearly)}`
        : "Estimasi bulanan simulasi. Tidak ada biaya yang ditarik.";
    }
    form.addEventListener("input", updateEstimate);
    form.addEventListener("change", updateEstimate);
    form.addEventListener("submit", (event) => event.preventDefault());
    updateEstimate();
  }

  function renderServiceHistory(service, region) {
    const downtime = service.incidents.reduce(
      (minutes, incident) => minutes + incident.minutes,
      0,
    );
    const uptime = ((1 - downtime / (historyDays * 24 * 60)) * 100).toFixed(3);
    const bars = Array.from({ length: historyDays }, (_, day) => {
      const incident = service.incidents.some((entry) => entry.day === day);
      const status = incident ? "Degraded" : "Operational";
      return `<i class="${incident ? "incident" : ""}" title="Hari ${day + 1} · ${status} (simulasi)"></i>`;
    }).join("");
    return `<article class="service-status">
      <header><strong>${service.name} · ${region}</strong><span>Operational · ${uptime}% demo uptime</span></header>
      <div class="uptime-bars" role="img" aria-label="${service.name}: ${historyDays} hari contoh, ${service.incidents.length} hari dengan insiden simulasi">${bars}</div>
      <div class="uptime-legend"><span>90 hari lalu · contoh</span><span>Hijau operational · kuning incident</span><span>Hari ini</span></div>
    </article>`;
  }

  function setupStatusPage() {
    const container = document.querySelector("#serviceStatus");
    if (!container) return;
    const regionSelect = document.querySelector("#statusRegion");
    const caption = document.querySelector("#statusUpdated");
    function updateRegion() {
      const region =
        regionSelect.value === "Singapore" ? "Singapore" : "Jakarta";
      caption.textContent = `Dataset contoh ${historyDays} hari · region ${region}`;
      container.innerHTML = services
        .map((service) => renderServiceHistory(service, region))
        .join("");
    }
    regionSelect.addEventListener("change", updateRegion);
    updateRegion();
  }

  function setupCodeSamples() {
    document.querySelectorAll("[data-copy-code]").forEach((button) => {
      button.addEventListener("click", async () => {
        const command = button.parentElement.querySelector("code").textContent;
        try {
          await navigator.clipboard.writeText(command);
          showToast("Command disalin. Tidak ada perintah yang dijalankan.");
        } catch {
          showToast("Clipboard tidak tersedia. Pilih teks lalu salin manual.");
        }
      });
    });
  }

  function setupNetworkMap() {
    const button = document.querySelector("#testRoute");
    if (!button) return;
    const route = document.querySelector("#mapRoute");
    const output = document.querySelector("#mapOutput");
    button.addEventListener("click", () => {
      output.textContent = `Demo ping: ${Number(route.value)} ms · 3/3 packets received · simulated`;
      showToast("Hasil dari dataset demo, tanpa mengirim paket jaringan.");
    });
  }

  setupCalculator();
  setupStatusPage();
  setupCodeSamples();
  setupNetworkMap();
})();
