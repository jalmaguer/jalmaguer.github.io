// A thrown ball's height over time, drawn as straight segments.
// The end points are fixed on the ground; the reader drags the ones between.

const MASS = 1;        // kg
const GRAVITY = 9.8;   // m/s²
const DURATION = 2;    // s
const MAX_HEIGHT = 10; // m, top of the graph
const TIMES = [0, 0.5, 1, 1.5, 2]; // s, evenly spaced

const CHART_HEIGHT = 360; // CSS pixels
const MARGIN = { top: 28, right: 20, bottom: 52, left: 48 };
const HANDLE_SIZE = 44; // large enough to grab with a finger

// Each segment has one speed. Gravity's potential energy changes linearly along
// it, so its average height gives the exact total.
function score(heights) {
    let kinetic = 0;
    let potential = 0;
    for (let i = 1; i < heights.length; i++) {
        const dt = TIMES[i] - TIMES[i - 1];
        const speed = (heights[i] - heights[i - 1]) / dt;
        const averageHeight = (heights[i] + heights[i - 1]) / 2;
        kinetic += 0.5 * MASS * speed ** 2 * dt;
        potential += MASS * GRAVITY * averageHeight * dt;
    }
    return { kinetic, potential, action: kinetic - potential };
}

function format(value) {
    // Avoid showing "-0.0", and use a true minus sign.
    const rounded = Math.round(value * 10) / 10 || 0;
    return rounded.toFixed(1).replace("-", "−");
}

function createElement(tag, style, parent) {
    const element = document.createElement(tag);
    Object.assign(element.style, style);
    parent.append(element);
    return element;
}

export default function mount(el, options = {}) {
    // One height per time, including the two fixed ends.
    const heights = TIMES.map(() => 0);
    options.heights?.forEach((value, i) => { heights[i + 1] = value; });
    let width = 0;

    const root = createElement("div", {}, el);
    const chart = createElement("div", { position: "relative" }, root);
    const canvas = createElement("canvas", {
        display: "block",
        width: "100%",
        height: `${CHART_HEIGHT}px`,
    }, chart);
    const context = canvas.getContext("2d");

    // The handles are the only parts that block touch scrolling.
    const handles = TIMES.slice(1, -1).map((time, i) => {
        const element = createElement("div", {
            position: "absolute",
            width: `${HANDLE_SIZE}px`,
            height: `${HANDLE_SIZE}px`,
            borderRadius: "50%",
            cursor: "ns-resize",
            touchAction: "none",
        }, chart);
        // grabOffset is set while this handle is being dragged.
        return { element, index: i + 1, grabOffset: null };
    });

    const readout = createElement("div", {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "0.5rem",
        textAlign: "center",
        fontVariantNumeric: "tabular-nums",
    }, root);

    function createValue(label) {
        const box = createElement("div", {}, readout);
        createElement("div", { fontSize: "0.875rem", color: "#666" }, box)
            .textContent = label;
        const value = createElement("div", { fontSize: "1.5rem" }, box);
        createElement("div", { fontSize: "0.75rem", color: "#666" }, box)
            .textContent = "J·s";
        return value;
    }

    const kineticValue = createValue("kinetic");
    const potentialValue = createValue("height");
    const actionValue = createValue("action = kinetic − height");

    function toX(time) {
        const plotWidth = width - MARGIN.left - MARGIN.right;
        return MARGIN.left + (time / DURATION) * plotWidth;
    }

    function toY(metres) {
        const plotHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
        return MARGIN.top + (1 - metres / MAX_HEIGHT) * plotHeight;
    }

    function toHeight(y) {
        const plotHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
        return (1 - (y - MARGIN.top) / plotHeight) * MAX_HEIGHT;
    }

    function line(x1, y1, x2, y2) {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }

    function dot(x, y, radius) {
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.fill();
    }

    function drawAxes() {
        context.font = "13px system-ui, sans-serif";
        context.fillStyle = "#666";
        context.lineWidth = 1;

        context.textAlign = "right";
        context.textBaseline = "middle";
        for (let metres = 0; metres <= MAX_HEIGHT; metres += 2) {
            context.strokeStyle = metres === 0 ? "#999" : "#e5e5e5";
            line(toX(0), toY(metres), toX(DURATION), toY(metres));
            context.fillText(metres, toX(0) - 8, toY(metres));
        }

        context.textAlign = "center";
        context.textBaseline = "top";
        for (const time of TIMES) {
            context.fillText(time, toX(time), toY(0) + 16);
        }
        context.fillText("time (s)", toX(DURATION / 2), toY(0) + 34);

        context.textAlign = "left";
        context.textBaseline = "bottom";
        context.fillText("height (m)", 4, MARGIN.top - 10);
    }

    function drawPath() {
        context.strokeStyle = "#0b5cad";
        context.lineWidth = 3;
        context.beginPath();
        TIMES.forEach((time, i) => {
            context.lineTo(toX(time), toY(heights[i]));
        });
        context.stroke();

        context.fillStyle = "#222";
        dot(toX(0), toY(0), 5);
        dot(toX(DURATION), toY(0), 5);

        context.fillStyle = "#0b5cad";
        for (const { index } of handles) {
            dot(toX(TIMES[index]), toY(heights[index]), 11);
        }
    }

    function draw() {
        if (width === 0) return;
        context.clearRect(0, 0, width, CHART_HEIGHT);
        drawAxes();
        drawPath();

        for (const { element, index } of handles) {
            element.style.left = `${toX(TIMES[index]) - HANDLE_SIZE / 2}px`;
            element.style.top = `${toY(heights[index]) - HANDLE_SIZE / 2}px`;
        }

        const { kinetic, potential, action } = score(heights);
        kineticValue.textContent = format(kinetic);
        potentialValue.textContent = format(potential);
        actionValue.textContent = format(action);
    }

    function resize() {
        width = canvas.clientWidth;
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(CHART_HEIGHT * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        draw();
    }

    function pointerY(event) {
        return event.clientY - canvas.getBoundingClientRect().top;
    }

    function addDragListeners(handle) {
        const { element, index } = handle;

        element.addEventListener("pointerdown", (event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            element.setPointerCapture(event.pointerId);
            // Remember where the handle was grabbed so the point doesn't jump.
            handle.grabOffset = toY(heights[index]) - pointerY(event);
        });

        element.addEventListener("pointermove", (event) => {
            if (handle.grabOffset === null) return;
            const target = toHeight(pointerY(event) + handle.grabOffset);
            heights[index] = Math.min(MAX_HEIGHT, Math.max(0, target));
            draw();
        });

        element.addEventListener("lostpointercapture", () => {
            handle.grabOffset = null;
        });
    }

    handles.forEach(addDragListeners);

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return {
        destroy() {
            observer.disconnect();
            root.remove(); // the handles' listeners go with it
        },
    };
}
