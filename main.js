/* Сквозной нырок: десять миров на одной оси глубины.
 *
 * Страница осмысленна и без этого файла — десять полноэкранных секций, которые
 * читаются сверху вниз. Здесь надстраивается единственный эффект: слои
 * складываются по оси глубины, скролл ведёт камеру внутрь кадра, место
 * наплывает, держится ровно столько, чтобы прочитать подпись, и пролетает
 * мимо, а из его центра растёт следующее.
 *
 * Слой i стоит на глубине чтения при p = i, где p — прокрутка в экранах.
 * Масштаб 2^(p−i): вдалеке крошечный, на глубине чтения ровно 1, при пролёте
 * разрастается за края. Анимируются только transform и opacity.
 */
(() => {
  "use strict";

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const stage = document.querySelector(".stage");
  const dive = document.querySelector(".dive");
  const odometer = document.getElementById("odometer-value");
  const layers = [...document.querySelectorAll(".hero, .place")];
  if (!stage || !dive || !odometer || layers.length < 2) return;

  const SPAN = 2.2;   // на какой глубине слой начинает проявляться
  const RISE = 0.9;   // за сколько шагов он проявляется
  const PAST = 0.6;   // за сколько растворяется, пролетая сквозь читателя
  const READ = 0.55;  // в каком коридоре вокруг глубины чтения видна подпись

  const totals = layers.map((layer) => Number(layer.dataset.total));
  const bodies = layers.map((layer) => layer.querySelector(".body"));
  const root = document.documentElement;
  const last = layers.length - 1;

  root.classList.add("dive-on");

  // Ближний слой перекрывает дальний. Маршрут идёт от первой точки к последней,
  // значит первая и пролетает первой — она и должна лежать сверху.
  layers.forEach((layer, i) => { layer.style.zIndex = String(layers.length - i); });

  // Обёртка держит прокрутку: по экрану на слой плюс один на пролёт последнего.
  dive.style.height = `${(layers.length + 1) * 100}svh`;

  const format = (km) => Math.round(km).toLocaleString("ru-RU");

  const opacityAt = (d) => {
    if (d > SPAN || d < -PAST) return 0;             // ещё далеко или уже позади
    if (d > SPAN - RISE) return (SPAN - d) / RISE;   // проявляется в глубине
    if (d < 0) return 1 + d / PAST;                  // растворяется при пролёте
    return 1;
  };

  // Подпись живёт по своей кривой, куда короче кадра: два места, читаемых
  // одновременно, — это не нырок, а каша. Кадры пусть накладываются, слова нет.
  const captionAt = (d) => Math.max(0, Math.min(1, 1 - Math.abs(d) / READ));

  let ticking = false;

  const draw = () => {
    ticking = false;
    const p = Math.min(Math.max(window.scrollY / window.innerHeight, 0), layers.length);

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const d = i - p;
      const opacity = opacityAt(d);

      // Невидимый слой снимается с отрисовки, а не просто гасится: иначе
      // браузер держит одиннадцать полноэкранных кадров разом — и грузит их.
      if (opacity <= 0) {
        if (layer.style.display !== "none") layer.style.display = "none";
        continue;
      }
      if (layer.style.display === "none") layer.style.display = "";
      layer.style.opacity = opacity.toFixed(3);
      layer.style.transform = `scale(${(2 ** -d).toFixed(4)})`;
      bodies[i].style.opacity = captionAt(d).toFixed(3);
    }

    // Счётчик идёт между накопленными расстояниями соседних точек, поэтому на
    // глубине чтения показывает ровно то же, что написано в подписи.
    const i = Math.min(Math.floor(p), last);
    const j = Math.min(i + 1, last);
    odometer.textContent = format(totals[i] + (totals[j] - totals[i]) * (p - i));
  };

  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(draw);
  };

  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", request, { passive: true });
  draw();
})();
