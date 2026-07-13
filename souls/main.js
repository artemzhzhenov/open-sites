/* Свет по бумаге — единственная анимация на странице.
 *
 * «…all it takes is a little light for the past to rise through the paper.»
 * Полоса света идёт по секции «чистая страница» вместе с прокруткой; водяной
 * знак, оказавшийся на её пути, всплывает до читаемости и снова тонет.
 * Анимируются только transform и opacity.
 */
(() => {
  "use strict";

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const section = document.getElementById("blank-page");
  const marks = [...document.querySelectorAll(".wm")];
  if (!section || marks.length === 0) return;

  const bar = document.createElement("div");
  bar.className = "lightbar";
  bar.setAttribute("aria-hidden", "true");
  section.prepend(bar);

  let ticking = false;

  const draw = () => {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;

    // Прогресс секции сквозь экран: 0 — верх ещё внизу, 1 — низ уже вверху.
    const t = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);

    const barH = vh * 0.46;
    const y = t * (rect.height + barH) - barH;
    bar.style.transform = `translateY(${y.toFixed(1)}px)`;

    const lightCenter = rect.top + y + barH / 2;
    for (const mark of marks) {
      const m = mark.getBoundingClientRect();
      const d = Math.abs(m.top + m.height / 2 - lightCenter);
      const lit = Math.max(0, 1 - d / (barH * 0.75));
      mark.style.setProperty("--wm-lit", lit.toFixed(3));
    }
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
