// Offline tests for public/_site/season.js, on a small fake DOM and an injected clock.
// tools/test_season.py runs this under several time zones.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const season = require("../public/_site/season.js");

const CSS = fs.readFileSync(path.join(__dirname, "../public/_site/site.css"), "utf8");
const TZ = process.env.TZ;
const HOUR = 60 * 60 * 1000;

class Element {
  constructor(tagName, attrs = {}) {
    this.tagName = tagName;
    this.attrs = { ...attrs };
    this.children = [];
    this.listeners = {};
    this.style = { props: {}, setProperty: (k, v) => { this.style.props[k] = v; } };
    this.hidden = false;
    this.textContent = "";
  }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  removeAttribute(k) { delete this.attrs[k]; }
  append(child) { child.parent = this; this.children.push(child); }
  after(el) { this.parent.append(el); }
  remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  dispatch(type) { (this.listeners[type] || []).forEach((fn) => fn()); }
  all() { return this.children.flatMap((c) => [c, ...c.all()]); }
}

const LOGO = "/_site/logo.svg?v=abc";

// A page in the state season.js sees from <head>, or fully parsed.
function page({ start, host = "app.put.gd", search = "", reduce = false, loading = false, storage }) {
  const clock = { now: new Date(start) };
  const html = new Element("HTML");
  const body = new Element("BODY");
  const hero = new Element("SECTION");
  const lede = new Element("P");
  const row = new Element("DIV");
  const brand = new Element("A", { "aria-label": "put.gd home" });
  const logo = new Element("IMG", { src: LOGO, alt: "" });
  const icon = new Element("LINK", { rel: "icon", href: LOGO });
  [hero, row].forEach((el) => body.append(el));
  hero.append(lede);
  row.append(brand);
  brand.append(logo);
  const select = { ".hero .lede": lede, ".top-row": row, ".brand": brand };
  const motion = new Element("MEDIA");
  motion.matches = reduce;
  const document = new Element("DOCUMENT");
  Object.assign(document, {
    documentElement: html,
    body: loading ? null : body,
    readyState: loading ? "loading" : "complete",
    hidden: false,
    createElement: (tag) => new Element(tag.toUpperCase()),
    querySelector: (s) => select[s] || null,
    querySelectorAll: (s) => ({ ".brand img": [logo], 'link[rel="icon"]': [icon] })[s] || [],
  });
  const timers = new Map();
  let ids = 0;
  const saved = storage || new Map();
  const images = [];
  const window = new Element("WINDOW");
  Object.assign(window, {
    document,
    location: { hostname: host, search },
    matchMedia: () => motion,
    localStorage: { getItem: (k) => (saved.get ? saved.get(k) ?? null : null),
                    setItem: (k, v) => { if (!saved.set) throw new Error("denied"); saved.set(k, v); } },
    Image: class { set src(v) { images.push(v); } },
    setTimeout: (fn, ms) => { timers.set(++ids, { fn, at: clock.now.getTime() + ms, ms }); return ids; },
    clearTimeout: (id) => timers.delete(id),
    getComputedStyle: (el) => ({
      getPropertyValue(name) {
        const block = new RegExp(`html\\[data-season="${el.getAttribute("data-season")}"\\] \\{([^}]*)\\}`).exec(CSS);
        const value = block && new RegExp(`${name}: ([^;]+);`).exec(block[1]);
        return value ? value[1] : "";
      },
    }),
  });
  season.start({ window, now: () => clock.now });
  return {
    window, document, html, body, brand, logo, icon, row, motion, timers, images, clock, saved,
    // Moves the clock on, firing whichever timer the page set, as a browser would.
    advance(to) {
      const target = new Date(to).getTime();
      for (;;) {
        const due = [...timers].filter(([, t]) => t.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        timers.delete(due[0]);
        clock.now = new Date(due[1].at);
        due[1].fn();
      }
      clock.now = new Date(target);
    },
    decorations: () => body.all().filter((el) => /^season-/.test(el.className || "")),
    named: (name) => body.all().find((el) => el.className === name),
  };
}

test("each season covers exactly its month, inclusive, in every year", () => {
  for (const year of [1999, 2024, 2026, 2027, 2028, 2031, 2100]) {
    const at = (m, d, h = 12, min = 0, s = 0, ms = 0) => season.seasonFor(new Date(year, m, d, h, min, s, ms));
    assert.equal(at(9, 31, 23, 59, 59, 999), null, `Oct 31 ${year}`);
    assert.equal(at(10, 1, 0), "november", `Nov 1 ${year}`);
    assert.equal(at(10, 15), "november");
    assert.equal(at(10, 30, 23, 59, 59, 999), "november", `Nov 30 ${year}`);
    assert.equal(at(11, 1, 0), "december", `Dec 1 ${year}`);
    assert.equal(at(11, 31, 23, 59, 59, 999), "december", `Dec 31 ${year}`);
    assert.equal(season.seasonFor(new Date(year + 1, 0, 1)), null, `Jan 1 ${year + 1}`);
    for (let month = 0; month < 10; month++) assert.equal(at(month, 15), null);
  }
});

test("the season reads the local calendar, not UTC", () => {
  const instant = new Date("2031-11-01T03:30:00Z");
  const expected = { UTC: "november", "America/New_York": null, "Asia/Kolkata": "november", "Pacific/Kiritimati": "november" };
  if (TZ in expected) assert.equal(season.seasonFor(instant), expected[TZ]);
  const newYear = new Date("2032-01-01T05:00:00Z");
  const local = { UTC: null, "America/New_York": null, "America/Havana": null, "Pacific/Apia": null };
  if (TZ === "America/Los_Angeles") assert.equal(season.seasonFor(newYear), "december");
  if (TZ in local) assert.equal(season.seasonFor(newYear), local[TZ]);
});

test("the next midnight is the first moment of the next local day, over daylight saving and year ends", () => {
  for (const year of [2024, 2026, 2031]) {
    for (let day = 0; day < 366; day++) {
      for (const hour of [0, 1, 12, 23]) {
        const date = new Date(year, 0, 1 + day, hour, 30);
        const next = season.nextMidnight(date);
        const tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 12);
        assert.ok(next > date);
        assert.equal(next.getDate(), tomorrow.getDate(), date.toString());
        assert.notEqual(new Date(next - 1).getDate(), next.getDate(), date.toString());
      }
    }
  }
  if (TZ === "America/Havana") {
    // Clocks jump from 00:00 to 01:00 on 8 March 2026, so that day starts at 01:00.
    assert.equal(season.nextMidnight(new Date(2026, 2, 7, 20)).getHours(), 1);
  }
});

