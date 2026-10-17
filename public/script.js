const bookingForm = document.getElementById("bookingForm");
const contactForm = document.getElementById("contactForm");
const toast = document.getElementById("toast");
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn.addEventListener("click", () => navMenu.classList.toggle("open"));

navMenu.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => navMenu.classList.remove("open"));
});

function showToast(message, type = "success") {
  toast.textContent = message;
  toast.style.background = type === "error" ? "#b91c1c" : "#111";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

const bookingDate = document.getElementById("bookingDate");
if (bookingDate) bookingDate.min = new Date().toISOString().split("T")[0];

bookingForm.addEventListener("submit", async event => {
  event.preventDefault();
  const submitButton = document.getElementById("bookingSubmit");
  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  const formData = new FormData(bookingForm);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Booking failed");

    showToast("Service booking submitted successfully.");
    bookingForm.reset();
    bookingDate.min = new Date().toISOString().split("T")[0];
  } catch (error) {
    console.error(error);
    showToast(error.message || "Unable to submit booking.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit Service Booking";
  }
});

contactForm.addEventListener("submit", async event => {
  event.preventDefault();

  const data = {
    name: document.getElementById("contactName").value.trim(),
    email: document.getElementById("contactEmail").value.trim(),
    phone: document.getElementById("contactPhone").value.trim(),
    message: document.getElementById("contactMessage").value.trim()
  };

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Message failed");

    showToast("Your message has been sent.");
    contactForm.reset();
  } catch (error) {
    console.error(error);
    showToast(error.message || "Unable to send message.", "error");
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
