"use strict";
if (typeof window.matchMedia === "function") {
  const magneticMedia = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  );
  const magneticButtons = $$("[data-magnetic]").map((button) => ({
    button,
    x: 0,
    y: 0,
  }));
  let magneticFrame = 0;
  let magneticPointer = null;
  const setMagnetic = (item, x, y) => {
    item.x = x;
    item.y = y;
    item.button.style.setProperty("--magnetic-x", `${x}px`);
    item.button.style.setProperty("--magnetic-y", `${y}px`);
    item.button.style.setProperty("--magnetic-inner-x", `${-x * 0.65}px`);
    item.button.style.setProperty("--magnetic-inner-y", `${-y * 0.65}px`);
  };
  const resetMagnetic = () => {
    magneticPointer = null;
    cancelAnimationFrame(magneticFrame);
    magneticFrame = 0;
    magneticButtons.forEach((item) => setMagnetic(item, 0, 0));
  };
  document.addEventListener(
    "pointermove",
    (event) => {
      if (!magneticMedia.matches || event.pointerType !== "mouse") return;
      magneticPointer = { x: event.clientX, y: event.clientY };
      if (magneticFrame) return;
      magneticFrame = requestAnimationFrame(() => {
        magneticFrame = 0;
        if (!magneticPointer) return;
        magneticButtons.forEach((item) => {
          const rect = item.button.getBoundingClientRect();
          const translation = getComputedStyle(item.button)
            .translate.split(" ")
            .map(parseFloat);
          const dx =
            magneticPointer.x -
            (rect.left + rect.width / 2 - (translation[0] || 0));
          const dy =
            magneticPointer.y -
            (rect.top + rect.height / 2 - (translation[1] || 0));
          const distance = Math.hypot(
            dx / (rect.width / 2 + 32),
            dy / (rect.height / 2 + 32),
          );
          if (distance >= 1 || item.button.matches(":focus-visible")) {
            setMagnetic(item, 0, 0);
            return;
          }
          const length = Math.hypot(dx, dy) || 1;
          const pull = 5 * Math.sin(distance * Math.PI);
          setMagnetic(item, (dx / length) * pull, (dy / length) * pull);
        });
      });
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", resetMagnetic);
  document.addEventListener("focusin", resetMagnetic);
  window.addEventListener("scroll", resetMagnetic, { passive: true });
  window.addEventListener("blur", resetMagnetic);
  window.addEventListener("resize", resetMagnetic);
  magneticMedia.addEventListener("change", resetMagnetic);
}

if (typeof window.matchMedia === "function") {
  const cursorMedia = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  );
  const cursor = document.createElement("div");
  cursor.className = "skyforge-cursor";
  cursor.setAttribute("aria-hidden", "true");
  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  cursor.append(dot, ring);
  document.body.append(cursor);
  let cursorFrame = 0;
  let cursorX = 0;
  let cursorY = 0;
  let ringX = 0;
  let ringY = 0;
  let previousTime = 0;
  let cursorVisible = false;
  const hideCursor = () => {
    cursorVisible = false;
    cursor.classList.remove("is-visible");
    document.documentElement.classList.remove("custom-cursor-active");
    cancelAnimationFrame(cursorFrame);
    cursorFrame = 0;
    previousTime = 0;
  };
  const followCursor = (time) => {
    const elapsed = previousTime ? Math.min(time - previousTime, 50) : 16.67;
    previousTime = time;
    const ease = 1 - Math.exp(-elapsed / 65);
    ringX += (cursorX - ringX) * ease;
    ringY += (cursorY - ringY) * ease;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    if (cursorVisible && Math.hypot(cursorX - ringX, cursorY - ringY) > 0.1) {
      cursorFrame = requestAnimationFrame(followCursor);
    } else {
      cursorFrame = 0;
      previousTime = 0;
    }
  };
  document.addEventListener(
    "pointermove",
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (
        !cursorMedia.matches ||
        event.pointerType !== "mouse" ||
        !target ||
        target.closest(
          "input, textarea, select, [contenteditable], dialog[open], iframe",
        )
      ) {
        hideCursor();
        return;
      }
      cursorX = event.clientX;
      cursorY = event.clientY;
      if (!cursorVisible) {
        ringX = cursorX;
        ringY = cursorY;
        cursorVisible = true;
        cursor.classList.add("is-visible");
        document.documentElement.classList.add("custom-cursor-active");
      }
      dot.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      const interactive = target.closest(
        "a, button, summary, [role='button'], [role='tab']",
      );
      const label =
        !interactive &&
        (target.closest(".dashboard-shell")
          ? "Explore"
          : target.closest("#architecture")
            ? "View"
            : "");
      cursor.classList.toggle("is-interactive", Boolean(interactive));
      cursor.classList.toggle("has-label", Boolean(label));
      ring.textContent = label || "";
      if (!cursorFrame) cursorFrame = requestAnimationFrame(followCursor);
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", hideCursor);
  document.addEventListener("pointerdown", (event) => {
    if (
      event.pointerType !== "mouse" ||
      event.target.closest(
        "[data-open-brief], [data-plan], [data-info], input, textarea, select",
      )
    )
      hideCursor();
  });
  document.addEventListener("keydown", hideCursor);
  document.addEventListener("visibilitychange", hideCursor);
  window.addEventListener("blur", hideCursor);
  window.addEventListener("scroll", hideCursor, { passive: true });
  cursorMedia.addEventListener("change", hideCursor);
}
