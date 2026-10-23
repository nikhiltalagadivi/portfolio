/* ---------------------------------------------------------------
   The site as a shell. Feeds are scrollback, navigation is a prompt.
   --------------------------------------------------------------- */

(() => {
"use strict";

/* ===== Content ================================================= */

const ME = {
    name: "Nikhil Talagadivi",
    email: "talagadivinikhil@gmail.com",
    github: "https://github.com/nikhiltalagadivi",
    linkedin: "https://www.linkedin.com/in/nikhil-talagadivi-a28627254/",
    location: "Sydney, NSW",
};

const ABOUT = [
    "I'm Nikhil Talagadivi, a student at the University of New South Wales studying a Bachelor of Engineering (Honours) and a Bachelor of Science in Computer Science.",
    "My main focus is electrical engineering, but I spend a lot of my time building software. I care about clean interfaces, tools that reduce friction, and codebases that are easy to reason about long after the excitement of building has passed.",
    "My work sits somewhere between practical software, engineering thinking, and precise problem-solving. I'm interested in systems: how they are designed, how they break, and how to make them better.",
    "Outside of engineering, I've volunteered with UN Youth Australia and the City of Parramatta, and I currently contribute to the UNSW Artificial Intelligence Society as part of the subcommittee, designing visual material for events and communications.",
    "I'm based in Sydney, NSW, and open to on-site or hybrid roles.",
];

// cat: tab it lives under. label: left column. meta: right column.
const ENTRIES = [
    {
        cat: "PROJECTS", label: "Roblox", title: "PlanetEngine", meta: "play ↗", featured: true,
        desc: "Explore procedurally generated worlds in detail. Every planet is a real sphere at full scale, streamed in as you fly, with gravity toward its centre, a simulated atmosphere and volumetric clouds.",
        href: "https://www.roblox.com/games/88502845757776/PlanetEngine",
        tags: "roblox game lua luau planet planets space procedural terrain gravity atmosphere clouds flight orbit 3d engine",
    },
    {
        cat: "PROJECTS", label: "macOS", title: "Glyph", meta: "github ↗", featured: true,
        desc: "Turns typed shorthand into real maths notation, in any macOS app.",
        href: "https://github.com/nikhiltalagadivi/glyph",
        tags: "macos mac app math maths notation latex unicode keyboard swift",
    },
    {
        cat: "PROJECTS", label: "Web", title: "Aroha", meta: "github ↗", featured: true,
        desc: "AI platform built to teach you how to code for anything you want to build.",
        href: "https://github.com/nikhiltalagadivi/aroha-proj",
        tags: "ai platform education learn coding code teaching llm web",
    },
    {
        cat: "PROJECTS", label: "Utility", title: "Mouse Circular Motion", meta: "github ↗",
        desc: "Precision mouse control utility for the Perfect Circle challenge on neal.fun.",
        href: "https://github.com/nikhiltalagadivi/mouse-circular-motion",
        tags: "mouse automation circle neal.fun python script utility",
    },
    {
        cat: "EXPERIENCE", label: "2026 – now", title: "Subcommittee · UNSW AI Society", meta: "role",
        desc: "Designing visual material for events and communications at the UNSW Artificial Intelligence Society.",
        tags: "unsw ai society aisoc design visual events subcommittee club",
    },
    {
        cat: "EDUCATION", label: "2025 – now", title: "UNSW", meta: "study",
        desc: "Bachelor of Engineering (Honours) / Bachelor of Science (Computer Science).",
        href: "https://www.unsw.edu.au/",
        tags: "unsw university engineering electrical computer science degree honours sydney",
    },
    {
        cat: "EDUCATION", label: "2024", title: "Cumberland High School", meta: "study",
        desc: "ATAR 95+, Proxime Accessit, Peer support leader.",
        tags: "high school atar hsc proxime accessit peer support leader",
    },
    {
        cat: "EXPERIENCE", label: "2022", title: "Engineering Work Placement · Qantas", meta: "role",
        desc: "Engineering operations, logistics, and team-based aviation workflows.",
        tags: "qantas aviation aerospace engineering placement work experience internship logistics",
    },
    {
        cat: "VOLUNTEER", label: "Volunteer", title: "UN Youth Australia", meta: "role",
        desc: "Volunteered with UN Youth Australia.",
        tags: "un youth volunteer volunteering community",
    },
    {
        cat: "VOLUNTEER", label: "Volunteer", title: "City of Parramatta", meta: "role",
        desc: "Volunteered with the City of Parramatta.",
        tags: "parramatta council volunteer volunteering community",
    },
];

const THEMES = [
    { id: "light", desc: "warm paper" },
    { id: "dark", desc: "the default" },
    { id: "dracula", desc: "the classic" },
];

const TABS = ["ALL", "PROJECTS", "EXPERIENCE", "EDUCATION", "VOLUNTEER"];
const PAGE = 5;

/* ===== DOM ===================================================== */

const $ = (s, r = document) => r.querySelector(s);
const root = document.documentElement;
const rows = $("#rows");
const out = $("#termOut .term-scroll");
const form = $("#termForm");
const input = $("#termInput");
const ghost = $("#ghost");
const suggest = $("#suggest");
const featuredEl = $("#featured");
const feedEl = $("#feed");
const tabsEl = $("#tabs");
const loadMore = $("#loadMore");

const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
};

const openURL = (url) => {
    if (url.startsWith("mailto:")) { location.href = url; return; }
    window.open(url, "_blank", "noopener");
};

const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
};

