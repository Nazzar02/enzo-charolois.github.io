(() => {
  const body = document.body;
  const track = document.querySelector(".slides");
  const slides = track ? Array.from(track.children) : [];

  if (!track || !slides.length) {
    return;
  }

  const query = new URLSearchParams(window.location.search);
  const printMode = query.has("print-pdf");

  const tocNode = document.querySelector("[data-toc]");
  const printLink = document.querySelector("[data-print-link]");

  const clamp = (value) => Math.max(0, Math.min(value, slides.length - 1));
  const hashFor = (index) => `#/${index + 1}`;

  const readHash = () => {
    const match = window.location.hash.match(/^#\/(\d+)$/);
    return match ? clamp(Number(match[1]) - 1) : 0;
  };

  const tocLinks = [];
  if (tocNode) {
    slides.forEach((slide, index) => {
      const link = document.createElement("a");
      link.href = hashFor(index);
      link.textContent = slide.dataset.title || `Slide ${index + 1}`;
      link.addEventListener("click", (event) => {
        if (printMode) {
          return;
        }

        event.preventDefault();
        goTo(index);
      });
      tocNode.appendChild(link);
      tocLinks.push(link);
    });
  }

  const positionToc = (index) => {
    const active = tocLinks[index];
    if (!active || !tocNode) {
      return;
    }

    const target = active.offsetLeft + active.offsetWidth / 2 - tocNode.clientWidth / 2;
    const maxScroll = Math.max(0, tocNode.scrollWidth - tocNode.clientWidth);
    tocNode.scrollLeft = Math.max(0, Math.min(target, maxScroll));
  };

  let current = readHash();

  const update = (shouldWriteHash) => {
    slides.forEach((slide, index) => {
      const active = index === current;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });

    if (!printMode) {
      track.style.transform = `translateX(${-100 * current}vw)`;
    }

    tocLinks.forEach((link, index) => {
      link.classList.toggle("is-active", index === current);
    });

    positionToc(current);

    if (printLink) {
      printLink.href = `?print-pdf${hashFor(current)}`;
    }

    if (shouldWriteHash) {
      const nextHash = hashFor(current);
      if (window.location.hash !== nextHash) {
        history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
      }
    }
  };

  const goTo = (index, shouldWriteHash = true) => {
    current = clamp(index);
    update(shouldWriteHash);
  };

  if (printMode) {
    body.classList.add("print-pdf");
    update(false);
    return;
  }

  if (!window.location.hash) {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hashFor(current)}`);
  }

  update(false);

  window.addEventListener("hashchange", () => {
    goTo(readHash(), false);
  });

  window.addEventListener("resize", () => {
    update(false);
  });

  document.addEventListener("keydown", (event) => {
    const tagName = event.target && event.target.tagName ? event.target.tagName.toLowerCase() : "";
    if (["input", "textarea", "select"].includes(tagName)) {
      return;
    }

    switch (event.key) {
      case "ArrowRight":
      case "PageDown":
      case " ":
      case "Enter":
        event.preventDefault();
        goTo(current + 1);
        break;
      case "ArrowLeft":
      case "PageUp":
      case "Backspace":
        event.preventDefault();
        goTo(current - 1);
        break;
      case "Home":
        event.preventDefault();
        goTo(0);
        break;
      case "End":
        event.preventDefault();
        goTo(slides.length - 1);
        break;
      default:
        break;
    }
  });
})();
