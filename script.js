(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const cards = document.querySelectorAll(".link-card");
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });
  });

  const stage = document.querySelector(".visual-stage");
  const sculpture = document.getElementById("sculpture");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (stage && sculpture && !reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    stage.addEventListener("pointermove", (event) => {
      const rect = stage.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      sculpture.style.transform = `rotateX(${-13 - py * 9}deg) rotateY(${-25 + px * 12}deg)`;
    });
    stage.addEventListener("pointerleave", () => {
      sculpture.style.transform = "rotateX(-13deg) rotateY(-25deg)";
    });
  }

  const GA_MEASUREMENT_ID = "";
  if (GA_MEASUREMENT_ID.trim()) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID);
    cards.forEach((card) => card.addEventListener("click", () => {
      gtag("event", "outbound_click", { link_name: card.dataset.linkName || "unknown" });
    }));
  }
})();
