const signals = [
  {
    age: "31 light years",
    code: "VX–09 / BLUE HOUR",
    id: "blue-hour",
    lang: "en",
    lock: "Lock 94%",
    message: "“You were never late. The signal simply left too early.”",
    mood: "Electric blue",
    origin: "Vega afterimage",
    title: "A familiar future is calling collect.",
  },
  {
    age: "8 minutes",
    code: "LC–14 / LOCAL GHOST",
    id: "local-ghost",
    lang: "de",
    lock: "Lock 87%",
    message: "“Bin kurz durchs All. Licht im Flur bitte anlassen.”",
    mood: "Homesick chrome",
    origin: "Apartment orbit",
    title: "Your hallway has achieved escape velocity.",
  },
  {
    age: "Not applicable",
    code: "ERR–00 / SOFT ERROR",
    id: "soft-error",
    lang: "en",
    lock: "Lock ??%",
    message: "“Nothing is missing. It has only become extremely optional.”",
    mood: "Tender glitch",
    origin: "Unallocated memory",
    title: "The void would like to undo that last thought.",
  },
  {
    age: "One long night",
    code: "SOL–77 / LAST LIGHT",
    id: "last-light",
    lang: "en",
    lock: "Lock 100%",
    message: "“Meet me where the city glow stops pretending to be dawn.”",
    mood: "Amber forever",
    origin: "Edge of reception",
    title: "The final station is still playing our song.",
  },
];

const body = document.body;
const bootScreen = document.querySelector(".boot-screen");
const mainContent = document.querySelector("#main-content");
const skipBootButton = document.querySelector(".boot-screen__skip");
const scanner = document.querySelector(".scanner");
const terminalShell = document.querySelector(".terminal-shell");
const acquireButton = document.querySelector(".acquire-button");
const fragments = [...document.querySelectorAll(".fragment")];
const localTime = document.querySelector("#local-time");
const announcement = document.querySelector("#signal-announcement");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const signalFields = {
  age: document.querySelector("#signal-age"),
  code: document.querySelector("#signal-code"),
  lock: document.querySelector("#signal-lock"),
  message: document.querySelector("#signal-message"),
  mood: document.querySelector("#signal-mood"),
  origin: document.querySelector("#signal-origin"),
  title: document.querySelector("#transmission-title"),
};

let activeSignal = signals[0].id;
let scanX = 50;
let scanY = 50;
let bootTimer;
let scannerBounds;
let pointerFrame;
let pendingPointerPosition;
let activePointerId;
let pointerStart;
let didDrag = false;

terminalShell.inert = body.classList.contains("is-booting");

function finishBoot() {
  if (!body.classList.contains("is-booting")) {
    return;
  }

  const bootHadFocus = bootScreen.contains(document.activeElement);
  window.clearTimeout(bootTimer);
  window.clearTimeout(window.nullStarBootFallback);
  window.nullStarBootObserver.disconnect();
  body.classList.remove("is-booting");
  body.classList.add("is-ready");
  bootScreen.setAttribute("aria-hidden", "true");
  skipBootButton.setAttribute("tabindex", "-1");
  terminalShell.inert = false;

  if (bootHadFocus) {
    mainContent.focus({ preventScroll: true });
  }
}

function updateClock() {
  if (body.dataset.visualTest === "true") {
    return;
  }

  localTime.textContent = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  }).format(new Date());
}

function renderSignal(id, announce = true) {
  const signalIndex = signals.findIndex((signal) => signal.id === id);
  const signal = signals[signalIndex];

  if (!signal) {
    return;
  }

  activeSignal = id;
  body.dataset.signal = id;

  for (const [field, element] of Object.entries(signalFields)) {
    element.textContent = signal[field];
  }

  signalFields.message.lang = signal.lang;

  for (const fragment of fragments) {
    const isActive = fragment.dataset.fragment === id;
    fragment.classList.toggle("is-active", isActive);
    if (isActive) {
      fragment.setAttribute("aria-current", "true");
    } else {
      fragment.removeAttribute("aria-current");
    }
  }

  if (announce) {
    announcement.textContent = `Signal acquired: ${signal.code}. ${signal.title}`;
  }
}

function acquireNextSignal() {
  const currentIndex = signals.findIndex((signal) => signal.id === activeSignal);
  renderSignal(signals[(currentIndex + 1) % signals.length].id);
}

