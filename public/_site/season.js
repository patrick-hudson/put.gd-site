// put.gd seasonal theme: November and December, from the visitor's own calendar, every year.
// Nothing here is needed to use the page: without it the ordinary branding simply stays.
(() => {
  "use strict";

  const SEASONS = { 10: "november", 11: "december" }; // Date#getMonth() is zero-based.
  const MAX_WAIT = 6 * 60 * 60 * 1000; // Recheck at least this often, for clock or time zone changes.
  const MIN_WAIT = 1000; // A timer can fire a little early; never spin while waiting out the last moments.
  const REVIEW_HOSTS = ["localhost", "127.0.0.1", "[::1]"];
  const PAUSED_KEY = "putgd-season-motion";
  const GREETING = "put.gd - Happy Holidays!";
  // Scattered by hand so the fall looks even: [left %, top vh, size px, seconds, drift px].
  const FLAKES = [
    [4, 12, 3, 19, 18], [11, 58, 2, 24, -14], [17, 30, 4, 17, 22], [24, 82, 2, 26, 12], [31, 8, 3, 21, -20], [38, 46, 2, 23, 16],
    [45, 70, 3, 18, -12], [52, 20, 2, 27, 20], [59, 92, 3, 20, -18], [66, 38, 4, 16, 14], [72, 64, 2, 25, -16], [79, 16, 3, 22, 24],
    [85, 52, 2, 19, -10], [91, 28, 3, 24, 16], [96, 76, 2, 21, -22],
  ];
  // Where the bulbs sit on art-december.svg, in percent of the artwork.
  const LIGHTS = [[43.3, 26.4], [60, 39], [56.3, 22.9], [38.3, 38.4], [28.3, 46.7], [72.1, 47], [50, 45.1], [50, 17.5]];

  const seasonFor = (date) => SEASONS[date.getMonth()] || null;

  // The next local midnight. Date normalises month and year ends, and a midnight that a daylight
  // saving change skips resolves to the first valid moment of that day.
  const nextMidnight = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  const waitFrom = (date) => Math.min(MAX_WAIT, Math.max(MIN_WAIT, nextMidnight(date) - date));

  // A season can be forced for review on a development host only, so visitors never get a choice.
  const reviewSeason = (location) => {
    if (!REVIEW_HOSTS.includes(location.hostname)) return undefined;
    const asked = new URLSearchParams(location.search).get("season");
    if (asked === "ordinary") return null;
    return Object.values(SEASONS).includes(asked) ? asked : undefined;
  };

  function start({ window, now = () => new Date() }) {
    const { document } = window;
    const html = document.documentElement;
    const forced = reviewSeason(window.location);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let original = []; // Each swapped [element, attribute, value], to put back in January.
    let decorations = [];
    let control = null;
    let current = null;
    let timer = null;
    let paused = false;
    try { paused = window.localStorage.getItem(PAUSED_KEY) === "paused"; } catch { /* Private mode. */ }

    const cssUrl = (name) => {
      const value = window.getComputedStyle(html).getPropertyValue(name);
      const match = /url\(["']?([^"')]+)["']?\)/.exec(value);
      return match ? match[1] : null;
    };

    const swap = (el, attr, url) => {
      if (!url) return;
      original.push([el, attr, el.getAttribute(attr)]);
      el.setAttribute(attr, url);
    };

    const updateMotion = () => {
      const running = current === "december" && !motion.matches && !paused && !document.hidden;
      if (current === "december") html.setAttribute("data-season-motion", running ? "on" : "off");
      else html.removeAttribute("data-season-motion");
      if (!control) return;
      control.hidden = motion.matches;
      control.textContent = paused ? "Resume decorations" : "Pause decorations";
    };

    const decoration = (className) => {
      const el = document.createElement("div");
      el.className = className;
      el.setAttribute("aria-hidden", "true");
      decorations.push(el);
      return el;
    };

    const dots = (parent, className, items, style) => items.forEach((item) => {
      const dot = document.createElement("i");
      dot.className = className;
      style(dot.style, item);
      parent.append(dot);
    });

    // Runs once the body exists. Everything added is decoration, except the pause button.
    const decorate = () => {
      if (!document.body || !current) return;
      swapBranding();
      greet();
      document.body.append(decoration("season-scene"));
      const lede = document.querySelector(".hero .lede");
      const art = lede && decoration("season-art");
      if (art) lede.after(art);
      if (current !== "december") return;
      const snow = decoration("season-snow");
      document.body.append(snow);
      dots(snow, "season-flake", FLAKES, (style, [x, y, size, seconds, drift]) => {
        style.setProperty("--x", `${x}%`);
        style.setProperty("--y", `${y}vh`);
        style.setProperty("--size", `${size}px`);
        style.setProperty("--fall", `${seconds}s`);
        style.setProperty("--drift", `${drift}px`);
        style.setProperty("--phase", `${(-seconds * y) / 100}s`); // Starts where the static fallback rests.
      });
      if (art) {
        dots(art, "season-light", LIGHTS, (style, [x, y]) => {
          style.setProperty("--x", `${x}%`);
          style.setProperty("--y", `${y}%`);
        });
      }
      const row = document.querySelector(".top-row");
      if (!row) return;
      control = document.createElement("button");
      control.type = "button";
      control.className = "season-control";
      control.addEventListener("click", () => {
        paused = !paused;
        try { window.localStorage.setItem(PAUSED_KEY, paused ? "paused" : "playing"); } catch { /* Private mode. */ }
        updateMotion();
      });
      row.append(control);
    };

    const swapBranding = () => {
      const logo = cssUrl("--season-logo");
      document.querySelectorAll(".brand img").forEach((img) => swap(img, "src", logo));
      const favicon = cssUrl("--season-favicon");
      document.querySelectorAll('link[rel="icon"]').forEach((link) => swap(link, "href", favicon));
    };

    // The logo link keeps its name; the greeting is its hover text and, for keyboards, a tip on focus.
    const greet = () => {
      const brand = document.querySelector(".brand");
      if (!brand) return;
      const tip = decoration("season-greeting");
      tip.id = "season-greeting";
      tip.textContent = GREETING;
      brand.after(tip);
      swap(brand, "title", GREETING);
      swap(brand, "aria-describedby", tip.id);
    };

    const clear = () => {
      decorations.forEach((el) => el.remove());
      decorations = [];
      if (control) control.remove();
      control = null;
      original.forEach(([el, attr, value]) => {
        if (value === null) el.removeAttribute(attr);
        else el.setAttribute(attr, value);
      });
      original = [];
    };

    const apply = (season) => {
      if (season === current) return;
      clear();
      current = season;
      if (season) html.setAttribute("data-season", season);
      else html.removeAttribute("data-season");
      decorate();
      updateMotion();
      const logo = season && cssUrl("--season-logo");
      if (logo) new window.Image().src = logo; // Ready for the swap once the body parses.
    };

    const check = () => {
      const date = now();
      apply(forced === undefined ? seasonFor(date) : forced);
      window.clearTimeout(timer);
      timer = window.setTimeout(check, waitFrom(date));
    };

    check(); // In <head>: colours are right from the first paint.
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        clear();
        decorate();
        updateMotion();
      });
    }
    window.addEventListener("pageshow", check); // Includes restores from the back/forward cache.
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", () => {
      updateMotion();
      if (!document.hidden) check();
    });
    motion.addEventListener("change", updateMotion);
  }

  const api = { seasonFor, nextMidnight, waitFrom, reviewSeason, start };
  if (typeof module === "object") module.exports = api;
  else start({ window });
})();
