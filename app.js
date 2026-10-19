/**
 * Horaires Groupe Soudeur — modules Stomp
 * Sources: planning Journée normale / Nocturnes
 */

const SCHEDULES = {
  normal: {
    label: "Journée normale",
    hint: "Prolongation possible jusqu’à 20h",
    slots: [
      { time: "13:00", name: "Stomp", kind: "show" },
      { time: "13:22:30", name: "Stomp", kind: "show" },
      { time: "14:30", name: "Stomp", kind: "show" },
      { time: "14:52:30", name: "Stomp", kind: "show" },
      { time: "16:00", name: "Stomp", kind: "show" },
      { time: "16:22:30", name: "Stomp", kind: "show" },
      { time: "17:30", name: "Stomp", kind: "show" },
      { time: "17:52:30", name: "Stomp", kind: "show" },
      { time: "19:15", name: "Défilé des monstres", kind: "special" },
    ],
  },
  nocturne: {
    label: "Journée nocturne",
    hint: "Dates : 10, 16, 17, 21–24, 28–31 oct. & 7 nov.",
    slots: [
      { time: "12:00", name: "Stomp", kind: "show" },
      { time: "12:22:30", name: "Stomp", kind: "show" },
      { time: "13:30", name: "Stomp", kind: "show" },
      { time: "13:52:30", name: "Stomp", kind: "show" },
      { time: "15:00", name: "Stomp", kind: "show" },
      { time: "15:22:30", name: "Stomp", kind: "show" },
      { time: "16:30", name: "Stomp", kind: "show" },
      { time: "16:52:30", name: "Stomp", kind: "show" },
      { time: "17:30", name: "Défilé des monstres", kind: "special" },
    ],
  },
};

const STORAGE_KEY = "soudeur-nocturne";

const toggle = document.getElementById("nocturne-toggle");
const toggleBlock = document.querySelector(".toggle-block");
const labelEl = document.getElementById("schedule-label");
const hintEl = document.getElementById("hint");
const timeline = document.getElementById("timeline");
const nowCard = document.getElementById("now-card");
const nowTime = document.getElementById("now-time");
const nowMeta = document.getElementById("now-meta");

function parseTimeToMinutes(time) {
  const [h, m, s = "0"] = time.split(":");
  return Number(h) * 60 + Number(m) + Number(s) / 60;
}

function formatDisplayTime(time) {
  const [h, m, s] = time.split(":");
  if (s) return `${h}h${m} ${Number(s)}s`;
  return `${h}h${m}`;
}

function getNowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

function currentMode() {
  return toggle.getAttribute("aria-checked") === "true" ? "nocturne" : "normal";
}

function setMode(nocturne) {
  toggle.setAttribute("aria-checked", String(nocturne));
  toggleBlock.classList.toggle("is-on", nocturne);
  localStorage.setItem(STORAGE_KEY, nocturne ? "1" : "0");
  render();
}

function findNextIndex(slots, now) {
  return slots.findIndex((slot) => parseTimeToMinutes(slot.time) > now - 0.01);
}

function render() {
  const mode = currentMode();
  const data = SCHEDULES[mode];
  const now = getNowMinutes();
  const nextIdx = findNextIndex(data.slots, now);

  labelEl.textContent = data.label;
  hintEl.textContent = data.hint;

  timeline.replaceChildren();

  data.slots.forEach((slot, i) => {
    const li = document.createElement("li");
    const isNext = i === nextIdx;
    const isDone = nextIdx === -1 || i < nextIdx;

    li.className = "slot";
    if (slot.kind === "special") li.classList.add("slot--special");
    if (isNext) li.classList.add("slot--next");
    if (isDone && !isNext) li.classList.add("slot--done");
    li.style.animationDelay = `${0.04 * i}s`;

    li.innerHTML = `
      <p class="slot__time">${formatDisplayTime(slot.time)}</p>
      <div>
        <p class="slot__name">${slot.name}</p>
        <p class="slot__tag">${slot.kind === "special" ? "Événement" : "Module"}</p>
      </div>
      <span class="slot__dot" aria-hidden="true"></span>
    `;

    timeline.appendChild(li);
  });

  if (nextIdx >= 0) {
    const next = data.slots[nextIdx];
    nowCard.hidden = false;
    nowTime.textContent = formatDisplayTime(next.time);
    nowMeta.textContent =
      next.kind === "special"
        ? next.name
        : `${next.name} · environ 7 min 30`;
  } else {
    nowCard.hidden = true;
  }
}

toggle.addEventListener("click", () => {
  setMode(toggle.getAttribute("aria-checked") !== "true");
});

const saved = localStorage.getItem(STORAGE_KEY) === "1";
setMode(saved);

setInterval(render, 30_000);
