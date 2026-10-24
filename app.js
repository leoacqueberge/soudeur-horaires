/**
 * Horaires Groupe Soudeur — UI style Walky (Sable)
 */

const SCHEDULES = {
  normal: {
    label: "Journée normale",
    hint: "Prolongation possible jusqu’à 20h",
    slots: [
      { time: "13:00" },
      { time: "13:22:30" },
      { time: "14:30" },
      { time: "14:52:30" },
      { time: "16:00" },
      { time: "16:22:30" },
      { time: "17:30" },
      { time: "17:52:30" },
    ],
  },
  nocturne: {
    label: "Journée nocturne",
    hint: "10, 16, 17, 21–24, 28–31 oct. & 7 nov.",
    slots: [
      { time: "12:00" },
      { time: "12:22:30" },
      { time: "13:30" },
      { time: "13:52:30" },
      { time: "15:00" },
      { time: "15:22:30" },
      { time: "16:30" },
      { time: "16:52:30" },
    ],
  },
};

const STORAGE_KEY = "soudeur-nocturne";

const nocturneInput = document.getElementById("nocturne-input");
const heroTime = document.getElementById("hero-time");
const heroLabel = document.getElementById("hero-label");
const heroCountdown = document.getElementById("hero-countdown");
const statValue = document.getElementById("stat-value");
const statLabel = document.getElementById("stat-label");
const scheduleLabel = document.getElementById("schedule-label");
const hintEl = document.getElementById("hint");
const timeline = document.getElementById("timeline");

function parseTimeToMinutes(time) {
  const [h, m, s = "0"] = time.split(":");
  return Number(h) * 60 + Number(m) + Number(s) / 60;
}

function formatDisplayTime(time) {
  const [h, m, s] = time.split(":");
  if (s) return `${h}h${m} ${Number(s)}s`;
  return `${h}h${m}`;
}

function formatCountdown(minutesUntil) {
  if (minutesUntil <= 0) return "c’est maintenant";
  const mins = Math.floor(minutesUntil);
  if (mins < 1) return "dans moins d’1 min";
  return mins === 1 ? "dans 1 min" : `dans ${mins} min`;
}

function getNowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

function isNocturne() {
  return nocturneInput.checked;
}

function setMode(nocturne) {
  nocturneInput.checked = nocturne;
  localStorage.setItem(STORAGE_KEY, nocturne ? "1" : "0");
  render();
}

function findNextIndex(slots, now) {
  return slots.findIndex((slot) => parseTimeToMinutes(slot.time) > now - 0.01);
}

function render() {
  const data = SCHEDULES[isNocturne() ? "nocturne" : "normal"];
  const now = getNowMinutes();
  const nextIdx = findNextIndex(data.slots, now);
  const remaining = nextIdx === -1 ? 0 : data.slots.length - nextIdx;

  scheduleLabel.textContent = data.label;
  hintEl.textContent = data.hint;

  if (nextIdx >= 0) {
    const minutesUntil =
      parseTimeToMinutes(data.slots[nextIdx].time) - now;
    heroTime.textContent = formatDisplayTime(data.slots[nextIdx].time);
    heroLabel.textContent = "Prochain,";
    heroCountdown.hidden = false;
    heroCountdown.textContent = formatCountdown(minutesUntil);
  } else {
    heroTime.textContent = "Fin";
    heroLabel.textContent = "Plus de créneau,";
    heroCountdown.hidden = true;
    heroCountdown.textContent = "";
  }

  statValue.textContent = String(remaining);
  statLabel.textContent =
    remaining <= 1 ? "créneau restant" : "créneaux restants";

  timeline.replaceChildren();

  data.slots.forEach((slot, i) => {
    const li = document.createElement("li");
    const isNext = i === nextIdx;
    const isDone = nextIdx === -1 || i < nextIdx;

    li.className = "show";
    if (isNext) li.classList.add("show--next");
    if (isDone && !isNext) li.classList.add("show--done");
    li.style.animationDelay = `${0.03 * i}s`;

    li.innerHTML = `
      <span class="show__time">${formatDisplayTime(slot.time)}</span>
      <span class="show__name">Soudeur</span>
    `;

    timeline.appendChild(li);
  });
}

nocturneInput.addEventListener("change", () => {
  setMode(nocturneInput.checked);
});

setMode(localStorage.getItem(STORAGE_KEY) === "1");
setInterval(render, 1_000);
