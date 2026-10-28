/* CesiumJS loads only when the region section approaches the viewport. */
(() => {
  "use strict";
  const host = document.getElementById("serverGlobe");
  if (!host) return;
  const base = "https://cesium.com/downloads/cesiumjs/releases/1.121/Build/Cesium/";
  const locations = {
    jkt: { city: "Jakarta", code: "JKT-1", country: "Indonesia", lon: 106.8456, lat: -6.2088 },
    sgp: { city: "Singapore", code: "SGP-1", country: "Singapore", lon: 103.8198, lat: 1.3521 },
    tyo: { city: "Tokyo", code: "TYO-1", country: "Japan", lon: 139.6917, lat: 35.6895 }
  };
  let viewer, selected = document.getElementById("regionSelect")?.value || "jkt", started = false;
  const status = document.getElementById("earthStatus");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function overview() {
    viewer?.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(119, 13, 16000000), duration: reduced ? 0 : 1.5 });
  }
  function select(code, fly = true) {
    if (!locations[code]) return;
    selected = code;
    const r = locations[code];
    document.getElementById("earthCity").textContent = `${r.city} · ${r.code}`;
    document.getElementById("earthCountry").textContent = `${r.country} · ${Math.abs(r.lat).toFixed(2)}° ${r.lat < 0 ? "S" : "N"}, ${r.lon.toFixed(2)}° E`;
    if (!viewer) return;
    viewer.entities.values.forEach(entity => {
      const active = entity.id === code;
      entity.point.pixelSize = active ? 17 : 11;
      entity.point.color = Cesium.Color.fromCssColorString(active ? "#78e0cd" : "#8eafff");
    });
    if (fly) viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(r.lon, r.lat, 4800000), duration: reduced ? 0 : 1.4 });
  }
  window.addEventListener("skyforge:region", event => select(event.detail.code));
  document.getElementById("earthReset").addEventListener("click", overview);
  async function start() {
    if (started) return;
    started = true;
    try {
      window.CESIUM_BASE_URL = base;
      const css = document.createElement("link"); css.rel = "stylesheet"; css.href = base + "Widgets/widgets.css"; document.head.append(css);
      await new Promise((resolve, reject) => {
        if (window.Cesium) return resolve();
        const script = document.createElement("script"); script.src = base + "Cesium.js";
        script.onload = resolve; script.onerror = () => reject(new Error("Cesium download failed")); document.head.append(script);
      });
      viewer = new Cesium.Viewer(host, {
        baseLayer: false, baseLayerPicker: false, geocoder: false, animation: false,
        timeline: false, homeButton: false, sceneModePicker: false, navigationHelpButton: false,
        fullscreenButton: false, infoBox: false, selectionIndicator: false,
        requestRenderMode: true, maximumRenderTimeChange: Infinity, scene3DOnly: true
      });
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#071120");
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#193f62");
      viewer.scene.screenSpaceCameraController.minimumZoomDistance = 300000;
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = 26000000;
      Object.entries(locations).forEach(([id, r]) => viewer.entities.add({
        id, position: Cesium.Cartesian3.fromDegrees(r.lon, r.lat, 15000),
        point: { pixelSize: 11, color: Cesium.Color.fromCssColorString("#8eafff"), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
        label: { text: r.city + " · " + r.code, font: "14px sans-serif", fillColor: Cesium.Color.WHITE,
          showBackground: true, backgroundColor: Cesium.Color.fromCssColorString("#0a172cdd"),
          pixelOffset: new Cesium.Cartesian2(0, -28), style: Cesium.LabelStyle.FILL }
      }));
      viewer.screenSpaceEventHandler.setInputAction(event => {
        const hit = viewer.scene.pick(event.position);
        if (hit?.id && locations[hit.id.id]) {
          const card = document.querySelector(`.region-card[data-region="${hit.id.id}"]`);
          card?.click();
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      overview(); select(selected, false); status.textContent = "";
      try {
        const imagery = await Cesium.TileMapServiceImageryProvider.fromUrl(base + "Assets/Textures/NaturalEarthII");
        viewer.imageryLayers.addImageryProvider(imagery);
      } catch (_) { status.textContent = "Earth imagery unavailable. Region markers remain interactive."; }
    } catch (error) {
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
      viewer = null;
      status.textContent = "3D Earth could not load. Check your connection and WebGL support. Use the region cards below to explore locations.";
      console.warn("SKYFORGE globe:", error);
    }
  }
  select(selected, false);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); start(); }
    }, { rootMargin: "400px" }); observer.observe(host);
  } else start();
})();
