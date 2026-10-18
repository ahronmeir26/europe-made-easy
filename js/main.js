// Form submissions are emailed via FormSubmit (https://formsubmit.co).
// The first submission sends a one-time activation email to this address.
const FORM_ENDPOINT = "https://formsubmit.co/ajax/info@EuropeMadeEasy.org";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Mobile navigation
const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector(".nav-menu");
if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

// Footer year
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Scroll reveal (also triggers the to-do list strikethroughs)
const revealTargets = document.querySelectorAll("[data-reveal], .todo");
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
}

// Departure board split-flap effect
const flaps = document.querySelectorAll("[data-flap]");
if (flaps.length && !reduceMotion) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  flaps.forEach((el, i) => {
    const target = el.textContent;
    let frame = 0;
    const settle = 14 + i * 5;
    const timer = setInterval(() => {
      frame++;
      el.textContent = [...target]
        .map((c, j) => (c === " " || frame > settle + j * 2 ? c : chars[Math.floor(Math.random() * chars.length)]))
        .join("");
      if (frame > settle + target.length * 2) {
        el.textContent = target;
        clearInterval(timer);
      }
    }, 45);
  });
}

// Preselect destination on the contact form (contact.html?city=rome)
const destination = document.querySelector("#destination");
if (destination) {
  const city = new URLSearchParams(location.search).get("city");
  const match = city && [...destination.options].find((o) => o.value.toLowerCase() === city.toLowerCase());
  if (match) destination.value = match.value;
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

// Approved reviews (edit data/reviews.json to publish a review)
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
            <div class="stamp" aria-label="${rating} out of 5 stars">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</div>
            <blockquote>“${escape(r.review)}”</blockquote>
            <cite><b>${escape(r.name)}</b>${r.trip ? ` · ${escape(r.trip)}` : ""}</cite>
          </article>`;
        })
        .join("");
      reviewList.classList.add("review-wall");
    })
    .catch(() => {});
}
