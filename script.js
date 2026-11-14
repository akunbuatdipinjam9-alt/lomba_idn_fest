"use strict";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const readStored = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeStored = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};
const removeStored = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};
const state = {
  lang: readStored("skyforge-lang") === "id" ? "id" : "en",
  theme: readStored("skyforge-theme") === "dark" ? "dark" : "light",
  billing: "monthly",
  region: "jkt",
  console: "overview",
  solution: "web",
  deploying: false,
  deployed: false,
  brief: null,
  members: [
    { name: "Workspace owner", email: "owner@example.com", role: "Owner" },
    { name: "Developer", email: "developer@example.com", role: "Developer" },
    { name: "Finance", email: "finance@example.com", role: "Billing" },
  ],
};
const L = (en, id) => (state.lang === "id" ? id : en);
const icon = (name) =>
  `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);
const regions = {
  jkt: { name: "Jakarta", code: "JKT-1", latency: 8 },
  sgp: { name: "Singapore", code: "SGP-1", latency: 12 },
  tyo: { name: "Tokyo", code: "TYO-1", latency: 48 },
};
let toastTimer;
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 3800);
}
function translateElements(root = document) {
  $$("[data-id]", root).forEach((el) => {
    if (!el.dataset.en) el.dataset.en = el.textContent;
    el.textContent = state.lang === "id" ? el.dataset.id : el.dataset.en;
  });
}
function applyLanguage() {
  document.documentElement.lang = state.lang;
  translateElements();
  $("#langToggle").firstChild.textContent = state.lang.toUpperCase();
  $("#langToggle").setAttribute(
    "aria-label",
    state.lang === "en"
      ? "Switch language to Indonesian"
      : "Ganti bahasa ke Inggris",
  );
  $("#themeToggle").setAttribute(
    "aria-label",
    L("Toggle dark mode", "Ganti mode gelap"),
  );
  $("#navToggle").setAttribute(
    "aria-label",
    L("Toggle navigation", "Buka atau tutup navigasi"),
  );
  $$("[data-close-dialog]").forEach((b) =>
    b.setAttribute("aria-label", L("Close dialog", "Tutup dialog")),
  );
  $(".skip-link").textContent = L("Skip to content", "Langsung ke konten");
  $$(".region-latency small").forEach(
    (el) => (el.textContent = L("Sample latency", "Latensi contoh")),
  );
  updatePricing();
  renderSolution();
  renderConsole();
  if (!state.deploying) {
    $("#deployStep").textContent =
      `${state.deployed ? 4 : 0} / 4 ${L("steps", "langkah")}`;
    $("#deployStatus").textContent = state.deployed
      ? L("COMPLETE", "SELESAI")
      : L("READY", "SIAP");
    if (!state.deployed)
      $("#deployLog").innerHTML =
        `<p class="terminal-muted">${L("Start a demo deployment to view the steps.", "Jalankan deployment demo untuk melihat tahapannya.")}</p>`;
  }
}
function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  $("#themeToggle").setAttribute(
    "aria-pressed",
    String(state.theme === "dark"),
  );
}
function updatePricing() {
  const yearly = state.billing === "yearly";
  $$("[data-billing]").forEach((button) => {
    const active = button.dataset.billing === state.billing;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  $$("[data-price]").forEach(
    (el) =>
      (el.textContent = money(
        Number(el.dataset.price) * 1000 * (yearly ? 0.8 : 1),
      )),
  );
  $$("[data-annual]").forEach((el) => {
    el.textContent = yearly
      ? L(
          `Rp${money(Number(el.dataset.annual) * 1000 * 0.8 * 12)} billed yearly`,
          `Rp${money(Number(el.dataset.annual) * 1000 * 0.8 * 12)} ditagih per tahun`,
        )
      : L("Billed monthly", "Ditagih bulanan");
  });
}
const solutions = {
  web: {
    title: [
      "Ship your application. Keep your focus.",
      "Rilis aplikasimu. Tetap fokus.",
    ],
    description: [
      "A straightforward foundation for your frontend, API and application data. Keep each layer connected without losing sight of the whole picture.",
      "Fondasi praktis untuk frontend, API, dan data aplikasi. Hubungkan setiap bagian tanpa kehilangan gambaran keseluruhan.",
    ],
    nodes: [
      ["globe", "Users / edge"],
      ["server", "Forge Compute"],
      ["database", "PostgreSQL"],
    ],
    detail: [
      "Separate application and database resources as your project grows.",
      "Pisahkan resource aplikasi dan database seiring perkembangan proyek.",
    ],
  },
  commerce: {
    title: [
      "Make room for your busiest days.",
      "Beri ruang untuk hari tersibukmu.",
    ],
    description: [
      "A practical starting point for product catalogs, storefronts and order data. Store your media separately and give your application room to grow.",
      "Titik awal untuk katalog produk, toko online, dan data pesanan. Simpan media secara terpisah agar aplikasi punya ruang berkembang.",
    ],
    nodes: [
      ["box", "Product media"],
      ["grid", "App Platform"],
      ["database", "Order database"],
    ],
    detail: [
      "Keep product images in object storage and transaction data in a database.",
      "Simpan foto produk di object storage dan data transaksi di database.",
    ],
  },
  teams: {
    title: [
      "One workspace. Clear responsibilities.",
      "Satu workspace. Tanggung jawab jelas.",
    ],
    description: [
      "Bring developers and operations together with a role for each responsibility. Keep projects organized without sharing the same credentials.",
      "Satukan developer dan tim operasional dengan peran yang sesuai. Atur proyek tanpa berbagi kredensial yang sama.",
    ],
    nodes: [
      ["users", "Your team"],
      ["lock", "Access roles"],
      ["grid", "Workspaces"],
    ],
    detail: [
      "Explore role changes in the Team & access console preview.",
      "Coba perubahan peran di preview console Tim & akses.",
    ],
  },
};
function renderSolution() {
  const data = solutions[state.solution];
  $("#solutionTitle").textContent = L(...data.title);
  $("#solutionDescription").textContent = L(...data.description);
  $("#architecture").innerHTML = data.nodes
    .map(
      (node, index) =>
        `${index ? icon("arrow") : ""}<div class="architecture-node">${icon(node[0])}<span>${node[1]}</span></div>`,
    )
    .join("");
  $("#solutionDetail").innerHTML =
    icon("check") + escapeHTML(L(...data.detail));
  const tabs = $$("[data-solution]");
  tabs.forEach((tab) => {
    const active = tab.dataset.solution === state.solution;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  $("#solutionPanel").setAttribute("aria-labelledby", `tab-${state.solution}`);
  $(".solution-panel-top>span:last-child").textContent =
    `0${Object.keys(solutions).indexOf(state.solution) + 1} / 03`;
}
function selectRegion(code, announce = true) {
  if (!regions[code]) return;
  state.region = code;
  window.dispatchEvent(new CustomEvent("skyforge:region", { detail: { code } }));
  $("#regionSelect").value = code;
  $$("[data-region]").forEach((button) => {
    const active = button.dataset.region === code;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderConsole();
  if (announce)
    toast(
      L(
        `Preview region changed to ${regions[code].name}.`,
        `Region preview diganti ke ${regions[code].name}.`,
      ),
    );
}
const liveChip = () =>
  `<span class="live-chip"><i class="dot"></i>${L("Running", "Berjalan")}</span>`;
function table(caption, headers, rows) {
  return `<div class="console-table-wrapper"><table class="console-table"><caption>${escapeHTML(caption)}</caption><thead><tr>${headers.map((x) => `<th scope="col">${escapeHTML(x)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function stats(items) {
  return `<div class="dash-stats">${items.map((x) => `<div class="dash-stat"><span>${icon(x[0])}${x[1]}</span><strong>${x[2]}</strong><small>${x[3]}</small></div>`).join("")}</div>`;
}
function consoleHead(title, description, action = "") {
  return `<div class="console-section-head"><div><h3>${title}</h3><p>${description}</p></div>${action}</div>`;
}
function renderConsole() {
  const names = {
    overview: L("Overview", "Ringkasan"),
    compute: "Compute",
    analytics: "Analytics",
    deployment: "Deployment",
    storage: "Object Storage",
    database: "Databases",
    team: L("Team & access", "Tim & akses"),
  };
  const region = regions[state.region];
  $("#consoleCrumb").textContent = names[state.console];
  $$("[data-console]").forEach((button) => {
    const active = button.dataset.console === state.console;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  let content = "";
  const deployAction = `<button class="btn primary" data-console-deploy>${icon("plus")}${L("Deploy instance", "Deploy instance")}</button>`;
  const instances = [
    [
      icon("server") + "web-production-01",
      "4 vCPU / 8 GB",
      region.code,
      liveChip(),
    ],
    [
      icon("server") + "api-production-01",
      "2 vCPU / 4 GB",
      region.code,
      liveChip(),
    ],
    [icon("server") + "worker-01", "2 vCPU / 4 GB", region.code, liveChip()],
    [icon("server") + "staging-01", "1 vCPU / 2 GB", region.code, liveChip()],
  ];
  if (state.deployed)
    instances.push([
      icon("server") + "web-production-02",
      "4 vCPU / 8 GB",
      region.code,
      liveChip(),
    ]);
  if (state.console === "overview" || state.console === "compute") {
    content = consoleHead(
      state.console === "overview"
        ? L(
            "Instance status and resource usage.",
            "Status instance dan pemakaian resource.",
          )
        : L("Compute instances", "Compute instances"),
      L(
        `Production workspace · ${region.name}`,
        `Workspace produksi · ${region.name}`,
      ),
      deployAction,
    );
    content += stats([
      [
        "server",
        L("Active instances", "Instance aktif"),
        String(instances.length),
        "Linux / NVMe",
      ],
      [
        "activity",
        L("CPU utilization", "Penggunaan CPU"),
        "32.8%",
        L("Sample last-hour usage", "Contoh pemakaian 1 jam"),
      ],
      [
        "globe",
        L("Network latency", "Latensi jaringan"),
        region.latency + " ms",
        L("Illustrative, not measured", "Ilustratif, bukan pengukuran"),
      ],
    ]);
    if (state.console === "overview") {
      content += `<div class="console-live-grid" aria-label="Demo resource monitoring">
        <div class="console-live-card"><span>${L("CPU usage", "Penggunaan CPU")} <b class="demo-badge-inline">DEMO</b></span><strong data-live-cpu>32.8%</strong><div class="console-meter"><i data-live-cpu-bar style="--meter:32.8%"></i></div><small>${icon("activity")}${L("Last 60 sec", "60 detik terakhir")}</small></div>
        <div class="console-live-card"><span>${L("RAM usage", "Penggunaan RAM")} <b class="demo-badge-inline">DEMO</b></span><strong data-live-ram>5.2 / 8 GB</strong><div class="console-meter"><i data-live-ram-bar style="--meter:65%"></i></div><small>${icon("server")}${L("Allocated memory", "Memori teralokasi")}</small></div>
        <div class="console-live-card"><span>${L("Storage usage", "Penggunaan storage")} <b class="demo-badge-inline">DEMO</b></span><strong>148 / 500 GB</strong><div class="console-meter"><i style="--meter:29.6%"></i></div><small>${icon("box")}NVMe + Object Storage</small></div>
        <div class="console-live-card"><span>${L("Project status", "Status project")}</span><strong>${L("Healthy", "Normal")}</strong><small><i class="dot"></i>web-production</small></div>
        <div class="console-live-card"><span>${L("Server monitoring", "Monitoring server")}</span><strong>${instances.length}/${instances.length}</strong><small><i class="dot"></i>${L("Instances online", "Instance online")}</small></div>
      </div>`;
      content += `<div class="console-server-monitor" aria-label="Demo server monitoring">
        <div class="console-server-row"><strong>web-production-01</strong><span data-live-server-cpu>CPU 28%</span><span>RAM 4.8 GB</span><em>● healthy</em></div>
        <div class="console-server-row"><strong>api-production-01</strong><span data-live-server-cpu>CPU 21%</span><span>RAM 2.1 GB</span><em>● healthy</em></div>
        <div class="console-server-row"><strong>worker-01</strong><span data-live-server-cpu>CPU 37%</span><span>RAM 1.8 GB</span><em>● healthy</em></div>
      </div>`;
    }
    content += table(
      L("Your instances", "Instance kamu"),
      [
        L("INSTANCE NAME", "NAMA INSTANCE"),
        L("RESOURCES", "RESOURCE"),
        "REGION",
        "STATUS",
      ],
      instances,
    );
  }
  if (state.console === "storage") {
    content = consoleHead(
      "Object Storage",
      L(
        "A home for your media, assets and backups.",
        "Tempat untuk media, aset, dan backup.",
      ),
    );
    content += stats([
      [
        "box",
        L("Buckets", "Bucket"),
        "3",
        L("Example storage resources", "Contoh resource storage"),
      ],
      [
        "database",
        L("Storage used", "Storage terpakai"),
        "148 GB",
        L("Of 500 GB allocated", "Dari 500 GB alokasi"),
      ],
      ["shield", "Versioning", L("Enabled", "Aktif"), "S3-compatible API"],
    ]);
    content += table(
      L("Storage buckets", "Bucket storage"),
      ["BUCKET", L("USAGE", "PEMAKAIAN"), "REGION", L("ACCESS", "AKSES")],
      [
        ["media-assets", "68 GB", region.code, L("Private", "Privat")],
        ["app-backups", "74 GB", region.code, L("Private", "Privat")],
        ["public-static", "6 GB", region.code, L("Public read", "Baca publik")],
      ],
    );
  }
  if (state.console === "database") {
    content = consoleHead(
      "Managed Databases",
      L(
        "Keep application data organized.",
        "Kelola data aplikasi dengan rapi.",
      ),
    );
    content += stats([
      ["database", L("Clusters", "Cluster"), "2", "PostgreSQL / MySQL"],
      [
        "activity",
        L("Connections", "Koneksi"),
        "28",
        L("Sample active connections", "Contoh koneksi aktif"),
      ],
      [
        "shield",
        L("Backups", "Backup"),
        "Daily",
        L("Example backup policy", "Contoh kebijakan backup"),
      ],
    ]);
    content += table(
      L("Database clusters", "Cluster database"),
      ["DATABASE", "ENGINE", "REGION", "STATUS"],
      [
        ["production-db", "PostgreSQL 16", region.code, liveChip()],
        ["analytics-db", "MySQL 8", region.code, liveChip()],
      ],
    );
  }
  if (state.console === "team") {
    const action = `<button class="btn primary" data-add-member>${icon("plus")}${L("Add preview member", "Tambah anggota contoh")}</button>`;
    content = consoleHead(
      L("Everyone in the right place.", "Akses sesuai tanggung jawab."),
      L(
        "Sample workspace · changes stay in this preview.",
        "Workspace contoh · perubahan hanya berlaku di preview.",
      ),
      action,
    );
    content += stats([
      [
        "users",
        L("Members", "Anggota"),
        String(state.members.length),
        L("Illustrative accounts", "Akun contoh"),
      ],
      [
        "lock",
        L("Access model", "Model akses"),
        "RBAC",
        L("Role-based permissions", "Izin berdasarkan peran"),
      ],
      ["shield", L("Workspaces", "Workspace"), "1", "SKYFORGE workspace"],
    ]);
    const rows = state.members.map((member, index) => [
      escapeHTML(member.name),
      escapeHTML(member.email),
      index === 0
        ? '<span class="team-role">Owner</span>'
        : `<select class="table-role-select" data-role-index="${index}" aria-label="${L("Role for", "Peran untuk")} ${escapeHTML(member.name)}">${["Developer", "Billing", "Viewer"].map((role) => `<option${role === member.role ? " selected" : ""}>${role}</option>`).join("")}</select>`,
    ]);
    content += table(
      L("Workspace members", "Anggota workspace"),
      [L("MEMBER", "ANGGOTA"), "EMAIL", L("ROLE", "PERAN")],
      rows,
    );
    content += `<p class="console-empty-note">${icon("lock")}${L("No invitations are sent. These are sample accounts.", "Tidak ada undangan terkirim. Seluruh akun merupakan contoh.")}</p>`;
  }
  if (state.console === "analytics") {
    content = consoleHead(
      L("Performance in motion", "Performa dalam gerakan"),
      L(
        "Illustrative telemetry · scroll-driven demo",
        "Telemetri ilustratif · demo mengikuti scroll",
      ),
    );
    content += stats([
      ["activity", "CPU", "32.8%", "Sample utilization"],
      ["globe", "Requests / min", "1,284", "Simulated traffic"],
      ["server", "Healthy instances", "4 / 4", "Demo environment"],
    ]);
    content +=
      '<div class="motion-chart"><span>CPU UTILIZATION · SAMPLE</span><svg viewBox="0 0 600 150" role="img" aria-label="Illustrative CPU utilization graph"><path class="chart-grid" d="M0 30H600M0 75H600M0 120H600"/><path class="cpu-line" d="M0 115L25 100L50 108L75 68L100 82L125 45L150 75L175 58L200 90L225 66L250 80L275 38L300 62L325 48L350 73L375 40L400 60L425 30L450 55L475 43L500 75L525 52L550 70L575 42L600 58"/></svg></div>';
  }
  if (state.console === "deployment") {
    content = consoleHead(
      L("From commit to running", "Dari commit menjadi aktif"),
      L(
        "Scroll-driven deployment simulation · no server is created",
        "Simulasi deployment mengikuti scroll · tidak membuat server",
      ),
    );
    content +=
      '<ol class="scroll-deploy"><li>Build image <span>✓</span></li><li>Configure network <span>✓</span></li><li>Start instance <span>✓</span></li><li>Health check <span>✓</span></li></ol><div class="scroll-instance"><i class="dot"></i> web-production-02 <strong>Running · demo</strong></div>';
  }
  $("#consoleContent").innerHTML = content;
}
function openInfo(title, html) {
  $("#infoTitle").textContent = title;
  $("#infoBody").innerHTML = html;
  if (!$("#infoDialog").open) $("#infoDialog").showModal();
}
function openBrief(plan) {
  if ($("#infoDialog").open) $("#infoDialog").close();
  const form = $("#briefForm");
  if (
    plan &&
    ["Starter", "Professional", "Business", "Custom"].includes(plan)
  ) {
    form.elements.plan.value = plan;
    form.hidden = false;
    $("#briefResult").hidden = true;
  }
  $("#briefDialog").showModal();
}
function briefText() {
  if (!state.brief) return "";
  const b = state.brief;
  return `SKYFORGE — PROJECT BRIEF\n\nSubmission ID: ${b.submissionId || "Not submitted"}\nName: ${b.name}\nEmail: ${b.email}\nCompany: ${b.company || "—"}\nService: ${b.service || "—"}\nPlan: ${b.plan}\nPreferred region: ${b.preferredRegion || b.region || "—"}\nBilling: ${b.billing}\nSubmitted: ${b.submittedAt || b.saved || "—"}\n\nProject description\n${b.message}\n\nSubmitted through the SKYFORGE project consultation form.\n`;
}
async function runDeployment() {
  if (state.deploying) return;
  state.deploying = true;
  const button = $("#deployBtn");
  button.disabled = true;
  const steps = [
    ["Building container image", "Membangun container image"],
    ["Running automated tests", "Menjalankan automated test"],
    ["Deploying release to selected region", "Mendeploy release ke region terpilih"],
    ["Running health checks and starting service", "Menjalankan health check dan mengaktifkan service"],
  ];
  $("#deployLog").replaceChildren();
  $("#deployBar").style.width = "0%";
  $("#deployPercent").textContent = "0%";
  $("#deployStep").textContent = `0 / 4 ${L("steps", "langkah")}`;
  $("#deployStatus").textContent = L("DEPLOYING", "BERJALAN");
  button.firstElementChild.textContent = L("Deploying…", "Memproses…");
  window.dispatchEvent(new CustomEvent("skyforge:deploy-step", { detail: { step: -1 } }));
  for (let index = 0; index < steps.length; index++) {
    window.dispatchEvent(new CustomEvent("skyforge:deploy-step", { detail: { step: index } }));
    await new Promise((resolve) => setTimeout(resolve, 750));
    const line = document.createElement("p");
    line.innerHTML = `<span class="log-tick">✓</span><span>${escapeHTML(L(...steps[index]))}</span><span class="log-time">${(index + 1) * 12}s</span>`;
    $("#deployLog").append(line);
    $("#deployBar").style.width = `${(index + 1) * 25}%`;
    $("#deployPercent").textContent = `${(index + 1) * 25}%`;
    $("#deployStep").textContent = `${index + 1} / 4 ${L("steps", "langkah")}`;
  }
  const result = document.createElement("p");
  result.className = "log-success";
  result.textContent = L(
    "✓ Preview complete. Your sample instance is ready.",
    "✓ Preview selesai. Instance contoh sudah siap.",
  );
  $("#deployLog").append(result);
  $("#deployStatus").textContent = L("COMPLETE", "SELESAI");
  window.dispatchEvent(new CustomEvent("skyforge:deploy-step", { detail: { step: 4 } }));
  state.deploying = false;
  state.deployed = true;
  button.disabled = false;
  button.firstElementChild.textContent = L("Run again", "Jalankan lagi");
  renderConsole();
  toast(
    L(
      "Simulation complete. See your sample instance in the console.",
      "Simulasi selesai. Lihat instance contoh di console.",
    ),
  );
}
function scrollToId(id) {
  const target = document.getElementById(id);
  if (target)
    target.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
}
function closeNav() {
  $("#navMenu").classList.remove("open");
  $("#navToggle").setAttribute("aria-expanded", "false");
  $("#productDropdown").hidden = true;
  $("#productMenu").setAttribute("aria-expanded", "false");
}
$("#langToggle").addEventListener("click", () => {
  state.lang = state.lang === "en" ? "id" : "en";
  writeStored("skyforge-lang", state.lang);
  applyLanguage();
});
$("#themeToggle").addEventListener("click", () => {
  state.theme = state.theme === "light" ? "dark" : "light";
  writeStored("skyforge-theme", state.theme);
  applyTheme();
});
$("#navToggle").addEventListener("click", () => {
  const open = $("#navMenu").classList.toggle("open");
  $("#navToggle").setAttribute("aria-expanded", String(open));
});
$("#productMenu").addEventListener("click", () => {
  const willOpen = $("#productDropdown").hidden;
  $("#productDropdown").hidden = !willOpen;
  $("#productMenu").setAttribute("aria-expanded", String(willOpen));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNav();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".dropdown")) {
    $("#productDropdown").hidden = true;
    $("#productMenu").setAttribute("aria-expanded", "false");
  }
  if (!event.target.closest(".header")) closeNav();
});
$$("#navMenu a").forEach((link) => link.addEventListener("click", closeNav));
$$("[data-billing]").forEach((button) =>
  button.addEventListener("click", () => {
    state.billing = button.dataset.billing;
    updatePricing();
  }),
);
$$("[data-solution]").forEach((button) => {
  button.addEventListener("click", () => {
    state.solution = button.dataset.solution;
    renderSolution();
  });
  button.addEventListener("keydown", (event) => {
    const tabs = $$("[data-solution]");
    let index = tabs.indexOf(button);
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      index = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      index = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") index = 0;
    else if (event.key === "End") index = tabs.length - 1;
    else return;
    event.preventDefault();
    state.solution = tabs[index].dataset.solution;
    renderSolution();
    tabs[index].focus();
  });
});
$$("[data-console]").forEach((button) =>
  button.addEventListener("click", () => {
    state.console = button.dataset.console;
    renderConsole();
  }),
);
$("#regionSelect").addEventListener("change", (event) =>
  selectRegion(event.target.value),
);
$$("[data-region]").forEach((button) =>
  button.addEventListener("click", () => selectRegion(button.dataset.region)),
);
$$("[data-open-console]").forEach((button) =>
  button.addEventListener("click", () => {
    closeNav();
    scrollToId("dashboard");
    $('[data-console="overview"]').focus({ preventScroll: true });
  }),
);
$$("[data-scroll]").forEach((button) =>
  button.addEventListener("click", () => scrollToId(button.dataset.scroll)),
);
$$("[data-open-brief]").forEach((button) =>
  button.addEventListener("click", () => {
    closeNav();
    openBrief();
  }),
);
$$("[data-start-cloud]").forEach((button) =>
  button.addEventListener("click", () => {
    window.location.href = "login.html";
  }),
);
$$("[data-plan]").forEach((button) =>
  button.addEventListener("click", () =>
    window.openDemoCheckout
      ? window.openDemoCheckout(button.dataset.plan)
      : openBrief(button.dataset.plan),
  ),
);
$$("[data-close-dialog]").forEach((button) =>
  button.addEventListener("click", () => button.closest("dialog").close()),
);
$$("dialog").forEach((dialog) =>
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  }),
);
$$("[data-product]").forEach((button) =>
  button.addEventListener("click", () => {
    const card = button.closest("article");
    openInfo(
      button.dataset.product,
      `<p>${escapeHTML($("h4", card).textContent)}</p><p>${escapeHTML($("p", card).textContent)}</p><p>${L("Product concept in the SKYFORGE company profile. Explore the console for a preview of these resources.", "Konsep produk pada company profile SKYFORGE. Coba console untuk melihat preview resource-nya.")}</p><button class="btn primary" data-info-console>${L("Explore console", "Jelajahi console")}${icon("arrow")}</button>`,
    );
  }),
);
$("#infoBody").addEventListener("click", (event) => {
  if (event.target.closest("[data-info-console]")) {
    $("#infoDialog").close();
    scrollToId("dashboard");
  }
});
$("#consoleContent").addEventListener("click", (event) => {
  if (event.target.closest("[data-console-deploy]")) {
    scrollToId("deployment");
    runDeployment();
  }
  if (event.target.closest("[data-add-member]")) {
    openInfo(
      L("Add a preview member", "Tambah anggota contoh"),
      `<p>${L("This creates a sample member in this preview only. No invitation is sent.", "Anggota hanya ditambahkan ke preview ini. Tidak mengirim undangan.")}</p><form id="memberForm"><label>${L("Display name", "Nama tampilan")}<input name="memberName" required maxlength="60"></label><label>Email<input name="memberEmail" type="email" required maxlength="120" placeholder="member@example.com"></label><button class="btn primary full" type="submit">${L("Add sample member", "Tambah anggota contoh")}${icon("plus")}</button></form>`,
    );
    $("#memberForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      const name = form.elements.memberName.value.trim();
      const email = form.elements.memberEmail.value.trim();
      if (!name) return;
      if (
        state.members.some(
          (member) => member.email.toLowerCase() === email.toLowerCase(),
        )
      ) {
        toast(
          L(
            "That sample member already exists.",
            "Anggota contoh itu sudah ada.",
          ),
        );
        return;
      }
      state.members.push({ name, email, role: "Viewer" });
      $("#infoDialog").close();
      renderConsole();
      toast(
        L(
          "Preview member added. No invitation sent.",
          "Anggota contoh ditambahkan. Tidak mengirim undangan.",
        ),
      );
    });
  }
});
$("#consoleContent").addEventListener("change", (event) => {
  if (!event.target.matches("[data-role-index]")) return;
  const member = state.members[Number(event.target.dataset.roleIndex)];
  if (
    member &&
    ["Developer", "Billing", "Viewer"].includes(event.target.value)
  ) {
    member.role = event.target.value;
    toast(L("Preview role updated.", "Peran contoh diperbarui."));
  }
});
$("#deployBtn").addEventListener("click", runDeployment);
$("#copyCommand").addEventListener("click", async () => {
  const command = "skyforge deploy --project web-production";
  try {
    await navigator.clipboard.writeText(command);
    toast(L("Example command copied.", "Perintah contoh disalin."));
  } catch {
    openInfo(
      L("Example command", "Perintah contoh"),
      `<p>${L("Select and copy this illustrative command:", "Pilih dan salin perintah ilustrasi ini:")}</p><pre style="white-space:pre-wrap;overflow-wrap:anywhere">${escapeHTML(command)}</pre><p>${L("SKYFORGE CLI is a product concept in this preview.", "SKYFORGE CLI merupakan konsep produk dalam preview ini.")}</p>`,
    );
  }
});
$("#briefForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const company = String(data.get("company") || "").trim();
  const service = String(data.get("service") || "").trim();
  const plan = String(data.get("plan") || "Custom");
  const preferredRegion = String(data.get("preferredRegion") || "Not sure yet");
  const message = String(data.get("message") || "").trim();
  const website = String(data.get("website") || "").trim();
  const consent = data.get("consent") === "on";
  const stateBox = $("#briefSubmitState");
  const submitButton = form.querySelector('button[type="submit"]');
  if (!name || !email || !service || message.length < 20) {
    toast(L("Complete the required project brief fields.", "Lengkapi field project brief yang wajib."));
    return;
  }
  stateBox.className = "brief-submit-state";
  stateBox.textContent = L("Sending securely to SKYFORGE backend…", "Mengirim ke backend SKYFORGE…");
  submitButton.disabled = true;
  try {
    const response = await fetch("/api/project-brief", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name, email, company, service, plan, preferredRegion, message, website, consent }),
    });
    let result = {};
    try { result = await response.json(); } catch {}
    if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
    state.brief = {
      name, email, company, service, plan, preferredRegion, message,
      billing: state.billing,
      region: regions[state.region].name,
      submissionId: result.id,
      submittedAt: result.receivedAt || new Date().toISOString(),
    };
    writeStored("skyforge-project-brief", JSON.stringify(state.brief));
    form.hidden = true;
    $("#briefResult").hidden = false;
    $("#briefResult h3").textContent = L("Project brief submitted.", "Project brief berhasil dikirim.");
    $("#briefResult p").textContent = L(`Server submission ${result.id} has been saved. You can download a local copy for your records.`, `Submission server ${result.id} sudah tersimpan. Kamu bisa mengunduh salinan lokal untuk arsip.`);
    stateBox.classList.add("is-success");
    stateBox.textContent = L("Submission accepted by backend.", "Submission diterima backend.");
    $("#downloadBrief").focus();
  } catch (error) {
    stateBox.className = "brief-submit-state is-error";
    stateBox.textContent = L(`Could not submit to backend: ${error.message}. Run SKYFORGE with npm start and try again.`, `Belum bisa terkirim ke backend: ${error.message}. Jalankan SKYFORGE dengan npm start lalu coba lagi.`);
    toast(L("Backend submission failed. Your form is still here.", "Submission backend gagal. Isi form tetap aman di halaman ini."));
  } finally {
    submitButton.disabled = false;
  }
});
$("#downloadBrief").addEventListener("click", () => {
  if (!state.brief) return;
  const url = URL.createObjectURL(
    new Blob([briefText()], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "skyforge-project-brief.txt";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$("#editBrief").addEventListener("click", () => {
  $("#briefResult").hidden = true;
  $("#briefForm").hidden = false;
  $("#briefForm input").focus();
});
$("#deleteBrief").addEventListener("click", () => {
  const deleted = removeStored("skyforge-project-brief");
  if (!deleted) {
    toast(
      L(
        "Browser storage is unavailable. Unable to remove the saved copy.",
        "Penyimpanan browser tidak tersedia. Salinan tersimpan belum dapat dihapus.",
      ),
    );
    return;
  }
  state.brief = null;
  $("#briefForm").reset();
  $("#briefForm").hidden = false;
  $("#briefResult").hidden = true;
  toast(
    L("Local project brief copy deleted. Server submission is unchanged.", "Salinan lokal project brief dihapus. Submission di server tetap ada."),
  );
});
$("#privacyBtn").addEventListener("click", () => {
  openInfo(
    L("Privacy & data", "Privasi & data"),
    `<p>${L("SKYFORGE includes a small Node.js backend for the project consultation form. It does not include advertising or analytics trackers.", "SKYFORGE memiliki backend Node.js kecil untuk form konsultasi proyek. Website ini tidak menyertakan tracker iklan atau analytics.")}</p><ul><li>${L("Language and appearance preferences are stored locally in your browser.", "Pilihan bahasa dan tampilan disimpan secara lokal di browser.")}</li><li>${L("When you submit a project brief, the form data is sent to this SKYFORGE server and stored in data/project-briefs.jsonl. A local copy may also be kept in your browser for download/edit convenience.", "Saat project brief dikirim, data form dikirim ke server SKYFORGE ini dan disimpan di data/project-briefs.jsonl. Salinan lokal juga dapat disimpan di browser untuk kebutuhan download/edit.")}</li><li>${L("Console metrics, deployment steps, system status and latency values are simulated demo data.", "Metric console, tahap deployment, system status, dan nilai latency merupakan data demo simulasi.")}</li><li>${L("Do not use this demo form for passwords, payment card data, API secrets, or other sensitive credentials.", "Jangan gunakan form demo ini untuk password, data kartu pembayaran, API secret, atau kredensial sensitif lainnya.")}</li></ul>`,
  );
});
$$(".faq-list details").forEach((detail) =>
  detail.addEventListener("toggle", () => {
    if (detail.open)
      $$(".faq-list details").forEach((other) => {
        if (other !== detail) other.open = false;
      });
  }),
);
try {
  const saved = JSON.parse(readStored("skyforge-project-brief"));
  if (
    saved &&
    typeof saved.name === "string" &&
    typeof saved.email === "string" &&
    typeof saved.message === "string" &&
    ["Starter", "Professional", "Business", "Custom"].includes(saved.plan)
  ) {
    state.brief = saved;
    ["name", "email", "company", "service", "plan", "preferredRegion", "message"].forEach(
      (key) => {
        if ($("#briefForm").elements[key] && typeof saved[key] === "string")
          $("#briefForm").elements[key].value = saved[key];
      },
    );
    $("#briefForm").elements.consent.checked = Boolean(saved.submissionId);
    if (saved.submissionId) {
      $("#briefForm").hidden = true;
      $("#briefResult").hidden = false;
      $("#briefResult h3").textContent = L("Project brief submitted.", "Project brief berhasil dikirim.");
      $("#briefResult p").textContent = L(`Server submission ${saved.submissionId} was previously accepted.`, `Submission server ${saved.submissionId} sebelumnya sudah diterima.`);
    }
  }
} catch {}
applyTheme();
applyLanguage();
selectRegion(state.region, false);
