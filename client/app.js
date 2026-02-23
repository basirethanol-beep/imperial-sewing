const API_BASE = "http://localhost:3001";

let selectedTime = null;

function $(id){
  return document.getElementById(id);
}

function showMsg(msg){
  const el = $("msg");
  if(el) el.textContent = msg;
}

// ===== Time buttons =====
document.querySelectorAll(".time-slot").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".time-slot").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    selectedTime = btn.dataset.time;
  });
});

// ===== BOOK WITH PHOTO =====
async function bookWithPhoto(){

  const service = $("serviceSelect").value;
  const date = $("dateSelect").value;
  const name = $("name").value.trim();
  const email = $("email").value.trim();
  const notes = $("notes").value.trim();
  const file = $("photoInput")?.files?.[0] || null;

  if(!service || !date || !selectedTime || !name || !email){
    return showMsg("Please fill all required fields.");
  }

  $("bookBtn").disabled = true;
  $("bookBtn").textContent = "Sending...";

  try{
    const fd = new FormData();
    fd.append("service", service);
    fd.append("date", date);
    fd.append("time", selectedTime);
    fd.append("name", name);
    fd.append("email", email);
    fd.append("notes", notes);
    if(file) fd.append("photo", file);

    const r = await fetch(API_BASE + "/api/book-with-photo", {
      method: "POST",
      body: fd
    });

    const data = await r.json();

    if(!r.ok){
      $("bookBtn").disabled = false;
      $("bookBtn").textContent = "Book Appointment";
      return showMsg(data.error || "Booking failed.");
    }

    showMsg("✅ Booking received! Check your email.");
    $("bookBtn").textContent = "Booked ✓";

  }catch(e){
    $("bookBtn").disabled = false;
    $("bookBtn").textContent = "Book Appointment";
    showMsg("Server not reachable.");
  }
}

// ===== Button listener =====
document.addEventListener("DOMContentLoaded", ()=>{
  $("bookBtn")?.addEventListener("click", bookWithPhoto);
});