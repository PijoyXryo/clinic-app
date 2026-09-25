// ===== 1. DATA =====
let patients = []; // NEW: starts empty, filled by loadPatients()
const STORAGE_KEY = "mediqueue-patients";

function getFee(age) {
  if (age < 12) return 25;
  if (age >= 60) return 20;
  return 35;
}

// Security: show typed HTML as plain text
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== 2. FIND elements =====
const queueBody = document.querySelector("#queue-body");
const nowNumber = document.querySelector("#now-number");
const nowName = document.querySelector("#now-name");
const form = document.querySelector("#register-form");
const nameInput = document.querySelector("#name");
const ageInput = document.querySelector("#age");
const message = document.querySelector("#message");     // NEW
const resetButton = document.querySelector("#reset");   // NEW

// ===== 3. SAVE & LOAD (NEW) =====
function save() {
  // localStorage only stores text, so convert the array to JSON text
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

async function loadPatients() {
  // 1) If we saved data before, use it
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    patients = JSON.parse(saved);
    render();
    return;
  }

  // 2) Otherwise, load the starting data from the "server"
  message.textContent = "Loading queue...";
  try {
    const response = await fetch("patients.json");
    if (!response.ok) {
      throw new Error(`Could not load queue (status ${response.status})`);
    }
    patients = await response.json();
    message.textContent = "";
    save();
    render();
  } catch (error) {
    message.textContent = `⚠️ ${error.message}`;
    message.className = "error";
  }
}

// ===== 4. RENDER =====
function render() {
  queueBody.innerHTML = patients
    .map(
      (p) => `
      <tr>
        <td>${p.number}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${p.age}</td>
        <td>RM${getFee(p.age)}</td>
        <td><span class="badge ${p.status}">${p.status}</span></td>
        <td>
          <button data-number="${p.number}" data-action="called">Call</button>
          <button class="secondary" data-number="${p.number}" data-action="done">Done</button>
        </td>
      </tr>`
    )
    .join("");

  const current = patients.find((p) => p.status === "called");
  nowNumber.textContent = current ? `#${current.number}` : "—";
  nowName.textContent = current ? current.name : "No one yet";
}

// ===== 5. EVENTS =====
form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from refreshing

  const name = nameInput.value.trim();
  if (!name) return;

  // NEW: next number = biggest existing number + 1 (safer than length + 1)
  const nextNumber = Math.max(0, ...patients.map((p) => p.number)) + 1;

  patients.push({
    number: nextNumber,
    name: name,
    age: Number(ageInput.value),
    status: "waiting",
  });

  save(); // NEW
  form.reset();
  nameInput.focus();
  render();
});

queueBody.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const number = Number(button.dataset.number);
  const action = button.dataset.action;

  // Only one patient can be "called" at a time
  if (action === "called") {
    patients.forEach((p) => {
      if (p.status === "called") p.status = "done";
    });
  }

  const patient = patients.find((p) => p.number === number);
  patient.status = action;
  save(); // NEW
  render();
});

// NEW: clear saved data and start fresh
resetButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  location.reload(); // refresh the page
});

// ===== 6. START =====
loadPatients();