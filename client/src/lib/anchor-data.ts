/**
 * Field Manual Modernism data model: clear operational states make the demo feel accountable, not decorative.
 */

export type ServiceOption = {
  id: string;
  title: string;
  category: "HVAC" | "Plumbing";
  description: string;
  emergency: boolean;
  icon: "thermometer" | "droplet" | "wind" | "wrench" | "home" | "spark";
};

export type Technician = {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  color: string;
};

export type ScheduleJob = {
  technicianId: string;
  dateId: string;
  time: string;
  label: string;
};

export const serviceOptions: ServiceOption[] = [
  { id: "no-heat", title: "No heat", category: "HVAC", description: "System not heating or a furnace shutoff.", emergency: true, icon: "thermometer" },
  { id: "no-ac", title: "No AC", category: "HVAC", description: "Cooling has stopped during a warm spell.", emergency: true, icon: "wind" },
  { id: "active-leak", title: "Active leak", category: "Plumbing", description: "Water is currently escaping a fixture or line.", emergency: true, icon: "droplet" },
  { id: "burst-pipe", title: "Burst pipe", category: "Plumbing", description: "A pipe has ruptured or is actively flooding.", emergency: true, icon: "wrench" },
  { id: "tune-up", title: "Seasonal tune-up", category: "HVAC", description: "Keep heating or cooling ready for the next season.", emergency: false, icon: "spark" },
  { id: "installation", title: "New system quote", category: "HVAC", description: "Plan an equipment replacement or home upgrade.", emergency: false, icon: "home" },
  { id: "plumbing-repair", title: "Plumbing repair", category: "Plumbing", description: "Resolve a drip, clog, fixture issue, or pressure concern.", emergency: false, icon: "wrench" },
];

export const coverageZips = [
  "02903", "02904", "02905", "02906", "02907", "02908", "02909", "02910", "02911", "02912", "02914", "02915", "02860", "02861",
];

export const coveragePlaces = ["Providence", "East Providence", "Pawtucket", "Cranston", "Johnston", "North Providence", "Central Falls"];

export const technicians: Technician[] = [
  { id: "maria", name: "Maria Santos", initials: "MS", specialty: "Heating systems", color: "#1957C2" },
  { id: "devon", name: "Devon Park", initials: "DP", specialty: "Cooling + heat pumps", color: "#4B6750" },
  { id: "imani", name: "Imani Cole", initials: "IC", specialty: "Plumbing repairs", color: "#7C4A38" },
  { id: "evan", name: "Evan Ross", initials: "ER", specialty: "Emergency response", color: "#6E4D88" },
];

export const scheduleDates = [
  { id: "mon", weekday: "Mon", date: "Aug 24", full: "Monday, August 24" },
  { id: "tue", weekday: "Tue", date: "Aug 25", full: "Tuesday, August 25" },
  { id: "wed", weekday: "Wed", date: "Aug 26", full: "Wednesday, August 26" },
  { id: "thu", weekday: "Thu", date: "Aug 27", full: "Thursday, August 27" },
];

export const timeSlots = ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"];

export const seededJobs: ScheduleJob[] = [
  { technicianId: "maria", dateId: "mon", time: "8:00 AM", label: "No-heat call" },
  { technicianId: "maria", dateId: "mon", time: "10:00 AM", label: "Annual service" },
  { technicianId: "maria", dateId: "tue", time: "12:00 PM", label: "Boiler check" },
  { technicianId: "devon", dateId: "mon", time: "12:00 PM", label: "Heat-pump install" },
  { technicianId: "devon", dateId: "wed", time: "8:00 AM", label: "AC diagnostics" },
  { technicianId: "devon", dateId: "thu", time: "2:00 PM", label: "Member tune-up" },
  { technicianId: "imani", dateId: "mon", time: "2:00 PM", label: "Kitchen repair" },
  { technicianId: "imani", dateId: "tue", time: "8:00 AM", label: "Fixture repair" },
  { technicianId: "imani", dateId: "wed", time: "4:00 PM", label: "Drain service" },
  { technicianId: "evan", dateId: "tue", time: "10:00 AM", label: "Priority response" },
  { technicianId: "evan", dateId: "thu", time: "8:00 AM", label: "Priority response" },
];

export const plans = [
  {
    id: "seasonal",
    name: "Seasonal Care",
    price: 19,
    annual: 228,
    description: "Spring cooling + fall heating attention, scheduled before the rush.",
    oneTime: "$149 per visit",
    nextVisit: "Tue, Mar 16 · 9–11 AM",
    features: ["Two scheduled HVAC visits each year", "15% off covered repairs", "Priority booking windows", "Filter and system report"],
    recommended: true,
  },
  {
    id: "whole-home",
    name: "Whole Home",
    price: 32,
    annual: 384,
    description: "Seasonal HVAC coverage plus an annual plumbing check-in.",
    oneTime: "$347 separately",
    nextVisit: "Tue, Mar 16 · 9–11 AM",
    features: ["Seasonal HVAC visits", "Annual plumbing inspection", "20% off covered repairs", "First call priority"],
    recommended: false,
  },
];

export function validateZip(zip: string) {
  const normalized = zip.replace(/\D/g, "").slice(0, 5);
  return {
    normalized,
    isFormatValid: /^\d{5}$/.test(normalized),
    isCovered: coverageZips.includes(normalized),
  };
}

export function availableTechnicians(dateId: string, time: string) {
  return technicians.filter(
    (technician) => !seededJobs.some((job) => job.technicianId === technician.id && job.dateId === dateId && job.time === time),
  );
}

export function techJobs(technicianId: string, dateId: string) {
  return seededJobs.filter((job) => job.technicianId === technicianId && job.dateId === dateId);
}