function setScannerPosition(x, y) {
  scanX = Math.min(100, Math.max(0, x));
  scanY = Math.min(100, Math.max(0, y));
  scannerBounds ??= scanner.getBoundingClientRect();
  scanner.style.setProperty("--scan-x", `${scanX}%`);
  scanner.style.setProperty("--scan-y", `${scanY}%`);
  scanner.style.setProperty("--target-x", `${((scanX - 50) / 100) * scannerBounds.width}px`);
  scanner.style.setProperty("--target-y", `${((scanY - 50) / 100) * scannerBounds.height}px`);
}

function refreshScannerBounds() {
  scannerBounds = scanner.getBoundingClientRect();
}

function queueScannerPosition(clientX, clientY) {
  pendingPointerPosition = { clientX, clientY };

  if (pointerFrame) {
    return;
  }

  pointerFrame = window.requestAnimationFrame(() => {
    const { clientX: nextX, clientY: nextY } = pendingPointerPosition;
    const x = ((nextX - scannerBounds.left) / scannerBounds.width) * 100;
    const y = ((nextY - scannerBounds.top) / scannerBounds.height) * 100;
    setScannerPosition(x, y);
    pointerFrame = undefined;
  });
}

function handlePointerDown(event) {
  if (activePointerId !== undefined && event.pointerId !== activePointerId) {
    return;
  }

  refreshScannerBounds();
  activePointerId = event.pointerId;
  pointerStart = { x: event.clientX, y: event.clientY };
  didDrag = false;
  if (event.isTrusted) {
    scanner.setPointerCapture(event.pointerId);
  }
  queueScannerPosition(event.clientX, event.clientY);
}

function handlePointerMove(event) {
  if (event.pointerType !== "mouse" && event.pointerId !== activePointerId) {
    return;
  }

  if (!scannerBounds) {
    refreshScannerBounds();
  }

  if (event.pointerId === activePointerId && pointerStart) {
    didDrag ||= Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 6;
  }

  queueScannerPosition(event.clientX, event.clientY);
}

function handlePointerEnd(event) {
  if (event.pointerId !== activePointerId) {
    return;
  }

  activePointerId = undefined;
  pointerStart = undefined;
  if (scanner.hasPointerCapture(event.pointerId)) {
    scanner.releasePointerCapture(event.pointerId);
  }
}

function handlePointerCancel(event) {
  if (event.pointerId !== activePointerId) {
    return;
  }

  activePointerId = undefined;
  pointerStart = undefined;
  didDrag = false;
}

function handleLostPointerCapture(event) {
  if (event.pointerId === activePointerId) {
    activePointerId = undefined;
    pointerStart = undefined;
    didDrag = false;
  }
}

function handleScannerClick(event) {
  if (didDrag) {
    event.preventDefault();
    didDrag = false;
    return;
  }

  acquireNextSignal();
}

function handleScannerKeydown(event) {
  const increments = {
    ArrowDown: [0, 4],
    ArrowLeft: [-4, 0],
    ArrowRight: [4, 0],
    ArrowUp: [0, -4],
  };
  const increment = increments[event.key];

  if (!increment) {
    return;
  }

  event.preventDefault();
  setScannerPosition(scanX + increment[0], scanY + increment[1]);
}

skipBootButton.addEventListener("click", finishBoot);
scanner.addEventListener("click", handleScannerClick);
scanner.addEventListener("keydown", handleScannerKeydown);
scanner.addEventListener("pointerdown", handlePointerDown);
scanner.addEventListener("pointermove", handlePointerMove);
scanner.addEventListener("pointerup", handlePointerEnd);
scanner.addEventListener("pointercancel", handlePointerCancel);
scanner.addEventListener("lostpointercapture", handleLostPointerCapture);
scanner.addEventListener("pointerenter", refreshScannerBounds);
acquireButton.addEventListener("click", acquireNextSignal);

for (const fragment of fragments) {
  fragment.addEventListener("click", () => {
    renderSignal(fragment.dataset.fragment);
  });
}

window.addEventListener("resize", refreshScannerBounds);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    finishBoot();
  }
});

updateClock();
window.setInterval(updateClock, 1000);
renderSignal(signals[0].id, false);

if (prefersReducedMotion.matches) {
  finishBoot();
} else {
  bootTimer = window.setTimeout(finishBoot, 2100);
}
