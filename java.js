const handleOnMouseMove = e => {
    const { currentTarget: target } = e;

    const rect = target.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top;

    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
}

for(const card of document.querySelectorAll(".card")){
    card.onmousemove = e => handleOnMouseMove(e);
}

// Enable horizontal scrolling with mouse wheel and touchpad
const wrapper = document.querySelector('.wrapper');
let isTouchPad = false;

wrapper.addEventListener('wheel', (event) => {
    if (event.deltaY !== 0) {
        if (!isTouchPad) {
            event.preventDefault();
            wrapper.scrollLeft += event.deltaY;
        }
    }
});

// Detect if the user is using a touchpad
window.addEventListener('mousemove', (event) => {
    if (event.wheelDeltaY) {
        isTouchPad = false;
    } else if (event.deltaMode === 0) {
        isTouchPad = true;
    }
});