test("timers are bounded: never a tight loop, never a long blind wait", () => {
  assert.equal(season.waitFrom(new Date(2026, 5, 1, 23, 59, 59, 999)), 1000);
  assert.equal(season.waitFrom(new Date(2026, 5, 1, 0, 0)), 6 * HOUR);
  const near = season.waitFrom(new Date(2026, 5, 1, 23, 0));
  assert.equal(near, HOUR);
});

test("a season can be forced only on a development host", () => {
  const at = (hostname, search) => season.reviewSeason({ hostname, search });
  assert.equal(at("localhost", "?season=november"), "november");
  assert.equal(at("127.0.0.1", "?season=december"), "december");
  assert.equal(at("[::1]", "?season=ordinary"), null);
  assert.equal(at("localhost", ""), undefined);
  assert.equal(at("localhost", "?season=constructor"), undefined);
  for (const host of ["app.put.gd", "put.gd", "localhost.example.com"]) assert.equal(at(host, "?season=december"), undefined);
  const live = page({ start: "2031-07-04T12:00:00", search: "?season=december" });
  assert.equal(live.html.getAttribute("data-season"), null);
  const dev = page({ start: "2031-07-04T12:00:00", host: "localhost", search: "?season=december" });
  assert.equal(dev.html.getAttribute("data-season"), "december");
  const off = page({ start: "2031-12-04T12:00:00", host: "localhost", search: "?season=ordinary" });
  assert.equal(off.html.getAttribute("data-season"), null);
});

