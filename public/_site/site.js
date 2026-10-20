// put.gd landing page. No build step; everything here is progressive enhancement.
(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero stage: keep the size readout in step with the CSS-driven selection.
  const sel = document.getElementById("sel");
  const readout = document.getElementById("readout");
  if (sel && readout && !reduced && sel.getAnimations) {
    const W = 612, H = 133, START = 0.20, END = 0.32;
    const tick = () => {
      const anim = sel.getAnimations()[0];
      if (anim && anim.effect) {
        const dur = anim.effect.getComputedTiming().duration;
        const t = ((anim.currentTime || 0) % dur) / dur;
        const p = Math.min(1, Math.max(0, (t - START) / (END - START)));
        const eased = 1 - Math.pow(1 - p, 2);
        readout.textContent = `${Math.round(W * eased)} × ${Math.round(H * eased)}`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  } else if (readout) {
    readout.textContent = "612 × 133";
  }

  // Plates: class-based fallback where scroll-driven animations are missing.
  if (!CSS.supports("animation-timeline: view()") && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
    document.querySelectorAll(".plate").forEach((el) => io.observe(el));
  }

  // Console: type the session out once it scrolls into view.
  const con = document.getElementById("console");
  if (con && !reduced && "IntersectionObserver" in window) {
    const code = con.querySelector("code");
    const full = code.innerHTML;
    const plain = code.textContent;
    code.innerHTML = '<span class="caret"></span>';
    let started = false;
    const io = new IntersectionObserver((entries) => {
      if (started || !entries.some((e) => e.isIntersecting)) return;
      started = true; io.disconnect();
      const lines = full.split("\n");
      let i = 0;
      const step = () => {
        i++;
        code.innerHTML = lines.slice(0, i).join("\n") + (i < lines.length ? '<span class="caret"></span>' : "");
        if (i < lines.length) setTimeout(step, lines[i - 1].startsWith('<span class="dim">#') ? 260 : 520);
      };
      setTimeout(step, 300);
    }, { threshold: 0.4 });
    io.observe(con);
    con.setAttribute("aria-label", "Example putgd-cli session: " + plain.replace(/\s+/g, " ").trim());
  }

  // Copy buttons.
  document.querySelectorAll(".copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.parentElement.querySelector("code").textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied"; btn.classList.add("done");
        setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("done"); }, 1800);
      } catch {
        btn.textContent = "Select and copy";
      }
    });
  });

  // Install table: two channels from releases.json, which the deploy workflow regenerates.
  const table = document.getElementById("packages");
  const line = document.getElementById("releaseLine");
  const channel = document.getElementById("channel");
  const note = document.getElementById("channelNote");
  if (table && line && channel && "fetch" in window) {
    const RELEASES = "https://github.com/patrick-hudson/put.gd-desktop/releases";
    const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    const fmtSize = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;

    const show = (data, name) => {
      const rel = data[name];
      channel.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.channel === name)));
      table.querySelectorAll("tr[data-match]").forEach((tr) => {
        const a = tr.querySelector("td:last-child a");
        const file = tr.querySelector(".file");
        const asset = rel && rel.assets[tr.dataset.match];
        if (asset) {
          a.href = asset.url; a.setAttribute("download", ""); a.textContent = "Download";
          file.innerHTML = `${asset.name}<span class="size">${fmtSize(asset.size)}</span>`;
        } else {
          a.href = rel ? rel.html_url : RELEASES; a.removeAttribute("download"); a.textContent = "Release page";
          file.textContent = file.textContent.replace(/<span.*$/, "");
        }
      });
      if (!rel) {
        note.hidden = false;
        note.textContent = name === "stable"
          ? "There is no stable release yet. The nightly channel has the current builds."
          : "No nightly build is published right now.";
        line.innerHTML = `Packages are on the <a href="${RELEASES}">releases page</a>, with <code>SHA256SUMS</code> and build receipts next to them.`;
        return;
      }
      note.hidden = name !== "nightly";
      if (name === "nightly") note.textContent = "Nightlies pass the full test suites and package audits on every build, but are not desktop-certified. Stable releases are.";
      const sums = rel.checksums ? ` and <a href="${rel.checksums}">SHA256SUMS</a>` : "";
      line.innerHTML = `${name === "stable" ? "Stable" : "Nightly"} <a href="${rel.html_url}">${rel.tag}</a>, published ${fmtDate(rel.published_at)}. Every file, the build receipts${sums} are on the release page.`;
    };

    fetch("/_site/releases.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (!data.stable && !data.nightly) return;
        channel.hidden = false;
        channel.querySelector('[data-channel="stable"]').disabled = !data.stable;
        channel.querySelector('[data-channel="nightly"]').disabled = !data.nightly;
        let current = data.stable ? "stable" : "nightly";
        if (location.hash === "#nightly" && data.nightly) current = "nightly";
        show(data, current);
        channel.addEventListener("click", (e) => {
          const b = e.target.closest("button[data-channel]");
          if (b && !b.disabled) show(data, b.dataset.channel);
        });
      })
      .catch(() => { /* The static links to the releases page stay in place. */ });
  }
})();
