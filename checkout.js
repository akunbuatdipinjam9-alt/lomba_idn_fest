"use strict";
(() => {
  const plans = {
    Starter: {
      price: 89000,
      cpu: "1 vCPU",
      ram: "2 GB RAM",
      storage: "40 GB NVMe SSD",
      transfer: "2 TB transfer",
    },
    Professional: {
      price: 249000,
      cpu: "2 vCPU",
      ram: "4 GB RAM",
      storage: "80 GB NVMe SSD",
      transfer: "4 TB transfer",
    },
    Business: {
      price: 699000,
      cpu: "4 vCPU",
      ram: "8 GB RAM",
      storage: "160 GB NVMe SSD",
      transfer: "8 TB transfer",
    },
  };

  const dialog = document.createElement("dialog");
  dialog.className = "checkout-dialog";
  dialog.setAttribute("aria-labelledby", "checkoutTitle");
  document.body.append(dialog);

  let order;
  let timer;
  let receipt;

  const text = (en, id) => (state.lang === "id" ? id : en);
  const rupiah = (value) =>
    "Rp " + new Intl.NumberFormat("id-ID").format(value);

  const paymentLabel = (method) =>
    method === "wallet"
      ? text("Demo Wallet", "Dompet Demo")
      : text("Demo Card", "Kartu Demo");

  const billingLabel = (billing) =>
    billing === "yearly" ? text("Yearly", "Tahunan") : text("Monthly", "Bulanan");

  const totals = () => {
    const subtotal =
      plans[order.plan].price *
      order.quantity *
      (order.billing === "yearly" ? 12 : 1);
    const annualDiscount =
      order.billing === "yearly" ? Math.round(subtotal * 0.2) : 0;
    const promoDiscount = order.promo
      ? Math.round((subtotal - annualDiscount) * 0.1)
      : 0;

    return {
      subtotal,
      annualDiscount,
      promoDiscount,
      total: subtotal - annualDiscount - promoDiscount,
    };
  };

  const rows = () => {
    const amount = totals();
    return `<div><dt>${order.plan} × ${order.quantity}</dt><dd>${rupiah(amount.subtotal)}</dd></div>${amount.annualDiscount ? `<div><dt>${text("Annual discount · 20%", "Diskon tahunan · 20%")}</dt><dd>−${rupiah(amount.annualDiscount)}</dd></div>` : ""}${amount.promoDiscount ? `<div><dt>FORGE10 · 10%</dt><dd>−${rupiah(amount.promoDiscount)}</dd></div>` : ""}<div class="checkout-total"><dt>${text("Demo total", "Total simulasi")}</dt><dd>${rupiah(amount.total)}</dd></div>`;
  };

  const header = () =>
    `<div class="checkout-top"><div><strong>SKYFORGE</strong><span>CHECKOUT SANDBOX</span></div><button class="checkout-close" type="button" aria-label="${text("Close checkout", "Tutup checkout")}">×</button></div>`;

  const update = () => {
    dialog.querySelector("#checkoutAmount").textContent = rupiah(totals().total);
    dialog.querySelector("#checkoutTotals").innerHTML = rows();
    dialog.querySelector("#checkoutPeriod").textContent =
      order.billing === "yearly"
        ? text(
            "One simulated annual payment",
            "Satu pembayaran tahunan simulasi",
          )
        : text(
            "One simulated monthly payment",
            "Satu pembayaran bulanan simulasi",
          );
    dialog.querySelector("#checkoutPay").textContent =
      text("Simulate payment · ", "Simulasikan bayar · ") +
      rupiah(totals().total);
  };

  const render = () => {
    dialog.innerHTML =
      header() +
      `<div class="checkout-layout"><aside class="checkout-summary"><span class="checkout-kicker">ORDER SUMMARY</span><h2 id="checkoutTitle">${text("Configure your cloud.", "Atur cloud pilihanmu.")}</h2><div class="checkout-amount" id="checkoutAmount"></div><p class="checkout-caption" id="checkoutPeriod"></p><dl class="checkout-totals" id="checkoutTotals"></dl><div class="checkout-notice">${text("Demo only. No money moves, no subscription starts and no server is created.", "Hanya simulasi. Tidak ada uang ditarik, langganan dimulai, atau server dibuat.")}</div><p class="checkout-caption">${text("Try promo code", "Coba kode promo")} <strong>FORGE10</strong> · ${text("extra 10% off", "diskon tambahan 10%")}</p></aside><form class="checkout-form"><div class="checkout-row"><label class="checkout-field">${text("Plan", "Paket")}<select id="checkoutPlan">${Object.keys(plans)
        .map(
          (plan) =>
            `<option${order.plan === plan ? " selected" : ""}>${plan}</option>`,
        )
        .join("")}</select></label><label class="checkout-field">${text("Billing period", "Periode tagihan")}<select id="checkoutBilling"><option value="monthly"${order.billing === "monthly" ? " selected" : ""}>${text("Monthly", "Bulanan")}</option><option value="yearly"${order.billing === "yearly" ? " selected" : ""}>${text("Yearly · save 20%", "Tahunan · hemat 20%")}</option></select></label></div><div class="checkout-row"><label class="checkout-field">${text("Instances", "Jumlah instance")}<input id="checkoutQuantity" type="number" min="1" max="20" step="1" value="1" required></label><label class="checkout-field">Region<select id="checkoutRegion">${Object.entries(regions)
        .map(
          ([key, region]) =>
            `<option value="${key}"${key === order.region ? " selected" : ""}>${region.name}</option>`,
        )
        .join("")}</select></label></div><label class="checkout-field">${text("Promo code", "Kode promo")}<span class="checkout-promo"><input id="checkoutPromo" placeholder="FORGE10" maxlength="20" autocomplete="off"><button type="button" id="checkoutApply">${text("Apply", "Terapkan")}</button></span></label><p class="checkout-caption" id="checkoutPromoStatus" role="status"></p><label class="checkout-field">${text("Test payment method", "Metode pembayaran uji")}<select id="checkoutMethod"><option value="card">${text("Demo card", "Kartu demo")}</option><option value="wallet">${text("Demo wallet", "Dompet demo")}</option></select></label><div class="checkout-card" id="checkoutCard">SKYFORGE TEST CARD<strong>4242 · 4242 · 4242 · 4242</strong><span>${text("Preset test card. Do not enter real payment details.", "Kartu uji bawaan. Tidak perlu memasukkan data pembayaran asli.")}</span></div><label class="checkout-field">${text("Simulation result", "Hasil simulasi")}<select id="checkoutOutcome"><option value="success">${text("Successful payment", "Pembayaran berhasil")}</option><option value="declined">${text("Declined · test retry", "Ditolak · uji coba ulang")}</option></select></label><p class="checkout-status" id="checkoutStatus" role="status" aria-live="polite"></p><button class="checkout-pay" type="submit" id="checkoutPay"></button><p class="checkout-caption">${text("No account, email or real card details required. No automatic renewal.", "Tidak membutuhkan akun, email, atau kartu asli. Tidak ada perpanjangan otomatis.")}</p></form></div>`;
    update();
  };

  const receiptId = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `SF-${y}${m}${d}-${suffix}`;
  };

  const receiptItem = () => {
    const plan = plans[order.plan];
    return `${plan.cpu} · ${plan.ram} · ${plan.storage}`;
  };

  const receiptMarkup = ({ printable = false } = {}) => {
    const plan = plans[order.plan];
    const amount = receipt || totals();
    const date = receipt?.date || new Date().toLocaleString("id-ID");
    const invoice = receipt?.id || "SF-DEMO";
    const language = state.lang === "id" ? "id" : "en";

    return `<section class="sf-receipt${printable ? " sf-receipt-print" : ""}" lang="${language}">
      <header class="sf-receipt-brand">
        <strong>SKYFORGE</strong>
        <span>CLOUD INFRASTRUCTURE</span>
        <p>${text("Digital Receipt · Payment Sandbox", "Struk Digital · Sandbox Pembayaran")}</p>
      </header>

      <div class="sf-receipt-rule"></div>

      <dl class="sf-receipt-meta">
        <div><dt>${text("Invoice No.", "No. Invoice")}</dt><dd>${invoice}</dd></div>
        <div><dt>${text("Date", "Tanggal")}</dt><dd>${date}</dd></div>
        <div><dt>${text("Payment", "Pembayaran")}</dt><dd>${paymentLabel(order.method)}</dd></div>
        <div><dt>${text("Status", "Status")}</dt><dd><span class="sf-receipt-status">${text("Demo complete", "Demo selesai")}</span></dd></div>
      </dl>

      <div class="sf-receipt-rule"></div>

      <div class="sf-receipt-item">
        <div class="sf-receipt-item-head">
          <strong>${order.plan} Cloud Compute</strong>
          <strong>${rupiah(plans[order.plan].price * order.quantity * (order.billing === "yearly" ? 12 : 1))}</strong>
        </div>
        <p>${receiptItem()}</p>
        <p>${plan.transfer} · ${regions[order.region].name}</p>
        <p>${text("Billing", "Tagihan")}: ${billingLabel(order.billing)} · Qty ${order.quantity}</p>
      </div>

      <div class="sf-receipt-rule"></div>

      <dl class="sf-receipt-money">
        <div><dt>Subtotal</dt><dd>${rupiah(amount.subtotal)}</dd></div>
        ${amount.annualDiscount ? `<div><dt>${text("Annual discount", "Diskon tahunan")} 20%</dt><dd>−${rupiah(amount.annualDiscount)}</dd></div>` : ""}
        ${amount.promoDiscount ? `<div><dt>Promo FORGE10</dt><dd>−${rupiah(amount.promoDiscount)}</dd></div>` : ""}
        <div class="sf-receipt-total"><dt>Total</dt><dd>${rupiah(amount.total)}</dd></div>
      </dl>

      <div class="sf-receipt-rule"></div>

      <div class="sf-receipt-demo">
        <strong>${text("PAYMENT SIMULATION", "SIMULASI PEMBAYARAN")}</strong>
        <p>${text("Illustrative transaction only. No funds were charged and no server was created.", "Transaksi ini hanya ilustrasi. Tidak ada dana yang ditarik dan tidak ada server yang dibuat.")}</p>
      </div>

      <footer class="sf-receipt-footer">
        <p>${text("Thank you for trying SkyForge.", "Terima kasih telah mencoba SkyForge.")}</p>
        <span>skyforge · ${invoice}</span>
      </footer>
    </section>`;
  };

  const receiptDocument = () => `<!doctype html>
<html lang="${state.lang === "id" ? "id" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${receipt.id} · SkyForge Receipt</title>
<style>
  *{box-sizing:border-box}html,body{margin:0;padding:0;background:#f1f1f1;color:#111;font-family:Arial,Helvetica,sans-serif}
  body{padding:24px}.sf-receipt{width:min(390px,100%);margin:0 auto;background:#fff;padding:28px 24px;box-shadow:0 8px 30px #00000016;font-size:13px;line-height:1.45}
  .sf-receipt-brand{text-align:center}.sf-receipt-brand strong{display:block;font-size:27px;letter-spacing:.06em}.sf-receipt-brand span{display:block;font-size:11px;letter-spacing:.2em;margin-top:2px}.sf-receipt-brand p{font-size:11px;color:#666;margin:12px 0 0}
  .sf-receipt-rule{border-top:1px dashed #777;margin:20px 0}.sf-receipt dl{margin:0}.sf-receipt-meta div,.sf-receipt-money div,.sf-receipt-item-head{display:flex;justify-content:space-between;gap:18px}.sf-receipt-meta div{padding:4px 0}.sf-receipt dt,.sf-receipt dd{margin:0}.sf-receipt dd{text-align:right}.sf-receipt-status{font-weight:700}.sf-receipt-item strong{font-size:14px}.sf-receipt-item p{margin:4px 0;color:#444;font-size:12px}.sf-receipt-money div{padding:4px 0}.sf-receipt-total{font-size:18px;font-weight:800;border-top:1px solid #222;margin-top:8px;padding-top:12px!important}.sf-receipt-demo{text-align:center}.sf-receipt-demo strong{font-size:12px;letter-spacing:.08em}.sf-receipt-demo p{font-size:11px;color:#555;margin:6px auto 0;max-width:300px}.sf-receipt-footer{text-align:center;margin-top:26px}.sf-receipt-footer p{font-size:12px;margin:0 0 8px}.sf-receipt-footer span{font-size:9px;color:#777}
  @media print{html,body{background:#fff}.sf-receipt{box-shadow:none;width:76mm;padding:7mm 5mm;margin:0}body{padding:0}@page{size:80mm 180mm;margin:2mm}}
</style>
</head>
<body>${receiptMarkup({ printable: true })}</body>
</html>`;

  const downloadReceipt = () => {
    const html = receiptDocument();
    const url = URL.createObjectURL(
      new Blob([html], { type: "text/html;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${receipt.id}.html`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const printReceipt = () => {
    const popup = window.open("", "_blank", "width=520,height=760");
    if (!popup) {
      dialog.querySelector("#checkoutReceiptStatus").textContent = text(
        "Pop-up was blocked. Allow pop-ups to print or save the receipt as PDF.",
        "Pop-up diblokir. Izinkan pop-up untuk mencetak atau menyimpan struk sebagai PDF.",
      );
      return;
    }
    popup.document.open();
    popup.document.write(receiptDocument());
    popup.document.close();
    popup.focus();
    popup.addEventListener("load", () => {
      setTimeout(() => popup.print(), 100);
    });
  };

  const renderSuccess = () => {
    dialog.innerHTML =
      header() +
      `<div class="checkout-receipt-screen"><div class="checkout-receipt-heading"><div><span class="checkout-kicker">SANDBOX · COMPLETED</span><h2 id="checkoutTitle">${text("Payment complete.", "Pembayaran berhasil.")}</h2><p>${text("Here is your SkyForge digital receipt.", "Ini struk digital SkyForge lu.")}</p></div><span class="checkout-success-badge">✓ ${text("Demo complete", "Demo selesai")}</span></div>${receiptMarkup()}<div class="checkout-actions checkout-receipt-actions"><button class="checkout-pay" id="checkoutPrint">${text("Print / Save PDF", "Cetak / Simpan PDF")}</button><button class="checkout-secondary" id="checkoutDownload">${text("Download receipt", "Unduh struk")}</button><button class="checkout-secondary" id="checkoutAgain">${text("New payment", "Pembayaran baru")}</button><button class="checkout-secondary checkout-close-action">${text("Done", "Selesai")}</button></div><p class="checkout-caption checkout-receipt-status" id="checkoutReceiptStatus" role="status" aria-live="polite">${text("PDF is created through your browser's Print → Save as PDF option.", "PDF dibuat lewat menu Cetak → Simpan sebagai PDF di browser.")}</p></div>`;
    dialog.querySelector("#checkoutPrint").focus();
  };

  window.openDemoCheckout = (plan = "Starter") => {
    clearTimeout(timer);
    dialog.dataset.processing = "false";
    receipt = null;
    order = {
      plan: Object.hasOwn(plans, plan) ? plan : "Starter",
      billing: state.billing,
      quantity: 1,
      region: state.region,
      promo: false,
      method: "card",
      outcome: "success",
    };
    render();
    if (!dialog.open) dialog.showModal();
    dialog.querySelector("#checkoutPlan").focus();
  };

  dialog.addEventListener("change", (event) => {
    const mappings = {
      checkoutPlan: "plan",
      checkoutBilling: "billing",
      checkoutRegion: "region",
      checkoutMethod: "method",
      checkoutOutcome: "outcome",
    };

    if (mappings[event.target.id]) {
      order[mappings[event.target.id]] = event.target.value;
    }

    if (event.target.id === "checkoutQuantity") {
      order.quantity = Math.max(
        1,
        Math.min(20, Math.round(Number(event.target.value) || 1)),
      );
      event.target.value = order.quantity;
    }

    if (event.target.id === "checkoutMethod") {
      dialog.querySelector("#checkoutCard").innerHTML =
        order.method === "wallet"
          ? `<strong>SKYFORGE DEMO WALLET</strong>${text("Sandbox balance · unlimited test funds", "Saldo sandbox · dana uji tanpa batas")}`
          : `SKYFORGE TEST CARD<strong>4242 · 4242 · 4242 · 4242</strong>${text("Preset test card · no real details needed", "Kartu uji bawaan · tidak perlu data asli")}`;
    }

    update();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target.closest(".checkout-close")) dialog.close();
    if (event.target.closest(".checkout-close-action")) dialog.close();

    if (event.target.id === "checkoutApply") {
      order.promo =
        dialog.querySelector("#checkoutPromo").value.trim().toUpperCase() ===
        "FORGE10";
      dialog.querySelector("#checkoutPromoStatus").textContent = order.promo
        ? text(
            "FORGE10 applied. Extra 10% off after the annual discount.",
            "FORGE10 aktif. Tambahan diskon 10% setelah diskon tahunan.",
          )
        : text(
            "Code not found. Try FORGE10.",
            "Kode tidak ditemukan. Coba FORGE10.",
          );
      update();
    }

    if (event.target.id === "checkoutAgain") {
      window.openDemoCheckout(order.plan);
    }

    if (event.target.id === "checkoutDownload" && receipt) {
      downloadReceipt();
      const status = dialog.querySelector("#checkoutReceiptStatus");
      if (status) {
        status.textContent = text(
          "Receipt downloaded as an HTML file that can be opened or printed anytime.",
          "Struk diunduh sebagai file HTML yang bisa dibuka atau dicetak kapan saja.",
        );
      }
    }

    if (event.target.id === "checkoutPrint" && receipt) {
      printReceipt();
    }
  });

  dialog.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = dialog.querySelector("form");
    if (!form || !form.checkValidity() || dialog.dataset.processing === "true") {
      return;
    }

    dialog.dataset.processing = "true";
    form
      .querySelectorAll("button,input,select")
      .forEach((element) => (element.disabled = true));

    dialog.querySelector("#checkoutPay").textContent = text(
      "Processing demo payment…",
      "Memproses pembayaran demo…",
    );
    dialog.querySelector("#checkoutStatus").textContent = text(
      "Simulating authorization. No bank is contacted.",
      "Simulasi otorisasi. Tidak terhubung ke bank.",
    );

    timer = setTimeout(() => {
      dialog.dataset.processing = "false";
      if (!dialog.open) return;

      if (order.outcome === "declined") {
        form
          .querySelectorAll("button,input,select")
          .forEach((element) => (element.disabled = false));
        update();
        dialog.querySelector("#checkoutStatus").textContent = text(
          "Test payment declined. Choose Successful payment above and retry.",
          "Pembayaran uji ditolak. Pilih Pembayaran berhasil di atas lalu coba lagi.",
        );
        dialog.querySelector("#checkoutOutcome").focus();
        return;
      }

      receipt = {
        ...totals(),
        id: receiptId(),
        date: new Date().toLocaleString(
          state.lang === "id" ? "id-ID" : "en-GB",
          {
            dateStyle: "medium",
            timeStyle: "medium",
          },
        ),
      };

      renderSuccess();
    }, 1200);
  });

  dialog.addEventListener("close", () => {
    clearTimeout(timer);
    dialog.dataset.processing = "false";
  });
})();