test("the ordinary page gets nothing", () => {
  const p = page({ start: "2031-07-04T12:00:00" });
  assert.equal(p.html.getAttribute("data-season"), null);
  assert.equal(p.html.getAttribute("data-season-motion"), null);
  assert.equal(p.logo.getAttribute("src"), LOGO);
  assert.equal(p.icon.getAttribute("href"), LOGO);
  assert.deepEqual(p.decorations(), []);
  assert.deepEqual(p.images, []);
  assert.equal(p.brand.getAttribute("title"), null);
  assert.equal(p.brand.getAttribute("aria-describedby"), null);
});

const GREETING = "put.gd - Happy Holidays!";

function assertGreeting(p) {
  assert.equal(p.brand.getAttribute("title"), GREETING);
  assert.equal(p.brand.getAttribute("aria-label"), "put.gd home", "the link keeps its name");
  const tip = p.named("season-greeting");
  assert.equal(tip.textContent, GREETING);
  assert.equal(p.brand.getAttribute("aria-describedby"), tip.id);
  assert.equal(p.decorations().filter((el) => el.className === "season-greeting").length, 1);
}

test("the logo carries the greeting all through both seasons and loses it overnight on Jan 1", () => {
  const p = page({ start: "2031-10-31T23:00:00" });
  assert.equal(p.brand.getAttribute("title"), null);
  p.advance("2031-11-01T00:00:01");
  assertGreeting(p);
  p.advance("2031-12-01T00:00:01");
  assertGreeting(p);
  p.advance("2031-12-31T23:59:59");
  assertGreeting(p);
  p.advance("2032-01-01T00:00:01");
  assert.equal(p.brand.getAttribute("title"), null);
  assert.equal(p.brand.getAttribute("aria-describedby"), null);
  assert.equal(p.brand.getAttribute("aria-label"), "put.gd home");
  assert.equal(p.named("season-greeting"), undefined);
});


test("a tab left open runs through a whole year's transitions and leaves nothing behind", () => {
  const p = page({ start: "2031-10-31T22:00:00" });
  assert.equal(p.html.getAttribute("data-season"), null);

  p.advance("2031-11-01T00:00:01");
  assert.equal(p.html.getAttribute("data-season"), "november");
  assert.match(p.logo.getAttribute("src"), /logo-november\.svg/);
  assert.match(p.icon.getAttribute("href"), /favicon-november\.svg/);
  assert.equal(p.logo.getAttribute("alt"), "");
  assert.equal(p.html.getAttribute("data-season-motion"), null, "November does not move");
  assert.equal(p.named("season-snow"), undefined);
  assert.ok(p.named("season-art"));

  p.advance("2031-12-01T00:00:01");
  assert.equal(p.html.getAttribute("data-season"), "december");
  assert.match(p.logo.getAttribute("src"), /logo-december\.svg/);
  assert.match(p.icon.getAttribute("href"), /favicon-december\.svg/);
  assert.equal(p.html.getAttribute("data-season-motion"), "on");
  assert.ok(p.named("season-snow").children.length <= 20);
  assert.equal(p.decorations().filter((el) => el.className === "season-art").length, 1, "the old artwork went");
  const control = p.named("season-control");
  assert.equal(control.tagName, "BUTTON");

  p.advance("2032-01-01T00:00:01");
  assert.equal(p.html.getAttribute("data-season"), null);
  assert.equal(p.html.getAttribute("data-season-motion"), null);
  assert.equal(p.logo.getAttribute("src"), LOGO);
  assert.equal(p.icon.getAttribute("href"), LOGO);
  assert.deepEqual(p.decorations(), []);
  assert.equal(p.timers.size, 1, "one pending timer, however long the tab stays open");
  assert.ok([...p.timers.values()][0].ms <= 6 * HOUR);

  p.advance("2032-11-01T00:00:01");
  assert.equal(p.html.getAttribute("data-season"), "november", "and again next year");
});

