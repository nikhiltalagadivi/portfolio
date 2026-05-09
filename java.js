const year = document.getElementById("currentYear");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

if (year) {
    year.textContent = new Date().getFullYear();
}

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