/* ===== Banner ================================================== */

const banner = $("#banner");
const bannerPre = $("#banner pre");
const BANNERS = {
    wide: $("#banner-wide").textContent.replace(/^\n|\n$/g, ""),
    narrow: $("#banner-narrow").textContent.replace(/^\n|\n$/g, ""),
};

function fitBanner() {
    const wide = window.innerWidth > 900;
    const text = wide ? BANNERS.wide : BANNERS.narrow;
    if (bannerPre.textContent !== text) bannerPre.textContent = text;
    bannerPre.style.transform = "translateY(-50%) scale(1)";
    const natural = bannerPre.scrollWidth;
    const avail = banner.clientWidth || rows.clientWidth;
    const scale = Math.min(1, avail / natural);
    const lines = text.split("\n").length;
    bannerPre.style.transform = `translateY(-50%) scale(${scale})`;
    banner.style.height = Math.ceil(lines * 20 * scale) + "px";
}

/* ===== Feed ==================================================== */

let activeTab = "ALL";
let shown = PAGE;
let lastListing = [];   // entries addressable with /open <n>

function rowFor(entry, i, label) {
    const r = el("div", "frow pop");
    r.style.setProperty("--i", i);
    r.append(el("span", "f-l", label ?? entry.label), el("span", "f-t", entry.title), el("span", "f-d", entry.meta));
    r.addEventListener("click", () => run(`/open ${entry.title}`));
    r._entry = entry;
    return r;
}

function renderFeatured() {
    featuredEl.replaceChildren(...ENTRIES.filter((e) => e.featured).map((e, i) => rowFor(e, i, "Featured")));
}

function tabEntries() {
    return activeTab === "ALL" ? ENTRIES : ENTRIES.filter((e) => e.cat === activeTab);
}

function renderTabs() {
    tabsEl.replaceChildren(...TABS.map((t) => {
        const b = el("button", "tab" + (t === activeTab ? " on" : ""), t);
        b.type = "button";
        b.addEventListener("click", () => setTab(t));
        return b;
    }));
}

function renderFeed() {
    const list = tabEntries();
    const visible = list.slice(0, shown);
    lastListing = visible;
    if (!visible.length) {
        const e = el("div", "f-empty");
        e.append(el("span", "gt", ">"), document.createTextNode("nothing here yet."));
        feedEl.replaceChildren(e);
    } else {
        feedEl.replaceChildren(...visible.map((e, i) => rowFor(e, i)));
    }
    loadMore.style.display = list.length > shown ? "" : "none";
}

