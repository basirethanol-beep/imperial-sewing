export const CONFIG = {
  businessName: "Imperial Sewing",
  currency: "cad",
  depositAmountCents: 3000,

  // We will show ONLY 4 fixed appointments per day
  fixedDailySlots: ["11:00", "12:30", "14:00", "15:30"], // 4 bookings/day
  fixedSlotMinutes: 90, // each appointment block is 90 minutes

  // Open Monday–Friday only, 11 AM to 5 PM (no Saturday, no Sunday)
  hours: {
    1: { start: "11:00", end: "17:00" }, // Mon
    2: { start: "11:00", end: "17:00" }, // Tue
    3: { start: "11:00", end: "17:00" }, // Wed
    4: { start: "11:00", end: "17:00" }, // Thu
    5: { start: "11:00", end: "17:00" }  // Fri
  },

  services: [
    { id: "wedding-consult", name: "Wedding Dress Consultation", minutes: 60 },
    { id: "prom-fitting", name: "Prom Dress Fitting / Alterations", minutes: 45 },
    { id: "hemming-pants", name: "Hemming (Pants/Jeans)", minutes: 30 },
    { id: "hemming-dress", name: "Hemming (Dress/Skirt)", minutes: 45 },
    { id: "zipper", name: "Zipper Replacement", minutes: 45 },
    { id: "patches", name: "Patches / Repairs", minutes: 30 },
    { id: "leather", name: "Leather Repair / Alteration", minutes: 60 },
    { id: "holes", name: "Fix Holes / Re-stitching", minutes: 30 }
  ]
};
