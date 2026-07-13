/* Проявление титров из темноты. Без JS и при reduced-motion титры просто
 * видны: класс .js на <html> включает скрытие только когда есть кому проявлять.
 */
(() => {
  "use strict";

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.documentElement.classList.add("js");

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("lit");
        io.unobserve(e.target);   // титр проявляется один раз, как в кино
      }
    }
  }, { threshold: 0.35 });

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();
