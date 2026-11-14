"use strict";
(() => {
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
  const dialog = document.createElement("dialog");
  dialog.className = "cloud-dialog";
  document.body.append(dialog);
  const meta = {
    volumes: ["Volumes", "Volume SSD untuk resource compute.", "Create volume"],
    networks: [
      "Networks",
      "Jaringan privat untuk mengelompokkan resource.",
      "Create network",
    ],
    keys: [
      "API Keys",
      "Token demo untuk mencoba alur pengelolaan akses.",
      "Create demo key",
    ],
  };
  const list = (data, view) => data[view] || (data[view] = []);
  window.skyforgeExtras = {
    render(data, view) {
      const [title, description, create] = meta[view];
      const items = list(data, view);
      const rows = items
        .map(
          (item) =>
            `<tr><td>${escape(item.name)}<small>${escape(item.id)}</small></td><td>${view === "keys" ? escape(item.scope) : escape(item.region)}</td><td>${view === "volumes" ? item.size + " GB SSD" : view === "networks" ? escape(item.cidr) : "<code>demo_not_valid_••••" + escape(item.token.slice(-4)) + "</code>"}</td><td>${view === "volumes" ? escape(item.attached || "Unattached") : view === "keys" ? "Demo only" : "Private · demo"}</td><td><div class="table-actions">${view === "keys" ? `<button data-extra-copy="${escape(item.id)}">Copy demo token</button>` : ""}<button class="delete-action" data-extra-delete="${escape(item.id)}" data-extra-view="${view}">${view === "keys" ? "Revoke" : "Delete"}</button></div></td></tr>`,
        )
        .join("");
      return `<div class="view-heading"><div><h1>${title}</h1><p>${description}</p></div><button class="cloud-button primary" data-extra-create="${view}">+ ${create}</button></div><div class="cloud-notice">${view === "keys" ? "Token berawalan demo_not_valid_ dan tidak dapat digunakan untuk autentikasi nyata. Jangan tempelkan secret asli di console ini." : "Resource hanya disimulasikan di sesi browser. Volume dapat diasosiasikan dengan instance pada region yang sama."}</div><div class="cloud-panel" style="margin-top:22px"><div class="panel-heading"><h2>${title} (${items.length})</h2><small>Sandbox resources</small></div><div class="cloud-table-wrap"><table class="cloud-table"><thead><tr><th>NAME</th><th>${view === "keys" ? "SCOPE" : "REGION"}</th><th>${view === "volumes" ? "CAPACITY" : view === "networks" ? "CIDR" : "TOKEN"}</th><th>${view === "volumes" ? "ATTACHED TO" : "STATUS"}</th><th>ACTIONS</th></tr></thead><tbody>${rows}</tbody></table>${items.length ? "" : '<div class="empty-state">Belum ada resource. Buat resource demo pertama dengan tombol di atas.</div>'}</div></div>`;
    },
    handle(event, data, activity, render, notify) {
      const target = event.target.closest("button");
      if (!target) return false;
      if (target.dataset.extraCopy) {
        const key = list(data, "keys").find(
          (x) => x.id === target.dataset.extraCopy,
        );
        if (key) {
          if (navigator.clipboard)
            navigator.clipboard
              .writeText(key.token)
              .then(() => notify("Token DEMO disalin"))
              .catch(() =>
                notify(
                  "Clipboard diblokir. Token demo bukan kredensial nyata.",
                ),
              );
          else notify("Clipboard tidak tersedia pada browser ini.");
        }
        return true;
      }
      if (target.dataset.extraDelete) {
        const view = target.dataset.extraView;
        const item = list(data, view).find(
          (x) => x.id === target.dataset.extraDelete,
        );
        if (!item) return true;
        dialog.innerHTML = `<h2 id="extraTitle">${view === "keys" ? "Revoke demo key?" : "Hapus resource demo?"}</h2><p class="muted">${escape(item.name)} akan dihapus dari sesi demo.</p><div class="dialog-actions"><button class="cloud-button secondary" data-extra-cancel>Batal</button><button class="cloud-button danger" id="extraConfirm">${view === "keys" ? "Revoke" : "Hapus"}</button></div>`;
        dialog.setAttribute("aria-labelledby", "extraTitle");
        dialog
          .querySelector("[data-extra-cancel]")
          .addEventListener("click", () => dialog.close());
        dialog.querySelector("#extraConfirm").addEventListener("click", () => {
          data[view] = list(data, view).filter((x) => x !== item);
          activity(
            `${item.name}: ${view === "keys" ? "demo key revoked" : "resource dihapus"} (demo)`,
          );
          render();
          dialog.close();
          notify("Resource demo diperbarui");
        });
        dialog.showModal();
        return true;
      }
      const view = target.dataset.extraCreate;
      if (!meta[view]) return false;
      if (list(data, view).length >= 12) {
        notify("Batas demo: maksimal 12 resource per jenis.");
        return true;
      }
      const regionOptions = ["Jakarta", "Singapore", "Tokyo"]
        .map((region) => `<option>${region}</option>`)
        .join("");
      dialog.innerHTML = `<div class="dialog-title"><div><span class="overline">SANDBOX RESOURCE</span><h2 id="extraTitle">${meta[view][2]}</h2></div></div><form id="extraForm"><label class="cloud-field">Name<input name="name" required minlength="2" maxlength="40" pattern="[a-zA-Z0-9][a-zA-Z0-9-]{1,39}" value="${view === "keys" ? "development-key" : view === "networks" ? "private-network" : "data-volume"}"></label>${view === "keys" ? '<label class="cloud-field">Scope<select name="scope"><option>Read only</option><option>Read & write · demo</option></select></label>' : `<label class="cloud-field">Region<select name="region" id="extraRegion">${regionOptions}</select></label>`}${view === "volumes" ? '<label class="cloud-field">Capacity (GB)<input name="size" type="number" min="20" max="1000" step="20" value="80" required></label><label class="cloud-field">Attach to instance<select name="attached" id="extraAttached"></select></label>' : ""}${view === "networks" ? '<label class="cloud-field">Private subnet<select name="cidr"><option>10.42.0.0/24</option><option>10.43.0.0/24</option><option>10.44.0.0/24</option></select></label>' : ""}<p class="muted">Simulasi lokal. Tidak membuat resource atau akses nyata.</p><p class="form-status" id="extraError" role="status"></p><div class="dialog-actions"><button type="button" class="cloud-button secondary" data-extra-cancel>Batal</button><button class="cloud-button primary" type="submit">Create demo resource →</button></div></form>`;
      dialog.setAttribute("aria-labelledby", "extraTitle");
      const attachOptions = () => {
        if (view !== "volumes") return;
        const region = dialog.querySelector("#extraRegion").value;
        dialog.querySelector("#extraAttached").innerHTML =
          '<option value="">Unattached</option>' +
          data.instances
            .filter((x) => x.region === region)
            .map(
              (x) =>
                `<option value="${escape(x.name)}">${escape(x.name)}</option>`,
            )
            .join("");
      };
      attachOptions();
      if (view === "volumes")
        dialog
          .querySelector("#extraRegion")
          .addEventListener("change", attachOptions);
      dialog
        .querySelector("[data-extra-cancel]")
        .addEventListener("click", () => dialog.close());
      dialog.querySelector("form").addEventListener("submit", (ev) => {
        ev.preventDefault();
        const form = ev.target;
        if (!form.checkValidity()) return;
        const fields = new FormData(form);
        const name = String(fields.get("name")).trim();
        if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,39}$/.test(name)) return;
        const items = list(data, view);
        if (items.some((x) => x.name === name)) {
          dialog.querySelector("#extraError").textContent =
            "Nama resource sudah dipakai.";
          return;
        }
        const item = { id: view + "-" + Date.now().toString(36), name };
        if (view === "keys") {
          const bytes = new Uint8Array(10);
          crypto.getRandomValues(bytes);
          item.token =
            "demo_not_valid_" +
            Array.from(bytes, (x) => x.toString(16).padStart(2, "0")).join("");
          item.scope = String(fields.get("scope"));
        } else {
          item.region = String(fields.get("region"));
          if (!["Jakarta", "Singapore", "Tokyo"].includes(item.region)) return;
          if (view === "volumes") {
            item.size = Number(fields.get("size"));
            if (item.size < 20 || item.size > 1000 || item.size % 20) return;
            item.attached = String(fields.get("attached") || "");
            if (
              item.attached &&
              !data.instances.some(
                (x) => x.name === item.attached && x.region === item.region,
              )
            )
              return;
          } else {
            item.cidr = String(fields.get("cidr"));
            if (
              items.some(
                (x) => x.region === item.region && x.cidr === item.cidr,
              )
            ) {
              dialog.querySelector("#extraError").textContent =
                "Subnet ini sudah dipakai pada region tersebut.";
              return;
            }
          }
        }
        items.push(item);
        activity(`${name}: ${view} dibuat (demo)`);
        render();
        dialog.close();
        notify("Resource demo berhasil dibuat");
      });
      dialog.showModal();
      return true;
    },
  };
})();
