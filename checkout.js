"use strict";
(() => {
  const prices = { Starter: 89000, Professional: 249000, Business: 699000 };
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
  const totals = () => {
    const subtotal =
      prices[order.plan] *
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
    dialog.querySelector("#checkoutAmount").textContent = rupiah(
      totals().total,
    );
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
      `<div class="checkout-layout"><aside class="checkout-summary"><span class="checkout-kicker">ORDER SUMMARY</span><h2 id="checkoutTitle">${text("Configure your cloud.", "Atur cloud pilihanmu.")}</h2><div class="checkout-amount" id="checkoutAmount"></div><p class="checkout-caption" id="checkoutPeriod"></p><dl class="checkout-totals" id="checkoutTotals"></dl><div class="checkout-notice">${text("Demo only. No money moves, no subscription starts and no server is created.", "Hanya simulasi. Tidak ada uang ditarik, langganan dimulai, atau server dibuat.")}</div><p class="checkout-caption">${text("Try promo code", "Coba kode promo")} <strong>FORGE10</strong> · ${text("extra 10% off", "diskon tambahan 10%")}</p></aside><form class="checkout-form"><div class="checkout-row"><label class="checkout-field">${text("Plan", "Paket")}<select id="checkoutPlan">${Object.keys(
        prices,
      )
        .map(
          (plan) =>
            `<option${order.plan === plan ? " selected" : ""}>${plan}</option>`,
        )
        .join(
          "",
        )}</select></label><label class="checkout-field">${text("Billing period", "Periode tagihan")}<select id="checkoutBilling"><option value="monthly"${order.billing === "monthly" ? " selected" : ""}>${text("Monthly", "Bulanan")}</option><option value="yearly"${order.billing === "yearly" ? " selected" : ""}>${text("Yearly · save 20%", "Tahunan · hemat 20%")}</option></select></label></div><div class="checkout-row"><label class="checkout-field">${text("Instances", "Jumlah instance")}<input id="checkoutQuantity" type="number" min="1" max="20" step="1" value="1" required></label><label class="checkout-field">Region<select id="checkoutRegion">${Object.entries(
        regions,
      )
        .map(
          ([key, region]) =>
            `<option value="${key}"${key === order.region ? " selected" : ""}>${region.name}</option>`,
        )
        .join(
          "",
        )}</select></label></div><label class="checkout-field">${text("Promo code", "Kode promo")}<span class="checkout-promo"><input id="checkoutPromo" placeholder="FORGE10" maxlength="20" autocomplete="off"><button type="button" id="checkoutApply">${text("Apply", "Terapkan")}</button></span></label><p class="checkout-caption" id="checkoutPromoStatus" role="status"></p><label class="checkout-field">${text("Test payment method", "Metode pembayaran uji")}<select id="checkoutMethod"><option value="card">${text("Demo card", "Kartu demo")}</option><option value="wallet">${text("Demo wallet", "Dompet demo")}</option></select></label><div class="checkout-card" id="checkoutCard">SKYFORGE TEST CARD<strong>4242 · 4242 · 4242 · 4242</strong><span>${text("Preset test card. Do not enter real payment details.", "Kartu uji bawaan. Tidak perlu memasukkan data pembayaran asli.")}</span></div><label class="checkout-field">${text("Simulation result", "Hasil simulasi")}<select id="checkoutOutcome"><option value="success">${text("Successful payment", "Pembayaran berhasil")}</option><option value="declined">${text("Declined · test retry", "Ditolak · uji coba ulang")}</option></select></label><p class="checkout-status" id="checkoutStatus" role="status" aria-live="polite"></p><button class="checkout-pay" type="submit" id="checkoutPay"></button><p class="checkout-caption">${text("No account, email or real card details required. No automatic renewal.", "Tidak membutuhkan akun, email, atau kartu asli. Tidak ada perpanjangan otomatis.")}</p></form></div>`;
    update();
  };
  window.openDemoCheckout = (plan = "Starter") => {
    clearTimeout(timer);
    dialog.dataset.processing = "false";
    receipt = null;
    order = {
      plan: Object.hasOwn(prices, plan) ? plan : "Starter",
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
    if (mappings[event.target.id])
      order[mappings[event.target.id]] = event.target.value;
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
    if (event.target.id === "checkoutAgain")
      window.openDemoCheckout(order.plan);
    if (event.target.id === "checkoutDownload" && receipt) {
      const content = `SKYFORGE — DEMO RECEIPT\nNOT A REAL TRANSACTION\n\n${receipt.id}\n${receipt.date}\nPlan: ${order.plan}\nInstances: ${order.quantity}\nRegion: ${regions[order.region].name}\nBilling: ${order.billing}\nMethod: Demo ${order.method}\nSubtotal: ${rupiah(receipt.subtotal)}\nAnnual discount: ${rupiah(receipt.annualDiscount)}\nPromo discount: ${rupiah(receipt.promoDiscount)}\nDemo total: ${rupiah(receipt.total)}\n\nNo funds charged. No subscription or server created.\n`;
      const url = URL.createObjectURL(
        new Blob([content], { type: "text/plain;charset=utf-8" }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${receipt.id}.txt`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  });
  dialog.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = dialog.querySelector("form");
    if (!form || !form.checkValidity() || dialog.dataset.processing === "true")
      return;
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
        id: "DEMO-" + Date.now().toString(36).toUpperCase(),
        date: new Date().toLocaleString(
          state.lang === "id" ? "id-ID" : "en-GB",
        ),
      };
      dialog.innerHTML =
        header() +
        `<div class="checkout-success"><div class="checkout-success-icon" aria-hidden="true">✓</div><p class="checkout-kicker">SANDBOX · COMPLETED</p><h2 id="checkoutTitle">${text("Demo payment complete.", "Pembayaran demo berhasil.")}</h2><p class="checkout-caption">${text("Your checkout journey is complete. No funds were charged.", "Alur checkout selesai. Tidak ada uang yang ditarik.")}</p><dl class="checkout-totals">${rows()}<div><dt>Region</dt><dd>${regions[order.region].name}</dd></div><div><dt>${text("Reference", "Referensi")}</dt><dd>${receipt.id}</dd></div></dl><div class="checkout-actions"><button class="checkout-pay" id="checkoutDownload">${text("Download demo receipt", "Unduh struk demo")}</button><button class="checkout-secondary" id="checkoutAgain">${text("Try another order", "Coba pesanan lain")}</button><button class="checkout-secondary checkout-close-action">${text("Done", "Selesai")}</button></div><p class="checkout-caption">${text("Nothing is stored or sent to a payment service.", "Tidak ada data disimpan atau dikirim ke layanan pembayaran.")}</p></div>`;
      dialog.querySelector("#checkoutDownload").focus();
    }, 1500);
  });
  dialog.addEventListener("close", () => {
    clearTimeout(timer);
    dialog.dataset.processing = "false";
  });
})();
