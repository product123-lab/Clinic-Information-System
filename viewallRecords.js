// Check login
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser) {
  alert("Please login first.");
  window.location.href = "index.html";
}

const recordsTable = document.getElementById("recordsTable");

// Fields
const employeeExtraFields = [
  { id: "patientID", label: "Patient ID" },
  { id: "civilStatus", label: "Civil Status" },
  { id: "department", label: "Department" },
];
const commonFields = [
  { id: "patientName", label: "Patient Name" },
  { id: "patientAge", label: "Age" },
  { id: "sex", label: "Sex" },
  { id: "patientAddress", label: "Address" },
  { id: "walkInDate", label: "Walk-in Date" },
  { id: "chiefComplaint", label: "Chief Complaint" },
  { id: "history", label: "History of Past Illness" },
  { id: "medication", label: "Medication" },
];
const allFields = [...employeeExtraFields, ...commonFields];

// Load and filter patients
function loadPatients() {
  const allPatients = JSON.parse(localStorage.getItem("patients")) || [];
  return allPatients.filter(p => p.savedBy === loggedInUser.username);
}

// Render table header
function renderTableHeader() {
  recordsTable.innerHTML = "";
  const thead = recordsTable.createTHead();
  const row = thead.insertRow();

  allFields.forEach(f => {
    const th = document.createElement("th");
    th.textContent = f.label;
    row.appendChild(th);
  });

  ["Patient Type", "Timestamp", "Actions"].forEach(txt => {
    const th = document.createElement("th");
    th.textContent = txt;
    row.appendChild(th);
  });
}

// Render patient rows
function renderRecords() {
  renderTableHeader();
  const patients = loadPatients();
  const tbody = recordsTable.createTBody();

  patients.forEach(p => {
    const row = tbody.insertRow();

    allFields.forEach(f => {
      const cell = row.insertCell();
      if (f.id === "sex") {
        cell.textContent = p.sex === "M" ? "Male" : p.sex === "F" ? "Female" : "";
      } else {
        cell.textContent = p[f.id] || "";
      }
    });

    const cellType = row.insertCell();
    cellType.textContent = p.type?.charAt(0).toUpperCase() + p.type?.slice(1) || "";

    const cellTimestamp = row.insertCell();
    cellTimestamp.textContent = p.timestamp || "";

    const cellActions = row.insertCell();

    // View Full History Button
    const viewBtn = document.createElement("button");
    viewBtn.textContent = "View Full History";
    viewBtn.className = "history-btn";
    viewBtn.onclick = () => {
      showFullHistory(p.id);
    };
    cellActions.appendChild(viewBtn);

    // Delete Button
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.onclick = () => {
      if (confirm("Are you sure you want to delete this record?")) {
        deletePatient(p.id);
      }
    };
    cellActions.appendChild(delBtn);
  });
}

// Delete function
function deletePatient(id) {
  let allPatients = JSON.parse(localStorage.getItem("patients")) || [];
  allPatients = allPatients.filter(p => p.id !== id);
  localStorage.setItem("patients", JSON.stringify(allPatients));
  renderRecords();
}

// Modal logic
function showFullHistory(patientId) {
  const allPatients = JSON.parse(localStorage.getItem("patients")) || [];
  const patient = allPatients.find(p => p.id === patientId);
  if (!patient) return alert("Patient not found.");

  const modal = document.getElementById("historyModal");
  const title = document.getElementById("historyTitle");
  const content = document.getElementById("historyContent");

  title.textContent = `Full History for ${patient.patientName || "Unknown"}`;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  let html = "";
  if (patient.fullHistory) {
    months.forEach(month => {
      const value = patient.fullHistory[month] || "(no record)";
      html += `<p><strong>${month}:</strong> ${value}</p>`;
    });
  } else {
    html = "<p>No full history recorded.</p>";
  }

  content.innerHTML = html;
  modal.style.display = "flex";
}

function closeHistoryModal() {
  document.getElementById("historyModal").style.display = "none";
}

// Render the table on load
renderRecords();
