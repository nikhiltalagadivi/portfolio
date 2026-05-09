const year = document.getElementById("currentYear");
const themeToggle = document.querySelector(".theme-toggle");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

if (year) {
    year.textContent = new Date().getFullYear();
}

function applyTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);

    if (themeToggle) {
        themeToggle.textContent = isDark ? "light" : "dark";
        themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
        themeToggle.setAttribute("title", isDark ? "Light mode" : "Dark mode");
    }
}

const savedTheme = localStorage.getItem("theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
applyTheme(savedTheme || preferredTheme);

themeToggle?.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
});

function setActiveLink() {
    const offset = window.innerHeight * 0.32;
    let activeId = sections[0]?.id;

    sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= offset) {
            activeId = section.id;
        }
    });

    navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });
}

setActiveLink();
window.addEventListener("scroll", setActiveLink, { passive: true });
