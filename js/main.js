// Form submissions are emailed via FormSubmit (https://formsubmit.co).
// The first submission sends a one-time activation email to this address.
const FORM_ENDPOINT = "https://formsubmit.co/ajax/info@EuropeMadeEasy.org";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Header: transparent over the hero photo, solid after scrolling
const bar = document.querySelector(".bar");
const setSolid = () => bar.classList.toggle("solid", window.scrollY > 40);
setSolid();
window.addEventListener("scroll", setSolid, { passive: true });

// Mobile menu
const burger = document.querySelector(".burger");
const nav = document.querySelector(".nav");
if (burger && nav) {
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    bar.classList.toggle("menu", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
}

// Footer year
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Home hero: rotate city photos, tabs pick a city
const hero = document.querySelector(".hero");
if (hero) {
  const slides = [...hero.querySelectorAll(".hero-media img")];
  const tabs = [...hero.querySelectorAll(".hero-tab")];
  let current = 0;
  let timer;

  const show = (i) => {
    current = (i + slides.length) % slides.length;
    const img = slides[current];
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    }
    slides.forEach((s, j) => s.classList.toggle("show", j === current));
    tabs.forEach((t, j) => {
      t.setAttribute("aria-selected", String(j === current));
      // restart the progress bar animation
      t.style.animation = "none";
      void t.offsetWidth;
      t.style.animation = "";
    });
    // warm up the next photo
    const next = slides[(current + 1) % slides.length];
    if (next.dataset.src) {
      next.src = next.dataset.src;
      next.removeAttribute("data-src");
    }
  };
  const start = () => {
    clearInterval(timer);
    if (!reduceMotion) timer = setInterval(() => show(current + 1), 6000);
  };

  tabs.forEach((t, i) =>
    t.addEventListener("click", () => {
      show(i);
      start();
    })
  );
  if (reduceMotion) hero.classList.add("paused");
  show(0);
  start();
}

// Preselect destination on the contact form (contact.html?city=rome)
const destination = document.querySelector("#destination");
if (destination) {
  const city = new URLSearchParams(location.search).get("city");
  const match = city && [...destination.options].find((o) => o.value.toLowerCase() === city.toLowerCase());
  if (match) destination.value = match.value;
}

// Review dialog
const sheet = document.querySelector("#reviewSheet");
if (sheet) {
  document.querySelectorAll("[data-open-review]").forEach((b) => b.addEventListener("click", () => sheet.showModal()));
  sheet.querySelector(".x").addEventListener("click", () => sheet.close());
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet) sheet.close();
  });
}

// Forms
document.querySelectorAll("form[data-ajax]").forEach((form) => {
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type=submit]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    if (data._honey) return;

    button.disabled = true;
    const label = button.innerHTML;
    button.textContent = "Sending…";
    status.className = "form-status";
    status.textContent = "";

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === "false" || json.success === false) throw new Error(json.message || "Send failed");
      status.textContent = form.dataset.success;
      status.className = "form-status ok";
      form.reset();
    } catch (err) {
      status.innerHTML =
        'Sorry, something went wrong. Please email us at <a href="mailto:info@EuropeMadeEasy.org">info@EuropeMadeEasy.org</a> or message us on <a href="https://wa.me/32456741479" target="_blank" rel="noopener">WhatsApp</a>.';
      status.className = "form-status err";
    } finally {
      button.disabled = false;
      button.innerHTML = label;
    }
  });
});

// Published reviews (edit data/reviews.json to publish a review)
const reviewList = document.querySelector("#review-list");
if (reviewList) {
  const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  fetch("data/reviews.json", { cache: "no-cache" })
    .then((res) => res.json())
    .then((reviews) => {
      if (!Array.isArray(reviews) || reviews.length === 0) return;
      reviewList.innerHTML = reviews
        .map((r) => {
          const rating = Math.max(1, Math.min(5, Number(r.rating) || 5));
          return `<article class="review">
            <span class="stars" aria-label="${rating} out of 5 stars">${"★".repeat(rating)}<span style="color:var(--line)">${"★".repeat(5 - rating)}</span></span>
            <p>${escape(r.review)}</p>
            <footer><strong>${escape(r.name)}</strong>${r.trip ? `<span>${escape(r.trip)}</span>` : ""}</footer>
          </article>`;
        })
        .join("");
      reviewList.className = "review-grid";
    })
    .catch(() => {});
}
