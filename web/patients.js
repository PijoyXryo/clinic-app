// ===== SETTINGS =====
const API_URL = "http://localhost:3000";

// ===== FIND ELEMENTS =====
const form = document.querySelector("#patient-form");
const submitBtn = document.querySelector("#submit-btn");
const message = document.querySelector("#message");
const tbody = document.querySelector("#patients-body");

// ===== HELPERS =====
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = type; // "success" or "error"
}

// ===== LOAD PATIENTS (GET) =====
async function loadPatients() {
  try {
    const response = await fetch(`${API_URL}/patients`);
    if (!response.ok) {
      throw new Error(`Could not load patients (status ${response.status})`);
    }
    const patients = await response.json();
    render(patients);
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5">⚠️ ${escapeHtml(error.message)}</td></tr>`;
  }
}

function render(patients) {
  tbody.innerHTML = patients
    .map(
      (p) => `
      <tr>
        <td>${p.id}</td>
        <td>${escapeHtml(p.fullName)}</td>
        <td>${escapeHtml(p.icNumber)}</td>
        <td>${p.age ?? "-"}</td>
        <td>${new Date(p.createdAt).toLocaleDateString("en-MY")}</td>
      </tr>`
    )
    .join("");
}

// ===== REGISTER PATIENT (POST) =====
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const newPatient = {
    fullName: document.querySelector("#fullName").value.trim(),
    icNumber: document.querySelector("#icNumber").value.trim(),
    age: Number(document.querySelector("#age").value),
  };

  submitBtn.disabled = true; // stop double-clicks creating 2 patients
  submitBtn.textContent = "Saving...";

  try {
    const response = await fetch(`${API_URL}/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPatient),
    });
    const data = await response.json();

    if (!response.ok) {
      // NestJS sends validation errors as an array, other errors as a string
      const errorText = Array.isArray(data.message) ? data.message.join(", ") : data.message;
      showMessage(`❌ ${errorText}`, "error");
      return;
    }

    showMessage(`✅ ${data.fullName} registered with ID ${data.id}`, "success");
    form.reset();
    loadPatients();
  } catch (error) {
    // fetch itself failed = server is down or unreachable
    showMessage("❌ Cannot reach the server. Is the backend running?", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Register";
  }
});

// ===== START =====
loadPatients();