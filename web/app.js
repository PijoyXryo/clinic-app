// ===== SETTINGS =====
const API_URL = "http://localhost:3000";

// ===== FIND ELEMENTS =====
const queueBody = document.querySelector("#queue-body");
const nowNumber = document.querySelector("#now-number");
const nowName = document.querySelector("#now-name");
const form = document.querySelector("#book-form");
const bookBtn = document.querySelector("#book-btn");
const message = document.querySelector("#message");

// ===== HELPERS =====
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = type;
}

// One function for ALL API calls: sends JSON, turns errors into readable messages
async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) {
    const text = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    throw new Error(text);
  }
  return data;
}

// ===== LOAD & RENDER =====
async function loadQueue() {
  try {
    const queue = await api("/appointments/today");
    render(queue);
  } catch (error) {
    queueBody.innerHTML = `<tr><td colspan="7">⚠️ ${escapeHtml(error.message)}</td></tr>`;
  }
}

function render(queue) {
  if (queue.length === 0) {
    queueBody.innerHTML = `<tr><td colspan="7">No appointments today yet.</td></tr>`;
  } else {
    queueBody.innerHTML = queue
      .map(
        (a) => `
        <tr>
          <td>${a.queueNumber}</td>
          <td>${escapeHtml(a.patient.fullName)}</td>
          <td>${a.patient.age ?? "-"}</td>
          <td>${escapeHtml(a.reason ?? "-")}</td>
          <td>RM${a.fee.toFixed(2)}</td>
          <td><span class="badge ${a.status}">${a.status}</span></td>
          <td>
            <button data-id="${a.id}" data-status="called">Call</button>
            <button class="secondary" data-id="${a.id}" data-status="done">Done</button>
          </td>
        </tr>`
      )
      .join("");
  }

  const current = queue.find((a) => a.status === "called");
  nowNumber.textContent = current ? `#${current.queueNumber}` : "—";
  nowName.textContent = current ? current.patient.fullName : "No one yet";
}

// ===== BOOK (POST) =====
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = {
    patientId: Number(document.querySelector("#patientId").value),
  };
  const reason = document.querySelector("#reason").value.trim();
  if (reason) body.reason = reason; // only send it if typed

  bookBtn.disabled = true;
  try {
    const appt = await api("/appointments", { method: "POST", body: JSON.stringify(body) });
    showMessage(`✅ ${appt.patient.fullName} is #${appt.queueNumber} (RM${appt.fee.toFixed(2)})`, "success");
    form.reset();
    loadQueue();
  } catch (error) {
    showMessage(`❌ ${error.message}`, "error");
  } finally {
    bookBtn.disabled = false;
  }
});

// ===== CALL / DONE (PATCH) =====
queueBody.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  try {
    await api(`/appointments/${button.dataset.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: button.dataset.status }),
    });
    loadQueue();
  } catch (error) {
    showMessage(`❌ ${error.message}`, "error");
  }
});

// ===== START =====
loadQueue();
setInterval(loadQueue, 5000); // refresh every 5 seconds, so other screens see changes