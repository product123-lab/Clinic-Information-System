// Check if logged in
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser) {
  alert("Please login first.");
  window.location.href = "index.html";
}

// Get patient type from URL
const urlParams = new URLSearchParams(window.location.search);
const patientType = urlParams.get("type");
if (!patientType || !["guest", "employee"].includes(patientType)) {
  alert("Invalid patient type.");
  window.location.href = "dashboard.html";
}

document.getElementById("pageTitle").textContent = `Add ${patientType.charAt(0).toUpperCase() + patientType.slice(1)} Patient`;

// Elements
const form = document.getElementById("patientForm");
const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

// Define fields
const commonFields = [
  { id: "patientName", label: "Patient Name", type: "text", required: true },
  { id: "patientAge", label: "Age", type: "number", required: true },
  { id: "sex", label: "Sex", type: "radio", options: ["M", "F"], required: true },
  { id: "patientAddress", label: "Address", type: "text" },
  { id: "walkInDate", label: "Walk-in Date", type: "date" },
  { id: "chiefComplaint", label: "Chief Complaint", type: "select", options: ["Fever", "Cough", "Headache", "Cold", "Body Pain", "Toothache", "Stomach Pain", "Dizziness", "Other"], required: true },
  { id: "history", label: "History of Past Illness", type: "text" },
  { id: "medication", label: "Medication", type: "text" },
];

const employeeExtraFields = [
  { id: "patientID", label: "Patient ID", type: "text", required: true },
  { id: "civilStatus", label: "Civil Status", type: "text" },
  { id: "department", label: "Department", type: "select" },  // Changed to "select"
];

const departments = [
  "HR", "Finance and Corporate Services", "Life Sciences & Education", "Park Grounds", "Engineering", 
  "Security", "Parks and Adventure", "Safari Camp", "Base Camp", "Front Office", "Motorpool", 
  "Sales & Marketing", "Office of the VP", "ML-Agri Ventures", "Santican Cattle Station", 
  "Tunnel Garden", "Tenants"
];

const tenants = [
  "Outpost", "Auntie Anne's", "Pizzeria Michelangelo", "Convenient Store"
];

// Build form dynamically
function buildForm() {
  form.innerHTML = "";

  let fields;
  if (patientType === "employee") {
    fields = [
      employeeExtraFields[0], // Patient ID
      commonFields.find(f => f.id === "patientName"), // Patient Name next
      employeeExtraFields[1], // Civil Status
      employeeExtraFields[2], // Department
      ...commonFields.filter(f => f.id !== "patientName") // rest of commonFields without patientName
    ];
  } else {
    fields = commonFields;
  }

  fields.forEach(field => {
    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "10px";

    const label = document.createElement("label");
    label.textContent = field.label + (field.required ? " *" : "");
    label.setAttribute("for", field.id);
    wrapper.appendChild(label);

    if (field.type === "radio") {
      field.options.forEach(opt => {
        const radioLabel = document.createElement("label");
        radioLabel.style.marginLeft = "10px";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = field.id;
        input.value = opt;
        if (field.required) input.required = true;
        radioLabel.appendChild(input);
        radioLabel.appendChild(document.createTextNode(opt === "M" ? "Male" : "Female"));
        wrapper.appendChild(radioLabel);
      });
    } else if (field.type === "select") {
      const select = document.createElement("select");
      select.id = field.id;
      if (field.required) select.required = true;

      const defaultOpt = document.createElement("option");
      defaultOpt.value = "";
      defaultOpt.textContent = "Select an option";
      select.appendChild(defaultOpt);

      if (field.id === "chiefComplaint") {
        // Populate chief complaints dropdown
        field.options.forEach(opt => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          select.appendChild(option);
        });

        // Add event listener to show "Other" input field
        select.addEventListener("change", () => {
          if (select.value === "Other") {
            // Only create the input field if it doesn't already exist
            if (!document.getElementById("otherComplaint")) {
              const otherInput = document.createElement("input");
              otherInput.type = "text";
              otherInput.id = "otherComplaint";
              otherInput.placeholder = "Please specify";
              otherInput.required = true;
              wrapper.appendChild(otherInput);
            }
          } else {
            const otherInput = document.getElementById("otherComplaint");
            if (otherInput) wrapper.removeChild(otherInput);
          }
        });
      } else if (field.id === "department") {
        // Populate departments dropdown
        departments.forEach(department => {
          const option = document.createElement("option");
          option.value = department;
          option.textContent = department;
          select.appendChild(option);
        });

        // Add change event for department selection
        select.addEventListener("change", handleDepartmentChange);
      } else {
        field.options.forEach(opt => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          select.appendChild(option);
        });
      }

      wrapper.appendChild(select);
    } else {
      const input = document.createElement("input");
      input.type = field.type;
      input.id = field.id;
      if (field.required) input.required = true;
      wrapper.appendChild(input);
    }

    form.appendChild(wrapper);
  });

  // Submit button
  const btn = document.createElement("button");
  btn.type = "submit";
  btn.textContent = "Add Patient";
  form.appendChild(btn);
}

