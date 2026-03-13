(function () {
  const layer = document.getElementById("butterflies-layer");
  if (!layer) return;

  const BUTTERFLIES = 14;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  for (let i = 0; i < BUTTERFLIES; i++) {
    const b = document.createElement("div");
    b.className = "butterfly";
    b.innerHTML = "🦋";

    const top = rand(10, 90);
    const left = rand(-20, 120);
    const size = rand(16, 34);

    const duration = rand(8, 18);
    const delay = rand(0, 8);

    b.style.top = `${top}vh`;
    b.style.left = `${left}vw`;
    b.style.fontSize = `${size}px`;
    b.style.animationDuration = `${duration}s`;
    b.style.animationDelay = `${delay}s`;

    layer.appendChild(b);
  }
})();
(function () {
  const layer = document.getElementById("butterflies-layer");
  if (!layer) return;

  const BUTTERFLIES = 14;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  for (let i = 0; i < BUTTERFLIES; i++) {
    const b = document.createElement("div");
    b.className = "butterfly";
    b.innerHTML = "🦋";

    const top = rand(10, 90);
    const left = rand(-20, 120);
    const size = rand(16, 34);

    const duration = rand(8, 18);
    const delay = rand(0, 8);

    // ✅ IMPORTANT: Use backticks ` `
    b.style.top = `${top}vh`;
    b.style.left = `${left}vw`;
    b.style.fontSize = `${size}px`;
    b.style.animationDuration = `${duration}s`;
    b.style.animationDelay = `${delay}s`;

    layer.appendChild(b);
  }
})();
