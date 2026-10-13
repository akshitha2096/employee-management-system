// Route guard: must be logged in
if (!Auth.getToken()) window.location.replace("index.html");

const API = Auth.base() + "/api/employees";
const $ = (id) => document.getElementById(id);
const FIELDS = ["firstName", "lastName", "email", "phone", "department", "designation", "salary", "dateOfJoining"];
let employees = [];
let deleteId = null;

/* ---------- helpers ---------- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

function toast(msg, type = "ok") {
  const t = $("toast");
  t.textContent = msg; t.className = "toast show " + type;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (t.className = "toast"), 2800);
}

async function api(url, options = {}) {
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: Auth.getToken(), ...(options.headers || {}) },
    });
  } catch (e) {
    throw { message: "Cannot reach the server" };
  }
  if (res.status === 401) { Auth.logout(); throw { message: "Session expired" }; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { message: data.message || "Request failed", errors: data.errors };
  return data;
}

/* ---------- load & render ---------- */
async function load() {
  try {
    const q = $("search").value.trim();
    employees = await api(API + (q ? "?q=" + encodeURIComponent(q) : ""));
    render();
  } catch (e) { toast(e.message, "error"); }
}

function render() {
  $("tbody").innerHTML = employees.map((e) => `
    <tr>
      <td>${e.id}</td>
      <td>${esc(e.firstName)} ${esc(e.lastName)}</td>
      <td>${esc(e.email)}</td>
      <td>${esc(e.phone) || "-"}</td>
      <td><span class="badge">${esc(e.department)}</span></td>
      <td>${esc(e.designation)}</td>
      <td>${money(e.salary)}</td>
      <td>${esc(e.dateOfJoining)}</td>
      <td class="actions">
        <button class="icon-btn edit" data-edit="${e.id}">Edit</button>
        <button class="icon-btn del" data-del="${e.id}">Delete</button>
      </td>
    </tr>`).join("");
  $("empty").style.display = employees.length ? "none" : "block";

  $("statTotal").textContent = employees.length;
  $("statDepts").textContent = new Set(employees.map((e) => e.department.toLowerCase())).size;
  const avg = employees.length ? employees.reduce((s, e) => s + Number(e.salary), 0) / employees.length : 0;
  $("statAvg").textContent = money(avg);
}

/* ---------- add / edit ---------- */
function clearErrors() { document.querySelectorAll(".err").forEach((d) => (d.textContent = "")); }
function showErrors(errors) {
  Object.entries(errors || {}).forEach(([f, m]) => {
    const d = document.querySelector(`.err[data-for="${f}"]`);
    if (d) d.textContent = m;
  });
}

function openForm(emp) {
  clearErrors();
  $("empForm").reset();
  $("modalTitle").textContent = emp ? "Edit Employee" : "Add Employee";
  $("empId").value = emp ? emp.id : "";
  FIELDS.forEach((f) => ($(f).value = emp ? emp[f] ?? "" : ""));
  $("formOverlay").classList.add("show");
}
const closeForm = () => $("formOverlay").classList.remove("show");

$("empForm").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  clearErrors();
  const payload = {};
  FIELDS.forEach((f) => (payload[f] = $(f).value.trim()));
  payload.salary = payload.salary === "" ? null : Number(payload.salary);
  if (!payload.phone) payload.phone = null;

  const id = $("empId").value;
  $("saveBtn").disabled = true;
  try {
    await api(id ? `${API}/${id}` : API, { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
    closeForm();
    toast(id ? "Employee updated" : "Employee added");
    load();
  } catch (e) {
    showErrors(e.errors);
    toast(e.message, "error");
  } finally { $("saveBtn").disabled = false; }
});

/* ---------- delete ---------- */
$("delConfirm").addEventListener("click", async () => {
  try {
    await api(`${API}/${deleteId}`, { method: "DELETE" });
    toast("Employee deleted");
    load();
  } catch (e) { toast(e.message, "error"); }
  $("delOverlay").classList.remove("show");
});

/* ---------- events ---------- */
$("tbody").addEventListener("click", (ev) => {
  const edit = ev.target.closest("[data-edit]");
  const del = ev.target.closest("[data-del]");
  if (edit) openForm(employees.find((e) => e.id == edit.dataset.edit));
  if (del) {
    const emp = employees.find((e) => e.id == del.dataset.del);
    deleteId = emp.id;
    $("delText").textContent = `${emp.firstName} ${emp.lastName} will be permanently removed.`;
    $("delOverlay").classList.add("show");
  }
});
$("addBtn").addEventListener("click", () => openForm(null));
$("cancelBtn").addEventListener("click", closeForm);
$("delCancel").addEventListener("click", () => $("delOverlay").classList.remove("show"));
$("logoutBtn").addEventListener("click", Auth.logout);

let timer;
$("search").addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(load, 300); });

load();
