const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");
const bookingsTable = document.getElementById("bookingsTable");
const messagesContainer = document.getElementById("messagesContainer");
const adminToast = document.getElementById("adminToast");

let token = localStorage.getItem("shriAdminToken");

function showToast(message) {
  adminToast.textContent = message;
  adminToast.classList.add("show");
  setTimeout(() => adminToast.classList.remove("show"), 3000);
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";
  loginMessage.textContent = "";

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Login failed");

    token = result.token;
    localStorage.setItem("shriAdminToken", token);
    showDashboard();
  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Login";
  }
});

function showDashboard() {
  loginSection.style.display = "none";
  dashboardSection.style.display = "block";
  loadDashboard();
}

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("shriAdminToken");
  token = null;
  dashboardSection.style.display = "none";
  loginSection.style.display = "grid";
});

document.getElementById("refreshButton").addEventListener("click", loadDashboard);

async function apiRequest(url, options = {}) {
  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`
  };

  const response = await fetch(url, options);

  if (response.status === 401) {
    localStorage.removeItem("shriAdminToken");
    token = null;
    dashboardSection.style.display = "none";
    loginSection.style.display = "grid";
    throw new Error("Your session has expired.");
  }

  return response;
}

async function loadDashboard() {
  try {
    const [bookingsResponse, contactsResponse] = await Promise.all([
      apiRequest("/api/bookings"),
      apiRequest("/api/contact")
    ]);

    const bookingsData = await bookingsResponse.json();
    const contactsData = await contactsResponse.json();

    if (!bookingsResponse.ok) throw new Error(bookingsData.message);

    renderStats(bookingsData.bookings);
    renderBookings(bookingsData.bookings);
    renderMessages(contactsData.contacts || []);
  } catch (error) {
    console.error(error);
    showToast(error.message || "Unable to load dashboard");
  }
}

function renderStats(bookings) {
  document.getElementById("totalBookings").textContent = bookings.length;
  document.getElementById("pendingBookings").textContent = bookings.filter(b => b.status === "Pending").length;
  document.getElementById("confirmedBookings").textContent = bookings.filter(b => b.status === "Confirmed").length;
  document.getElementById("completedBookings").textContent = bookings.filter(b => b.status === "Completed").length;
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderBookings(bookings) {
  if (!bookings.length) {
    bookingsTable.innerHTML = `<tr><td colspan="6">No bookings found.</td></tr>`;
    return;
  }

  bookingsTable.innerHTML = bookings.map(booking => {
    const statusClass = booking.status.toLowerCase();

    return `
      <tr>
        <td>
          <strong>${escapeHtml(booking.customerName)}</strong><br>
          ${escapeHtml(booking.phone)}
          ${booking.email ? `<br>${escapeHtml(booking.email)}` : ""}
        </td>
        <td>${escapeHtml(booking.vehicleType)}<br><strong>${escapeHtml(booking.vehicleModel)}</strong></td>
        <td>${escapeHtml(booking.service)}</td>
        <td>${escapeHtml(booking.bookingDate)}<br>${escapeHtml(booking.bookingTime)}</td>
        <td><span class="status status-${statusClass}">${escapeHtml(booking.status)}</span></td>
        <td>
          <div class="actions">
            <button class="action-btn confirm-btn" onclick="updateStatus('${booking._id}','Confirmed')">Confirm</button>
            <button class="action-btn complete-btn" onclick="updateStatus('${booking._id}','Completed')">Complete</button>
            <button class="action-btn reject-btn" onclick="updateStatus('${booking._id}','Rejected')">Reject</button>
            <button class="action-btn delete-btn" onclick="deleteBooking('${booking._id}')">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

async function updateStatus(id, status) {
  try {
    const response = await apiRequest(`/api/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    showToast(`Booking marked as ${status}`);
    loadDashboard();
  } catch (error) {
    showToast(error.message);
  }
}

async function deleteBooking(id) {
  if (!confirm("Delete this booking permanently?")) return;

  try {
    const response = await apiRequest(`/api/bookings/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    showToast("Booking deleted.");
    loadDashboard();
  } catch (error) {
    showToast(error.message);
  }
}

function renderMessages(messages) {
  if (!messages.length) {
    messagesContainer.innerHTML = "<p>No contact messages.</p>";
    return;
  }

  messagesContainer.innerHTML = messages.map(message => {
    const date = new Date(message.createdAt).toLocaleString();

    return `
      <div class="message-card">
        <h3>${escapeHtml(message.name)}</h3>
        <div class="message-meta">
          ${escapeHtml(message.email)}
          ${message.phone ? ` · ${escapeHtml(message.phone)}` : ""}
          <br>${date}
        </div>
        <p>${escapeHtml(message.message)}</p>
        <div class="message-actions">
          <button class="action-btn delete-btn" onclick="deleteMessage('${message._id}')">Delete</button>
        </div>
      </div>`;
  }).join("");
}

async function deleteMessage(id) {
  if (!confirm("Delete this contact message?")) return;

  try {
    const response = await apiRequest(`/api/contact/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    showToast("Message deleted.");
    loadDashboard();
  } catch (error) {
    showToast(error.message);
  }
}

if (token) showDashboard();