// Handle department change
function handleDepartmentChange(event) {
  const selectedDepartment = event.target.value;
  
  const tenantWrapper = document.getElementById("tenantWrapper");
  if (tenantWrapper) tenantWrapper.remove(); // Remove tenant options if they exist

  if (selectedDepartment === "Tenants") {
    const tenantWrapper = document.createElement("div");
    tenantWrapper.id = "tenantWrapper";

    const tenantSelect = document.createElement("select");
    tenantSelect.id = "tenant";
    tenantSelect.required = true;
    
    const tenantDefaultOption = document.createElement("option");
    tenantDefaultOption.value = "";
    tenantDefaultOption.textContent = "Select Tenant";
    tenantSelect.appendChild(tenantDefaultOption);

    tenants.forEach(tenant => {
      const option = document.createElement("option");
      option.value = tenant;
      option.textContent = tenant;
      tenantSelect.appendChild(option);
    });

    tenantWrapper.appendChild(tenantSelect);
    event.target.parentElement.appendChild(tenantWrapper); // Append tenant dropdown under department field
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();

  let fields;
  if (patientType === "employee") {
    fields = [
      employeeExtraFields[0], // Patient ID
      commonFields.find(f => f.id === "patientName"),
      employeeExtraFields[1], // Civil Status
      employeeExtraFields[2], // Department
      ...commonFields.filter(f => f.id !== "patientName")
    ];
  } else {
    fields = commonFields;
  }

  const patientData = {};

  for (const f of fields) {
    if (f.type === "radio") {
      const checked = form.querySelector(`input[name="${f.id}"]:checked`);
      if (f.required && !checked) {
        alert(`Please select ${f.label}`);
        return;
      }
      patientData[f.id] = checked ? checked.value : "";
    } else if (f.type === "select") {
      const select = form.querySelector(`#${f.id}`);
      if (f.required && !select.value) {
        alert(`Please select ${f.label}`);
        return;
      }
      patientData[f.id] = select.value;
    } else {
      const input = form.querySelector(`#${f.id}`);
      if (f.required && !input.value.trim()) {
        alert(`Please fill in ${f.label}`);
        return;
      }
      patientData[f.id] = input.value.trim();
    }
  }

  // Check for custom input in "Other" field
  const otherComplaint = document.getElementById("otherComplaint");
  if (otherComplaint && otherComplaint.value.trim()) {
    patientData["chiefComplaint"] = otherComplaint.value.trim();
  }

  // Add metadata
  patientData.id = Date.now().toString() + Math.floor(Math.random() * 1000); // unique id
  patientData.type = patientType;
  patientData.savedBy = loggedInUser.username;
  patientData.timestamp = new Date().toLocaleString();

  // Save
  const allPatients = JSON.parse(localStorage.getItem("patients")) || [];
  allPatients.push(patientData);
  localStorage.setItem("patients", JSON.stringify(allPatients));

  alert("Patient added successfully!");

  form.reset();
});

buildForm();