test("decorations are hidden from assistive technology", () => {
  const p = page({ start: "2031-12-10T12:00:00" });
  for (const name of ["season-scene", "season-art", "season-snow", "season-greeting"]) assert.equal(p.named(name).getAttribute("aria-hidden"), "true");
});

for (const [name, fire] of [
  ["pageshow", (p) => p.window.dispatch("pageshow")],
  ["focus", (p) => p.window.dispatch("focus")],
  ["visibilitychange", (p) => p.document.dispatch("visibilitychange")],
]) {
  test(`returning through ${name} catches up after a suspension, with no timer firing`, () => {
    const p = page({ start: "2031-11-30T20:00:00" });
    p.clock.now = new Date("2032-01-02T09:00:00");
    fire(p);
    assert.equal(p.html.getAttribute("data-season"), null);
    assert.equal(p.logo.getAttribute("src"), LOGO);
    assert.deepEqual(p.decorations(), []);
    assert.equal(p.timers.size, 1);
  });
}

test("rechecks in the same season change nothing and keep one timer", () => {
  const p = page({ start: "2031-12-10T12:00:00" });
  const art = p.named("season-art");
  for (let i = 0; i < 5; i++) p.window.dispatch("focus");
  assert.equal(p.named("season-art"), art);
  assert.equal(p.timers.size, 1);
});

test("motion stops when hidden and comes back", () => {
  const p = page({ start: "2031-12-10T12:00:00" });
  p.document.hidden = true;
  p.document.dispatch("visibilitychange");
  assert.equal(p.html.getAttribute("data-season-motion"), "off");
  p.document.hidden = false;
  p.document.dispatch("visibilitychange");
  assert.equal(p.html.getAttribute("data-season-motion"), "on");
});

test("reduced motion keeps a static scene and needs no control", () => {
  const p = page({ start: "2031-12-10T12:00:00", reduce: true });
  assert.equal(p.html.getAttribute("data-season-motion"), "off");
  assert.ok(p.named("season-snow"));
  assert.equal(p.named("season-control").hidden, true);
  p.motion.matches = false;
  p.motion.dispatch("change");
  assert.equal(p.html.getAttribute("data-season-motion"), "on");
  assert.equal(p.named("season-control").hidden, false);
});

test("the pause choice applies, is remembered and survives blocked storage", () => {
  const storage = new Map();
  const p = page({ start: "2031-12-10T12:00:00", storage });
  const control = p.named("season-control");
  assert.equal(control.textContent, "Pause decorations");
  control.dispatch("click");
  assert.equal(p.html.getAttribute("data-season-motion"), "off");
  assert.equal(control.textContent, "Resume decorations");
  const again = page({ start: "2031-12-10T12:00:00", storage });
  assert.equal(again.html.getAttribute("data-season-motion"), "off");

  const blocked = page({ start: "2031-12-10T12:00:00", storage: {} });
  blocked.named("season-control").dispatch("click");
  assert.equal(blocked.html.getAttribute("data-season-motion"), "off");
});

test("from <head>, colours apply at once and decoration waits for the body", () => {
  const p = page({ start: "2031-11-10T12:00:00", loading: true });
  assert.equal(p.html.getAttribute("data-season"), "november");
  assert.equal(p.logo.getAttribute("src"), LOGO);
  assert.match(p.images[0], /logo-november\.svg/);
  p.document.body = p.body;
  p.document.dispatch("DOMContentLoaded");
  assert.match(p.logo.getAttribute("src"), /logo-november\.svg/);
  assert.equal(p.decorations().length, 3);
  assertGreeting(p);
});
