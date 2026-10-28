"use strict";
(() => {
  const $ = (selector) => document.querySelector(selector);
  const key = "skyforge-cloud-session-v1";
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const read = () => {
    try {
      return JSON.parse(sessionStorage.getItem(key));
    } catch {
      return null;
    }
  };
  const save = (value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  };
  const money = (value) => "Rp" + new Intl.NumberFormat("id-ID").format(value);
  const sizes = {
    starter: { label: "Starter", cpu: 1, ram: 2, price: 89000 },
    professional: { label: "Professional", cpu: 2, ram: 4, price: 249000 },
    business: { label: "Business", cpu: 4, ram: 8, price: 699000 },
  };
  const seed = (email) => ({
    demo: true,
    email,
    name: "Demo workspace",
    plan: "Professional",
    instances: [
      {
        id: "ins-web01",
        name: "web-production-01",
        region: "Jakarta",
        size: "professional",
        image: "Ubuntu 24.04 LTS",
        status: "Running",
        ip: "192.0.2.14",
      },
      {
        id: "ins-api01",
        name: "api-production-01",
        region: "Jakarta",
        size: "starter",
        image: "Debian 12",
        status: "Running",
        ip: "192.0.2.21",
      },
      {
        id: "ins-worker01",
        name: "background-worker",
        region: "Singapore",
        size: "starter",
        image: "Ubuntu 24.04 LTS",
        status: "Running",
        ip: "192.0.2.36",
      },
      {
        id: "ins-stage01",
        name: "staging-preview",
        region: "Tokyo",
        size: "starter",
        image: "Alpine Linux 3.20",
        status: "Stopped",
        ip: "192.0.2.48",
      },
    ],
    activities: [{ message: "Sesi demo workspace dimulai", time: Date.now() }],
    buckets: [
      { name: "production-assets", files: 1284, size: "12.4 GB" },
      { name: "database-backups", files: 48, size: "8.2 GB" },
    ],
    databases: [
      {
        name: "production-postgres",
        engine: "PostgreSQL 16",
        size: "8.4 GB",
        region: "Jakarta",
      },
    ],
  });
  if (document.body.dataset.page === "login") {
    let busy = false;
    const enter = (email) => {
      if (busy) return;
      busy = true;
      $("#loginSubmit").disabled = true;
      $("#demoEntry").disabled = true;
      $("#loginStatus").textContent = "Menyiapkan workspace demo…";
      $("#loginPassword").value = "";
      if (!save(seed(email))) {
        busy = false;
        $("#loginStatus").textContent =
          "Penyimpanan sesi diblokir browser. Aktifkan penyimpanan situs lalu coba lagi.";
        $("#loginSubmit").disabled = false;
        $("#demoEntry").disabled = false;
        return;
      }
      setTimeout(() => {
        window.location.href = "app.html";
      }, 600);
    };
    $("#loginForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!event.target.checkValidity()) return;
      enter($("#loginEmail").value.trim().slice(0, 120));
    });
    $("#demoEntry").addEventListener("click", () =>
      enter("demo@skyforge.example"),
    );
    $("#showPassword").addEventListener("click", () => {
      const show = $("#loginPassword").type === "password";
      $("#loginPassword").type = show ? "text" : "password";
      $("#showPassword").textContent = show ? "Sembunyi" : "Lihat";
      $("#showPassword").setAttribute("aria-pressed", String(show));
      $("#showPassword").setAttribute(
        "aria-label",
        show ? "Sembunyikan password" : "Tampilkan password",
      );
    });
    $("#resetDemo").addEventListener("click", () => {
      $("#loginEmail").value = "demo@skyforge.example";
      $("#loginPassword").value = "skyforge-demo";
      $("#loginStatus").textContent = "Akun demo telah direset.";
    });
    return;
  }
  let data = read();
  if (
    !data ||
    data.demo !== true ||
    !Array.isArray(data.instances) ||
    !Array.isArray(data.activities) ||
    !Array.isArray(data.buckets) ||
    !Array.isArray(data.databases) ||
    !Object.values(sizes).some((size) => size.label === data.plan)
  ) {
    window.location.replace("login.html");
    return;
  }
  data.instances = data.instances.filter(
    (item) =>
      item &&
      Object.hasOwn(sizes, item.size) &&
      ["Running", "Stopped", "Provisioning"].includes(item.status),
  );
  data.instances.forEach((item) => {
    if (item.status === "Provisioning") item.status = "Running";
  });
  const titles = {
    overview: "Overview",
    instances: "Compute instances",
    volumes: "Volumes",
    networks: "Networks",
    keys: "API Keys",
    storage: "Object storage",
    databases: "Databases",
    billing: "Billing & plans",
    activity: "Activity log",
    settings: "Workspace settings",
  };
  let view = Object.hasOwn(titles, window.location.hash.slice(1))
    ? window.location.hash.slice(1)
    : "overview";
  let regionFilter = "All regions";
  let query = "";
  let pendingDelete = "";
  let toastTimer;
  let cpuTick = 0;
  const notify = (message) => {
    $("#cloudToast").textContent = message;
    $("#cloudToast").classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => $("#cloudToast").classList.remove("visible"),
      3200,
    );
  };
  const persist = () => {
    if (!save(data))
      notify(
        "Penyimpanan sesi tidak tersedia. Perubahan hanya berlaku sampai halaman dimuat ulang.",
      );
  };
  const activity = (message) => {
    data.activities.unshift({ message, time: Date.now() });
    data.activities = data.activities.slice(0, 80);
    persist();
  };
  const button = (label, action, className = "secondary") =>
    `<button class="cloud-button ${className}" data-action="${action}">${label}</button>`;
  const metrics = (items) =>
    `<div class="metric-grid">${items.map(([label, value, note]) => `<div class="metric-card"><span class="metric-label">${label}<span>↗</span></span><strong>${value}</strong><small>${note}</small></div>`).join("")}</div>`;
  const heading = (title, description, controls = "") =>
    `<div class="view-heading"><div><h1>${title}</h1><p>${description}</p></div><div class="heading-controls">${controls}</div></div>`;
  const regionSelect = () =>
    `<select id="instanceRegion" class="small-select" aria-label="Filter region">${["All regions", "Jakarta", "Singapore", "Tokyo"].map((region) => `<option${regionFilter === region ? " selected" : ""}>${region}</option>`).join("")}</select>`;
  const filteredInstances = () =>
    data.instances.filter(
      (instance) =>
        (regionFilter === "All regions" || instance.region === regionFilter) &&
        instance.name.toLowerCase().includes(query.toLowerCase()),
    );
  const table = (compact = false) => {
    const instances = compact
      ? data.instances.slice(0, 4)
      : filteredInstances();
    return `<div class="cloud-panel"><div class="panel-heading"><h2>${compact ? "Your instances" : "Instances"} <small>(${instances.length})</small></h2>${compact ? '<button class="text-button" data-goto="instances">View all instances →</button>' : "<small>Documentation IP addresses · demo</small>"}</div><div class="cloud-table-wrap"><table class="cloud-table"><thead><tr><th>INSTANCE NAME</th><th>REGION</th><th>RESOURCES</th><th>STATUS</th>${compact ? "" : "<th>ACTIONS</th>"}</tr></thead><tbody>${instances.map((instance) => `<tr><td>${escape(instance.name)}<small>${escape(instance.ip)} · ${escape(instance.image)}</small></td><td>${escape(instance.region)}</td><td>${sizes[instance.size].cpu} vCPU / ${sizes[instance.size].ram} GB</td><td><span class="instance-state ${instance.status.toLowerCase()}">${instance.status === "Running" ? '<i class="status-dot"></i>' : ""}${instance.status}</span></td>${compact ? "" : `<td><div class="table-actions"><button data-toggle="${escape(instance.id)}"${instance.status === "Provisioning" ? " disabled" : ""}>${instance.status === "Running" ? "Stop" : "Start"}</button><button data-restart="${escape(instance.id)}"${instance.status !== "Running" ? " disabled" : ""}>Restart</button><button class="delete-action" data-delete="${escape(instance.id)}">Delete</button></div></td>`}</tr>`).join("")}</tbody></table>${instances.length ? "" : '<div class="empty-state">Tidak ada instance yang cocok. Ubah pencarian atau buat instance baru.</div>'}</div></div>`;
  };
  const activityRows = (limit = 80) =>
    `<div class="activity-list">${data.activities
      .slice(0, limit)
      .map(
        (item) =>
          `<div class="activity-row"><span class="activity-symbol">✓</span><div><strong>${escape(item.message)}</strong><small>${new Date(item.time).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · Demo workspace</small></div></div>`,
      )
      .join("")}</div>`;
  const chart = () =>
    `<div class="cloud-panel"><div class="panel-heading"><h2>Resource utilization</h2><small>Last 24 hours · simulated</small></div><div class="usage-chart"><div class="chart-legend"><span><i></i>CPU <b id="chartCpu">32.8%</b></span><span><i class="memory"></i>Memory 48.2%</span></div><svg viewBox="0 0 600 150" role="img" aria-label="Simulated CPU and memory utilization"><defs><linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#6284ee" stop-opacity=".14"/><stop offset="1" stop-color="#6284ee" stop-opacity="0"/></linearGradient></defs><path class="chart-guides" d="M0 20H600M0 60H600M0 100H600M0 140H600"/><path d="M0 112L20 98L40 103L60 75L80 82L100 56L120 70L140 58L160 88L180 66L200 75L220 42L240 62L260 50L280 67L300 40L320 59L340 34L360 54L380 44L400 70L420 53L440 62L460 40L480 51L500 32L520 45L540 22L560 39L580 29L600 36V150H0Z" fill="url(#usageFill)"/><path class="utilization-memory" d="M0 119L40 116L80 105L120 110L160 100L200 108L240 94L280 103L320 92L360 90L400 99L440 89L480 95L520 87L560 91L600 82"/><path class="utilization-line" id="cpuGraph" d="M0 112L20 98L40 103L60 75L80 82L100 56L120 70L140 58L160 88L180 66L200 75L220 42L240 62L260 50L280 67L300 40L320 59L340 34L360 54L380 44L400 70L420 53L440 62L460 40L480 51L500 32L520 45L540 22L560 39L580 29L600 36"/></svg><div class="chart-labels"><span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>23:59</span></div></div></div>`;
  const render = () => {
    $("#viewBreadcrumb").textContent = titles[view];
    $("#workspaceName").textContent = data.name;
    $("#profileAvatar").textContent = String(data.name || "D")[0].toUpperCase();
    document.title = titles[view] + " — SKYFORGE Console";
    document.querySelectorAll("[data-view]").forEach((item) => {
      item.classList.toggle("active", item.dataset.view === view);
      item.setAttribute(
        "aria-current",
        item.dataset.view === view ? "page" : "false",
      );
    });
    const running = data.instances.filter(
      (instance) => instance.status === "Running",
    );
    const estimate = data.instances.reduce(
      (total, instance) => total + sizes[instance.size].price,
      0,
    );
    let html = "";
    if (view === "overview") {
      html = heading(
        "Workspace overview",
        "Periksa instance aktif, pemakaian resource, dan perubahan terakhir.",
        button("+ Create instance", "create", "primary"),
      );
      html += metrics([
        [
          "Active instances",
          running.length.toString().padStart(2, "0"),
          `${data.instances.length} total instances`,
        ],
        [
          "CPU utilization",
          '<span id="metricCpu">32.8%</span>',
          "Sample utilization · live demo",
        ],
        ["Storage used", "20.6 GB", "Dari 100 GB kuota demo"],
        ["Estimated cost", money(estimate), "Estimasi bulanan · tidak ditagih"],
      ]);
      html += `<div class="overview-panels">${chart()}<div class="cloud-panel"><div class="panel-heading"><h2>Workspace resources</h2><span class="demo-pill">${escape(data.plan)}</span></div><div class="resource-summary"><div><span>vCPU allocation</span><strong>${data.instances.reduce((sum, instance) => sum + sizes[instance.size].cpu, 0)} / 32 vCPU</strong></div><div class="resource-meter"><i style="width:${Math.min(100, (data.instances.reduce((sum, instance) => sum + sizes[instance.size].cpu, 0) / 32) * 100)}%"></i></div><div><span>Memory allocation</span><strong>${data.instances.reduce((sum, instance) => sum + sizes[instance.size].ram, 0)} / 64 GB</strong></div><div class="resource-meter"><i style="width:${Math.min(100, (data.instances.reduce((sum, instance) => sum + sizes[instance.size].ram, 0) / 64) * 100)}%"></i></div><div><span>Object storage</span><strong>20.6 / 100 GB</strong></div><div class="resource-meter"><i style="width:20.6%"></i></div><div><span>Regions</span><strong>3 available</strong></div><div><span>Environment</span><strong>Sandbox</strong></div></div></div></div>`;
      html +=
        table(true) +
        `<div class="cloud-panel"><div class="panel-heading"><h2>Recent activity</h2><button class="text-button" data-goto="activity">View activity →</button></div>${activityRows(3)}</div>`;
    }
    if (view === "instances")
      html =
        heading(
          "Compute instances",
          "Kelola virtual machine dan deployment di workspace demo.",
          regionSelect() + button("+ Create instance", "create", "primary"),
        ) + table();
    if (view === "storage")
      html =
        heading(
          "Object storage",
          "Bucket untuk aset aplikasi, media, dan backup.",
          button("+ Create demo bucket", "bucket", "primary"),
        ) +
        `<div class="resource-grid">${data.buckets.map((bucket) => `<article class="resource-card"><span class="resource-icon">▱</span><h3>${escape(bucket.name)}</h3><p>${bucket.files.toLocaleString("id-ID")} objects · ${escape(bucket.size)}<br>Private bucket · Jakarta</p><span class="instance-state">Available · demo</span></article>`).join("")}</div><p class="muted">Bucket demo tidak menyimpan atau mengunggah berkas asli.</p>`;
    if (view === "databases")
      html =
        heading(
          "Managed databases",
          "Database terkelola untuk aplikasi dan layananmu.",
          button("+ Create demo database", "database", "primary"),
        ) +
        `<div class="resource-grid">${data.databases.map((db) => `<article class="resource-card"><span class="resource-icon">▦</span><h3>${escape(db.name)}</h3><p>${escape(db.engine)}<br>${escape(db.size)} / 25 GB · ${escape(db.region)}<br>Daily backups enabled · demo</p><span class="instance-state"><i class="status-dot"></i>Healthy</span></article>`).join("")}</div><p class="muted">Database bersifat ilustratif dan tidak menerima koneksi.</p>`;
    if (view === "billing") {
      html = heading(
        "Billing & plans",
        "Pantau estimasi penggunaan dan coba pilihan paket demo.",
        '<a class="cloud-button secondary" href="index.html#pricing">Buka checkout demo ↗</a>',
      );
      html += metrics([
        ["Current plan", escape(data.plan), "Demo workspace"],
        [
          "Estimated monthly usage",
          money(estimate),
          "Penjumlahan resource instance demo",
        ],
        ["Amount charged", "Rp0", "Tidak ada transaksi nyata"],
        ["Payment method", "Demo card", "4242 · Sandbox only"],
      ]);
      html += `<div class="plan-choice">${Object.values(sizes)
        .map(
          (size) =>
            `<article class="plan-option ${data.plan === size.label ? "active" : ""}"><h3>${size.label}</h3><strong>${money(size.price)}</strong><small>/bulan · contoh harga per instance<br>${size.cpu} vCPU / ${size.ram} GB RAM</small><button class="cloud-button ${data.plan === size.label ? "secondary" : "primary"}" data-cloud-plan="${size.label}"${data.plan === size.label ? " disabled" : ""}>${data.plan === size.label ? "Paket aktif" : "Pilih paket demo"}</button></article>`,
        )
        .join(
          "",
        )}</div><div class="cloud-notice">Perubahan paket hanya memperbarui label paket workspace demo. Ukuran dan estimasi biaya instance yang sudah dibuat tetap mengikuti konfigurasi resource-nya.</div>`;
    }
    if (view === "activity")
      html =
        heading(
          "Activity log",
          "Riwayat perubahan selama sesi demo.",
          button("Export activity ↓", "export"),
        ) +
        `<div class="cloud-panel"><div class="panel-heading"><h2>Workspace events</h2><small>${data.activities.length} events</small></div>${activityRows()}</div>`;
    if (view === "settings")
      html =
        heading(
          "Workspace settings",
          "Sesuaikan identitas workspace dan preferensi sesi.",
        ) +
        `<div class="cloud-panel"><div class="panel-heading"><h2>General settings</h2><span class="demo-pill">LOCAL SESSION</span></div><form id="settingsForm" class="settings-form"><label class="cloud-field">Workspace name<input name="workspace" value="${escape(data.name)}" maxlength="40" minlength="2" required></label><label class="cloud-field">Demo email<input type="email" name="email" value="${escape(data.email)}" maxlength="120" required></label><p class="muted">Data ini hanya berada di sesi browser. Tidak dikirim ke layanan akun.</p><p class="settings-feedback" id="settingsFeedback" role="status"></p><button type="submit" class="cloud-button primary">Simpan perubahan</button></form></div><div class="cloud-panel"><div class="panel-heading"><h2>Demo environment</h2></div><div class="settings-form"><p class="muted">Kembalikan resource dan pengaturan demo ke kondisi awal.</p>${button("Reset workspace demo", "reset")}</div></div>`;
    if (view === "settings")
      html += `<div class="cloud-panel"><div class="settings-form"><p class="muted">Akhiri sesi demo dan kembali ke halaman login.</p>${button("Keluar dari sesi demo", "logout")}</div></div>`;
    if (["volumes", "networks", "keys"].includes(view) && window.skyforgeExtras)
      html = window.skyforgeExtras.render(data, view);
    $("#appContent").innerHTML = html;
  };
  const go = (next) => {
    if (!Object.hasOwn(titles, next)) return;
    view = next;
    window.location.hash = next;
    render();
  };
  const openInstance = () => {
    if (data.instances.length >= 20)
      return notify("Batas demo: maksimal 20 instance.");
    $("#instanceForm").reset();
    $("#resourceStatus").textContent = "";
    $("#resourceDialog").showModal();
  };
  document.querySelectorAll("[data-view]").forEach((item) =>
    item.addEventListener("click", () => {
      query = "";
      $("#cloudSearch").value = "";
      go(item.dataset.view);
    }),
  );
  document
    .querySelectorAll("[data-close-resource]")
    .forEach((item) =>
      item.addEventListener("click", () => $("#resourceDialog").close()),
    );
  $("#appContent").addEventListener("click", (event) => {
    const target = event.target.closest("button,[data-goto]");
    if (!target) return;
    if (
      window.skyforgeExtras &&
      window.skyforgeExtras.handle(event, data, activity, render, notify)
    )
      return;
    if (target.dataset.action === "logout") return $("#logoutButton").click();
    if (target.dataset.goto) return go(target.dataset.goto);
    if (target.dataset.action === "create") return openInstance();
    if (target.dataset.toggle) {
      const instance = data.instances.find(
        (item) => item.id === target.dataset.toggle,
      );
      if (!instance || instance.status === "Provisioning") return;
      instance.status = instance.status === "Running" ? "Stopped" : "Running";
      activity(`${instance.name}: ${instance.status.toLowerCase()} (demo)`);
      render();
      notify(instance.name + " → " + instance.status);
    }
    if (target.dataset.restart) {
      const instance = data.instances.find(
        (item) => item.id === target.dataset.restart,
      );
      if (!instance || instance.status !== "Running") return;
      instance.status = "Provisioning";
      activity(`${instance.name}: restart dimulai (demo)`);
      render();
      setTimeout(() => {
        if (!data.instances.includes(instance)) return;
        instance.status = "Running";
        activity(`${instance.name}: restart selesai (demo)`);
        render();
        notify(instance.name + " kembali Running");
      }, 1800);
    }
    if (target.dataset.delete) {
      pendingDelete = target.dataset.delete;
      const instance = data.instances.find((item) => item.id === pendingDelete);
      if (!instance) return;
      $("#confirmDescription").textContent =
        `Hapus ${instance.name} dari workspace demo? Resource lain tetap tersedia.`;
      $("#confirmDialog").showModal();
    }
    if (
      target.dataset.cloudPlan &&
      Object.values(sizes).some(
        (size) => size.label === target.dataset.cloudPlan,
      )
    ) {
      data.plan = target.dataset.cloudPlan;
      activity(`Paket workspace diubah ke ${data.plan} (demo)`);
      render();
      notify("Paket demo diperbarui ke " + data.plan);
    }
    if (target.dataset.action === "bucket") {
      if (data.buckets.length >= 8)
        return notify("Batas demo: maksimal 8 bucket.");
      const name = "project-assets-" + Date.now().toString(36).slice(-5);
      data.buckets.push({ name, files: 0, size: "0 GB" });
      activity(`Bucket ${name} dibuat (demo)`);
      render();
      notify("Bucket demo berhasil dibuat");
    }
    if (target.dataset.action === "database") {
      if (data.databases.length >= 5)
        return notify("Batas demo: maksimal 5 database.");
      const name = "postgres-" + Date.now().toString(36).slice(-5);
      data.databases.push({
        name,
        engine: "PostgreSQL 16",
        size: "0 GB",
        region: "Jakarta",
      });
      activity(`Database ${name} dibuat (demo)`);
      render();
      notify("Database demo berhasil dibuat");
    }
    if (target.dataset.action === "export") {
      const url = URL.createObjectURL(
        new Blob(
          [
            JSON.stringify(
              { environment: "SKYFORGE DEMO", events: data.activities },
              null,
              2,
            ),
          ],
          { type: "application/json" },
        ),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "skyforge-demo-activity.json";
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    if (target.dataset.action === "reset") {
      pendingDelete = "reset";
      $("#confirmTitle").textContent = "Reset workspace demo?";
      $("#confirmDescription").textContent =
        "Perubahan sesi akan diganti dengan resource contoh awal.";
      $("#confirmDelete").textContent = "Reset demo";
      $("#confirmDialog").showModal();
    }
  });
  $("#appContent").addEventListener("change", (event) => {
    if (event.target.id === "instanceRegion") {
      regionFilter = event.target.value;
      render();
    }
  });
  $("#cloudSearch").addEventListener("input", (event) => {
    query = event.target.value;
    go("instances");
  });
  $("#appContent").addEventListener("submit", (event) => {
    if (event.target.id !== "settingsForm") return;
    event.preventDefault();
    if (!event.target.checkValidity()) return;
    const fields = new FormData(event.target);
    const name = String(fields.get("workspace")).trim();
    if (name.length < 2) {
      $("#settingsFeedback").textContent = "Nama workspace minimal 2 karakter.";
      return;
    }
    data.name = name.slice(0, 40);
    data.email = String(fields.get("email")).trim().slice(0, 120);
    activity("Pengaturan workspace diperbarui");
    render();
    $("#settingsFeedback").textContent =
      "Pengaturan tersimpan pada sesi browser.";
  });
  $("#instanceForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!event.target.checkValidity() || data.instances.length >= 20) return;
    const form = new FormData(event.target);
    const name = String(form.get("name")).trim();
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,39}$/.test(name)) return;
    if (
      data.instances.some(
        (instance) => instance.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      $("#resourceStatus").textContent =
        "Nama instance sudah dipakai. Pilih nama lain.";
      return;
    }
    const size = String(form.get("size"));
    const region = String(form.get("region"));
    if (
      !Object.hasOwn(sizes, size) ||
      !["Jakarta", "Singapore", "Tokyo"].includes(region)
    )
      return;
    const id = "ins-" + Date.now().toString(36);
    const instance = {
      id,
      name,
      size,
      region,
      image: String(form.get("image")),
      status: "Provisioning",
      ip: "192.0.2." + (50 + data.instances.length),
    };
    data.instances.push(instance);
    activity(`${name}: deployment dimulai di ${region} (demo)`);
    $("#resourceDialog").close();
    query = "";
    regionFilter = "All regions";
    $("#cloudSearch").value = "";
    go("instances");
    notify("Instance demo sedang disiapkan…");
    setTimeout(() => {
      if (!data.instances.includes(instance)) return;
      instance.status = "Running";
      activity(`${name}: health check lolos, instance running (demo)`);
      render();
      notify(name + " siap digunakan pada demo");
    }, 2300);
  });
  $("#cancelDelete").addEventListener("click", () =>
    $("#confirmDialog").close(),
  );
  $("#confirmDelete").addEventListener("click", () => {
    if (pendingDelete === "reset") {
      data = seed("demo@skyforge.example");
      regionFilter = "All regions";
      query = "";
      persist();
      notify("Workspace demo direset");
    } else {
      const instance = data.instances.find((item) => item.id === pendingDelete);
      if (instance) {
        (data.volumes || []).forEach((volume) => {
          if (volume.attached === instance.name) volume.attached = "";
        });
        data.instances = data.instances.filter((item) => item !== instance);
        activity(`${instance.name}: instance dihapus (demo)`);
        notify("Instance demo dihapus");
      }
    }
    $("#confirmDialog").close();
    render();
  });
  $("#confirmDialog").addEventListener("close", () => {
    pendingDelete = "";
    $("#confirmTitle").textContent = "Hapus instance?";
    $("#confirmDelete").textContent = "Hapus instance";
  });
  $("#notificationButton").addEventListener("click", () => {
    $("#notificationPanel").hidden = !$("#notificationPanel").hidden;
    $("#notificationButton").setAttribute(
      "aria-expanded",
      String(!$("#notificationPanel").hidden),
    );
  });
  $("#logoutButton").addEventListener("click", () => {
    try {
      sessionStorage.removeItem(key);
    } catch {}
    window.location.href = "login.html";
  });
  $("#profileAvatar").addEventListener("click", () => go("settings"));
  window.addEventListener("hashchange", () => {
    const next = window.location.hash.slice(1);
    if (Object.hasOwn(titles, next) && next !== view) {
      view = next;
      render();
    }
  });
  const reduced = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: true };
  setInterval(() => {
    if (document.hidden || view !== "overview" || reduced.matches) return;
    cpuTick++;
    const utilization = (32.8 + Math.sin(cpuTick * 0.8) * 4.2).toFixed(1) + "%";
    if ($("#metricCpu")) $("#metricCpu").textContent = utilization;
    if ($("#chartCpu")) $("#chartCpu").textContent = utilization;
    const graph = $("#cpuGraph");
    if (graph)
      graph.setAttribute(
        "d",
        Array.from(
          { length: 31 },
          (_, index) =>
            `${index ? "L" : "M"}${index * 20} ${78 + Math.sin(index * 0.9 + cpuTick * 0.35) * 22 + Math.cos(index * 1.7) * 12}`,
        ).join(""),
      );
  }, 2500);
  render();
})();