function setTab(t) {
    activeTab = t;
    shown = PAGE;
    renderTabs();
    renderFeed();
}

loadMore.addEventListener("click", () => run("/more"));

/* ===== Terminal output ========================================= */

function echo(cmd) { out.append(el("div", "t-cmd", cmd)); }
function line(text, cls = "") { const n = el("div", ("t-out " + cls).trim(), text); out.append(n); return n; }
function html(markup, cls = "") { const n = el("div", ("t-out " + cls).trim()); n.innerHTML = markup; out.append(n); return n; }

function kv(k, v, cls = "") {
    const n = el("div", ("t-out t-kv " + cls).trim());
    n.append(el("span", "", k), el("span", "", v));
    out.append(n);
    return n;
}

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function scrollDown() {
    requestAnimationFrame(() => { rows.scrollTo({ top: rows.scrollHeight, behavior: "smooth" }); updateHints(); });
}

/* Interactive menus: a block of options navigable with arrows. */
let menu = null;   // { items: [el], idx, footer }

function options(list, verb = "run") {
    // list: [{ k, v, cmd? , action? }]
    const items = list.map((o, i) => {
        const n = kv(o.k, "", "t-opt");
        const vSpan = n.lastChild;
        if (o.vHTML) vSpan.innerHTML = o.vHTML; else vSpan.textContent = o.v;
        n.dataset.cmd = o.cmd || "";
        n._action = o.action;
        n.addEventListener("click", () => { setMenuIdx(items.indexOf(n)); choose(); });
        n.addEventListener("mousemove", () => { if (menu && menu.items === items) setMenuIdx(i); });
        return n;
    });
    const foot = html(`<span class="arr">↑</span><span class="arr">↓</span> to choose · enter to ${verb} · esc to dismiss`);
    menu = { items, idx: Math.max(0, list.findIndex((o) => o.on)), foot };
    setMenuIdx(menu.idx);
    return items;
}

function setMenuIdx(i) {
    if (!menu) return;
    menu.idx = (i + menu.items.length) % menu.items.length;
    menu.items.forEach((n, j) => n.classList.toggle("on", j === menu.idx));
}

function choose() {
    if (!menu) return;
    const n = menu.items[menu.idx];
    closeMenu();
    if (n._action) n._action();
    else if (n.dataset.cmd) run(n.dataset.cmd);
}

function closeMenu() {
    if (!menu) return;
    menu.foot.remove();
    menu = null;
}

/* ===== Commands ================================================ */

const COMMANDS = [
    { name: "/help", desc: "list every command" },
    { name: "/about", desc: "who I am" },
    { name: "/projects", desc: "things I've built" },
    { name: "/experience", desc: "where I've worked" },
    { name: "/education", desc: "where I've studied" },
    { name: "/find", usage: "/find <q>", desc: "search everything on the site" },
    { name: "/open", usage: "/open <n>", desc: "open item n from the last listing" },
    { name: "/more", desc: "load more of the feed" },
    { name: "/play", desc: "launch PlanetEngine on Roblox" },
    { name: "/contact", desc: "ways to reach me" },
    { name: "/email", desc: "write me an email" },
    { name: "/github", desc: "open my GitHub" },
    { name: "/linkedin", desc: "open my LinkedIn" },
    { name: "/theme", desc: "switch the color theme" },
    { name: "/home", desc: "go home" },
    { name: "/clear", desc: "clear the scrollback" },
];

const ALIASES = {
    "/h": "/help", "/?": "/help", "help": "/help", "man": "/help",
    "/whoami": "/about", "whoami": "/about", "about": "/about", "/bio": "/about",
    "/work": "/experience", "/jobs": "/experience", "/exp": "/experience",
    "/school": "/education", "/edu": "/education", "/uni": "/education",
    "/search": "/find", "/grep": "/find", "find": "/find", "grep": "/find", "search": "/find",
    "/read": "/open", "open": "/open", "cat": "/open",
    "/posts": "/more", "/ls": "/more",
    "/roblox": "/play", "/planetengine": "/play", "/game": "/play",
    "/mail": "/email", "/chat": "/email", "/socials": "/contact", "/links": "/contact",
    "/gh": "/github", "/li": "/linkedin",
    "/cls": "/clear", "clear": "/clear", "/reset": "/home", "cd": "/home", "/cd": "/home",
};

const HANDLERS = {
    "/help"() {
        options(COMMANDS.map((c) => ({ k: c.usage || c.name, v: c.desc, cmd: c.usage ? `${c.name} ` : c.name })));
    },

    "/about"() {
        ABOUT.forEach((p) => line(p, "t-text"));
        line("try /projects, /experience or /contact.");
    },

    "/projects"() { listCat("PROJECTS"); },
    "/experience"() { listCat(["EXPERIENCE", "VOLUNTEER"]); },
    "/education"() { listCat("EDUCATION"); },

    "/find"(args) {
        if (!args) { line("usage: /find <anything>. try /find roblox, /find unsw or /find maths."); return; }
        search(args);
    },

    "/open"(args) {
        if (!args) { line("usage: /open <n>. numbers come from the last listing (the feed counts too)."); return; }
        const n = parseInt(args, 10);
        let entry = null;
        if (!isNaN(n) && String(n) === args.trim()) entry = lastListing[n - 1];
        if (!entry) entry = ENTRIES.find((e) => e.title.toLowerCase() === args.toLowerCase())
                         || ENTRIES.find((e) => e.title.toLowerCase().includes(args.toLowerCase()));
        if (!entry) { line(`nothing at ${args}. /help shows everything.`); return; }
        showEntry(entry);
    },

    "/more"() {
        const list = tabEntries();
        if (shown >= list.length) { line("that's everything. try another tab, or /find <q>."); return; }
        shown += PAGE;
        renderFeed();
        line(`loaded ${Math.min(PAGE, list.length - (shown - PAGE))} more. /open <n> to read one.`);
    },

    "/play"() {
        line("launching PlanetEngine on Roblox…", "t-accent");
        openURL(ENTRIES[0].href);
    },

    "/contact"() {
        options([
            { k: "email", v: ME.email, action: () => HANDLERS["/email"]() },
            { k: "github", v: ME.github.replace("https://", ""), action: () => openURL(ME.github) },
            { k: "linkedin", v: "in/nikhil-talagadivi", action: () => openURL(ME.linkedin) },
            { k: "location", v: `${ME.location} · open to on-site or hybrid`, action: () => line(`${ME.location}. open to on-site or hybrid roles.`) },
        ], "open");
    },

    "/email"() {
        line(`opening a new email to ${ME.email}…`);
        openURL(`mailto:${ME.email}`);
    },
    "/github"() { line("opening github.com/nikhiltalagadivi…"); openURL(ME.github); },
    "/linkedin"() { line("opening linkedin…"); openURL(ME.linkedin); },

    "/theme"(args) {
        const current = root.getAttribute("data-scheme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
        if (args) {
            const t = THEMES.find((t) => t.id === args.toLowerCase());
            if (!t) { line(`unknown theme: ${args}. pick one of ${THEMES.map((t) => t.id).join(", ")}.`); return; }
            setTheme(t.id);
            line(`theme set: ${t.id}. it sticks around next visit.`);
            return;
        }
        options(THEMES.map((t) => ({ k: t.id, v: t.desc, cmd: `/theme ${t.id}`, on: t.id === current })), "apply");
    },

    "/home"() {
        out.replaceChildren();
        closeMenu();
        setTab("ALL");
        rows.scrollTo({ top: 0, behavior: "smooth" });
        setActiveMenu("H");
    },

    "/clear"() { out.replaceChildren(); closeMenu(); updateHints(); },

    // easter eggs
    "sudo"() { line("nice try. you're a guest here.", "t-accent"); },
    "pwd"() { line("/home/guest/nikhil"); },
    "ls"() { line("about  projects/  experience/  education/  contact"); },
    "date"() { line(new Date().toString()); },
    "echo"(args) { line(args || ""); },
    "exit"() { line("there's no leaving. but /github has more."); },
    "rm"() { line("permission denied. this shell is read-only."); },
    "vim"() { line("you're safe here. no :q required."); },
    "hire"() { line("let's talk. opening email…", "t-accent"); openURL(`mailto:${ME.email}?subject=Let's%20chat`); },
};
HANDLERS["/hire"] = HANDLERS.hire;
HANDLERS["/resume"] = HANDLERS["/cv"] = () => { line("no résumé file online yet. /experience and /education have the details, or /email for a copy."); };

const prefix = location.pathname.includes("/about") ? "../" : "";

function listCat(cats) {
    cats = [].concat(cats);
    const list = ENTRIES.filter((e) => cats.includes(e.cat));
    lastListing = list;
    options(list.map((e, i) => ({ k: `${i + 1}  ${e.label}`, vHTML: `<span class="t-ink-in">${esc(e.title)}</span> · ${esc(trimAround(e.desc, "", 64))}`, action: () => showEntry(e) })), "open");
    line("/open <n> works too.");
}

function showEntry(e) {
    kv(e.cat.toLowerCase(), e.title, "t-ink");
    kv(e.label, e.desc);
    if (e.href) {
        kv("link", e.href.replace(/^https?:\/\/(www\.)?/, ""));
        line(`opening ${e.title}…`, "t-accent");
        openURL(e.href);
    }
}

/* Free-text search across everything. */
function corpus() {
    const docs = ENTRIES.map((e) => ({
        kind: e.cat.toLowerCase().replace(/s$/, ""), title: e.title, text: `${e.title} ${e.label} ${e.desc} ${e.tags || ""} ${e.cat}`,
        snippet: e.desc, act: () => showEntry(e),
    }));
    ABOUT.forEach((p, i) => docs.push({ kind: "about", title: `paragraph ${i + 1}`, text: p, snippet: p, act: () => line(p, "t-text") }));
    COMMANDS.forEach((c) => docs.push({ kind: "command", title: c.usage || c.name, text: `${c.name} ${c.desc}`, snippet: c.desc, act: () => run(c.usage ? `${c.name} ` : c.name) }));
    docs.push(
        { kind: "contact", title: "email", text: `email mail contact reach hire chat ${ME.email}`, snippet: ME.email, act: () => HANDLERS["/email"]() },
        { kind: "contact", title: "github", text: "github code repos repositories source", snippet: ME.github.replace("https://", ""), act: () => openURL(ME.github) },
        { kind: "contact", title: "linkedin", text: "linkedin profile network career", snippet: "in/nikhil-talagadivi", act: () => openURL(ME.linkedin) },
        { kind: "contact", title: "location", text: "location based where sydney nsw australia live hybrid onsite remote", snippet: `${ME.location} · open to on-site or hybrid`, act: () => line(`${ME.location}. open to on-site or hybrid roles.`) },
    );
    return docs;
}

function search(q) {
    const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 1 || /\d/.test(t));
    if (!terms.length) { line("search for something a bit longer."); return; }
    const scored = corpus().map((d) => {
        const hay = d.text.toLowerCase();
        const title = d.title.toLowerCase();
        let score = 0;
        for (const t of terms) {
            if (title.includes(t)) score += 5;
            const words = hay.split(/[^a-z0-9.+#]+/);
            if (words.includes(t)) score += 3;
            else if (hay.includes(t)) score += 1;
            else if (t.length > 3 && words.some((w) => w.startsWith(t.slice(0, -1)))) score += 0.5;
        }
        return { d, score };
    }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 8);

    if (!scored.length) {
        line(`no matches for "${q}". try /projects, /about, or /help.`);
        return;
    }
    const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    const hi = (s) => esc(s).replace(re, "<mark>$1</mark>");
    line(`${scored.length} match${scored.length > 1 ? "es" : ""} for "${q}"`);
    options(scored.map(({ d }) => ({
        k: d.kind,
        vHTML: `<span class="t-ink-in">${hi(d.title)}</span> · ${hi(trimAround(d.snippet, terms[0], 90))}`,
        action: d.act,
    })), "open");
}

function trimAround(s, term, max) {
    if (s.length <= max) return s;
    const i = Math.max(0, s.toLowerCase().indexOf(term));
    const start = Math.max(0, Math.min(i - 30, s.length - max));
    return (start > 0 ? "…" : "") + s.slice(start, start + max).trim() + (start + max < s.length ? "…" : "");
}

const GREETINGS = /^(hi|hey|hello|yo|sup|hiya|howdy|g'?day|hola)\b/i;

function run(raw, { silent = false } = {}) {
    const text = raw.trim();
    if (!text) return;
    closeSuggest();
    closeMenu();
    if (!silent) echo(text);
    history.push(text);
    histIdx = history.length;

    const [head, ...rest] = text.split(/\s+/);
    let cmd = head.toLowerCase();
    const args = rest.join(" ");
    if (ALIASES[cmd]) cmd = ALIASES[cmd];
    if (!cmd.startsWith("/") && HANDLERS["/" + cmd] && !rest.length) cmd = "/" + cmd;

    if (HANDLERS[cmd]) {
        HANDLERS[cmd](args);
    } else if (cmd.startsWith("/")) {
        const close = COMMANDS.find((c) => c.name.startsWith(cmd.slice(0, 3)));
        line(`unknown command: ${head}.${close ? ` did you mean ${close.name}?` : ""} /help shows everything.`);
    } else if (GREETINGS.test(text)) {
        line("hey. this shell knows my projects, experience and study. type anything to search, or /help shows everything.");
    } else {
        search(text);
    }
    scrollDown();
}

/* ===== Theme =================================================== */

function setTheme(id) {
    root.setAttribute("data-scheme", id);
    store.set("scheme", id);
    syncThemeColor();
}
function syncThemeColor() {
    const bg = getComputedStyle(root).getPropertyValue("--bg").trim();
    $("#theme-color")?.setAttribute("content", bg);
}

/* ===== Input: suggest, history, ghost ========================== */

const history = [];
let histIdx = 0;
let sugIdx = 0;
let sugList = [];

function openSuggest(val) {
    const q = val.toLowerCase();
    sugList = COMMANDS.filter((c) => c.name.startsWith(q.split(" ")[0]));
    if (!sugList.length || q.includes(" ")) { closeSuggest(); return; }
    if (sugList.length === 1 && sugList[0].name === q) { /* exact match: keep showing it */ }
    sugIdx = Math.min(sugIdx, sugList.length - 1);
    suggest.replaceChildren(...sugList.map((c, i) => {
        const r = el("div", "sug" + (i === sugIdx ? " on" : ""));
        r.append(el("span", "sc", c.name), el("span", "sd", c.desc));
        r.addEventListener("mousedown", (ev) => { ev.preventDefault(); pickSuggest(i, true); });
        r.addEventListener("mousemove", () => { sugIdx = i; paintSuggest(); });
        return r;
    }));
    suggest.classList.add("open");
}
function paintSuggest() { [...suggest.children].forEach((n, i) => n.classList.toggle("on", i === sugIdx)); suggest.children[sugIdx]?.scrollIntoView({ block: "nearest" }); }
function closeSuggest() { suggest.classList.remove("open"); sugList = []; sugIdx = 0; }
function pickSuggest(i, go) {
    const c = sugList[i];
    if (!c) return;
    if (c.usage) { input.value = c.name + " "; closeSuggest(); input.focus(); return; }
    input.value = "";
    if (go) run(c.name); else { input.value = c.name; closeSuggest(); }
}

input.addEventListener("input", () => {
    sugIdx = 0;
    if (input.value.startsWith("/")) openSuggest(input.value); else closeSuggest();
});

input.addEventListener("keydown", (ev) => {
    const suggesting = suggest.classList.contains("open");
    if (suggesting) {
        if (ev.key === "ArrowDown") { ev.preventDefault(); sugIdx = (sugIdx + 1) % sugList.length; paintSuggest(); return; }
        if (ev.key === "ArrowUp") { ev.preventDefault(); sugIdx = (sugIdx - 1 + sugList.length) % sugList.length; paintSuggest(); return; }
        if (ev.key === "Tab") { ev.preventDefault(); pickSuggest(sugIdx, false); return; }
        if (ev.key === "Escape") { ev.preventDefault(); closeSuggest(); return; }
        if (ev.key === "Enter") {
            const exact = COMMANDS.some((c) => c.name === input.value.trim().toLowerCase());
            if (!exact) { ev.preventDefault(); pickSuggest(sugIdx, true); return; }
        }
    }
    if (menu && !input.value) {
        if (ev.key === "ArrowDown") { ev.preventDefault(); setMenuIdx(menu.idx + 1); return; }
        if (ev.key === "ArrowUp") { ev.preventDefault(); setMenuIdx(menu.idx - 1); return; }
        if (ev.key === "Enter") { ev.preventDefault(); choose(); return; }
        if (ev.key === "Escape") { ev.preventDefault(); closeMenu(); return; }
    }
    if (ev.key === "ArrowUp" && history.length) {
        ev.preventDefault();
        histIdx = Math.max(0, histIdx - 1);
        input.value = history[histIdx] || "";
        return;
    }
    if (ev.key === "ArrowDown" && history.length) {
        ev.preventDefault();
        histIdx = Math.min(history.length, histIdx + 1);
        input.value = history[histIdx] || "";
        return;
    }
    if (ev.key === "Escape") { input.value = ""; input.blur(); }
    if (ev.key === "l" && ev.ctrlKey) { ev.preventDefault(); HANDLERS["/clear"](); }
});

input.addEventListener("blur", () => setTimeout(closeSuggest, 100));

form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const v = input.value;
    input.value = "";
    if (v.trim()) run(v);
    else if (menu) choose();
});

// Ghost text cycles through things worth typing.
const GHOSTS = ["/help", "/projects", "/play", "type anything to search", "/find roblox", "/about", "/theme", "/contact"];
let ghostI = 0;
setInterval(() => {
    if (input.value || document.activeElement === input && ghostI % 2) return;
    ghostI = (ghostI + 1) % GHOSTS.length;
    ghost.style.opacity = "0";
    setTimeout(() => { ghost.textContent = GHOSTS[ghostI]; ghost.style.opacity = ""; }, 300);
}, 3200);

/* ===== Global keys: menu letters, row navigation =============== */

let kbIdx = -1;
const navRows = () => [...document.querySelectorAll("#featured .frow, #feed .frow, #loadMore")].filter((n) => n.offsetParent);

function setActiveMenu(k) {
    document.querySelectorAll("#menu a").forEach((a) => a.classList.toggle("on", a.dataset.key === k));
}

function go(where) {
    if (where === "home") run("/home", { silent: true });
    else if (where === "about") { run("/about"); setActiveMenu("A"); }
    else if (where === "projects") { run("/projects"); setActiveMenu("P"); }
}

document.querySelectorAll("[data-go]").forEach((n) => {
    const fire = (ev) => { ev.preventDefault(); $("#nav").classList.remove("menu-open"); go(n.dataset.go); };
    n.addEventListener("click", fire);
    n.addEventListener("keydown", (ev) => { if (ev.key === "Enter") fire(ev); });
});
document.querySelectorAll("[data-run]").forEach((n) => n.addEventListener("click", () => run(n.dataset.run)));

document.addEventListener("keydown", (ev) => {
    if (document.activeElement === input || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    if (ev.key === "/") { ev.preventDefault(); input.focus(); input.value = "/"; openSuggest("/"); return; }

    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        if (menu) { ev.preventDefault(); setMenuIdx(menu.idx + (ev.key === "ArrowDown" ? 1 : -1)); return; }
        const list = navRows();
        if (!list.length) return;
        ev.preventDefault();
        kbIdx = ev.key === "ArrowDown" ? Math.min(list.length - 1, kbIdx + 1) : Math.max(0, kbIdx - 1);
        list.forEach((n, i) => n.classList.toggle("kb-on", i === kbIdx));
        list[kbIdx].scrollIntoView({ block: "nearest" });
        return;
    }
    if (ev.key === "Enter") {
        if (menu) { ev.preventDefault(); choose(); return; }
        const n = navRows()[kbIdx];
        if (n) { ev.preventDefault(); n.click(); }
        return;
    }
    if (ev.key === "Escape") { closeMenu(); kbIdx = -1; navRows().forEach((n) => n.classList.remove("kb-on")); return; }

    const link = document.querySelector(`#menu a[data-key="${ev.key.toUpperCase()}"]`);
    if (link && ev.key.length === 1) { ev.preventDefault(); link.click(); return; }

    // Any other printable key starts typing in the prompt.
    if (ev.key.length === 1 && /\S/.test(ev.key)) { input.focus(); }
});

document.addEventListener("mousemove", () => {
    if (kbIdx < 0) return;
    kbIdx = -1;
    document.querySelectorAll(".kb-on").forEach((n) => n.classList.remove("kb-on"));
}, { passive: true });

// Clicking empty space in the main column focuses the prompt.
$(".main").addEventListener("click", (ev) => {
    if (ev.target.closest("a, button, .frow, .load-row, .t-opt, .cmd, input")) return;
    if (window.getSelection()?.toString()) return;
    input.focus();
});

/* ===== Mobile nav ============================================== */

$(".nav-burger").addEventListener("click", () => {
    const nav = $("#nav");
    const open = nav.classList.toggle("menu-open");
    $(".nav-burger").setAttribute("aria-expanded", String(open));
});

/* ===== Feature card ============================================ */

const card = $("#featureCard");
if (store.get("fc-planetengine") !== "dismissed") card.hidden = false;
$("#fcDismiss").addEventListener("click", () => { card.hidden = true; store.set("fc-planetengine", "dismissed"); });

/* ===== Scroll hints ============================================ */

function updateHints() {
    const max = rows.scrollHeight - rows.clientHeight;
    $("#scrollHintTop").style.opacity = rows.scrollTop > 8 ? "1" : "0";
    $("#scrollHint").style.opacity = max - rows.scrollTop > 8 ? "1" : "0";
}
rows.addEventListener("scroll", updateHints, { passive: true });

/* ===== Boot ==================================================== */

renderFeatured();
renderTabs();
renderFeed();
fitBanner();
syncThemeColor();
updateHints();
addEventListener("resize", () => { fitBanner(); updateHints(); });
document.fonts?.ready.then(() => { fitBanner(); updateHints(); });
matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", syncThemeColor);

// Deep links: /#about, /#projects, /?q=roblox
const hash = location.hash.slice(1);
const q = new URLSearchParams(location.search).get("q");
if (q) run(q);
else if (hash && (HANDLERS["/" + hash] || ALIASES["/" + hash])) run("/" + hash);

if (matchMedia("(hover: hover) and (min-width: 901px)").matches) input.focus({ preventScroll: true });
})();
