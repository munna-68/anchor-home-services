/**
 * Field Manual Modernism — Booking flow
 * Now with client-side realism: pricing, contact details, persistent local bookings,
 * calendar export and rich confirmation. No backend, full portfolio fidelity.
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Droplets,
  MapPin,
  ShieldAlert,
  ThermometerSun,
  TriangleAlert,
  UserRoundCheck,
  Wrench,
  Banknote,
  Timer,
  Copy,
  CalendarPlus,
  Sparkles,
  Phone,
  Mail,
  Home as HomeIcon,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Footer, Header } from "@/components/SiteShell";
import {
  availableTechnicians,
  scheduleDates,
  serviceOptions,
  technicians,
  timeSlots,
  validateZip,
} from "@/lib/anchor-data";

type BookingStage = "details" | "schedule" | "confirmed";
const iconMap = {
  thermometer: ThermometerSun,
  droplet: Droplets,
  wind: ThermometerSun,
  wrench: Wrench,
  home: Wrench,
  spark: ThermometerSun,
} as const;

// Portfolio pricing / duration metadata — makes each service feel priced and bounded.
const serviceMeta: Record<
  string,
  { price: string; priceNote: string; duration: string; response: string }
> = {
  "no-heat": { price: "$179", priceNote: "Emergency dispatch", duration: "60–90 min", response: "Next lane · 90 min" },
  "no-ac": { price: "$179", priceNote: "Emergency dispatch", duration: "60–90 min", response: "Next lane · 90 min" },
  "active-leak": { price: "$149", priceNote: "Priority dispatch", duration: "45–75 min", response: "Next lane · 90 min" },
  "burst-pipe": { price: "$169", priceNote: "Priority dispatch", duration: "60–90 min", response: "Next lane · 90 min" },
  "tune-up": { price: "$149", priceNote: "or $19/mo on plan", duration: "60 min", response: "Standard slot" },
  installation: { price: "Free quote", priceNote: "On-site estimate", duration: "90 min", response: "Standard slot" },
  "plumbing-repair": { price: "$129", priceNote: "Diagnostic incl.", duration: "60 min", response: "Standard slot" },
};

type StoredBooking = {
  id: string;
  serviceId: string;
  serviceTitle: string;
  zip: string;
  street?: string;
  dateLabel: string;
  time: string;
  tech: string;
  price: string;
  createdAt: string;
};

const STORAGE_KEY = "anchor_bookings_v2";

export default function Booking() {
  const [stage, setStage] = useState<BookingStage>("details");
  const [serviceId, setServiceId] = useState("");
  const [zip, setZip] = useState("");
  const [zipChecked, setZipChecked] = useState(false);
  const [dateId, setDateId] = useState("mon");
  const [time, setTime] = useState("");
  const [techId, setTechId] = useState("");
  const [contact, setContact] = useState({ name: "", phone: "", email: "", street: "", notes: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [recent, setRecent] = useState<StoredBooking[]>([]);

  const service = serviceOptions.find((item) => item.id === serviceId);
  const meta = serviceId ? serviceMeta[serviceId] : undefined;
  const zipResult = validateZip(zip);
  const selectedDate = scheduleDates.find((date) => date.id === dateId) ?? scheduleDates[0];
  const availableForSelected = useMemo(
    () => (time ? availableTechnicians(dateId, time) : []),
    [dateId, time]
  );
  const selectedTech = technicians.find((tech) => tech.id === techId);

  // hydrate service from query (?service=tune-up) and recent bookings
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const svc = params.get("service");
    if (svc && serviceOptions.some((s) => s.id === svc)) setServiceId(svc);
    const zipParam = params.get("zip");
    if (zipParam) setZip(zipParam.replace(/\D/g, "").slice(0, 5));
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const chooseTime = (slot: string) => {
    setTime(slot);
    const firstAvailable = availableTechnicians(dateId, slot)[0];
    setTechId(firstAvailable?.id ?? "");
  };

  const validateContact = () => {
    const errs: Record<string, string> = {};
    if (!contact.name.trim() || contact.name.trim().length < 2) errs.name = "Enter your full name";
    if (!/^\d{10}$/.test(contact.phone.replace(/\D/g, ""))) errs.phone = "Enter a 10-digit phone";
    if (!/\S+@\S+\.\S+/.test(contact.email)) errs.email = "Enter a valid email";
    if (!contact.street.trim() || contact.street.trim().length < 6) errs.street = "Enter street address";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const continueFromDetails = () => {
    setZipChecked(true);
    if (!service) {
      toast.error("Choose a service to continue");
      return;
    }
    if (!zipResult.isCovered) {
      toast.error(zipResult.isFormatValid ? "Outside our current service area" : "Enter a complete 5-digit ZIP");
      return;
    }
    setStage("schedule");
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success(`${service.title} — checking ${zip} · availability ready`, { duration: 2200 });
  };

  const confirmBooking = () => {
    if (!service || !selectedTech || !time) return;
    if (!validateContact()) {
      toast.error("Complete contact details to hold this time");
      return;
    }
    const id = `ANC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const record: StoredBooking = {
      id,
      serviceId: service.id,
      serviceTitle: service.title,
      zip,
      street: contact.street,
      dateLabel: selectedDate.full,
      time,
      tech: selectedTech.name,
      price: meta?.price ?? "",
      createdAt: new Date().toISOString(),
    };
    const next = [record, ...recent].slice(0, 8);
    setRecent(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    setStage("confirmed");
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("Time held — confirmation ready");
  };

  const confirmEmergency = () => {
    if (!service) return;
    if (!validateContact()) {
      // for emergency, still require at least phone; fallback to lighter validation
      if (!contact.phone || !contact.name) {
        toast.error("Add name & phone so dispatch can confirm arrival");
        return;
      }
    }
    const id = `ANC-EM-${Date.now().toString(36).toUpperCase()}`;
    const record: StoredBooking = {
      id,
      serviceId: service.id,
      serviceTitle: service.title,
      zip,
      street: contact.street,
      dateLabel: "Today",
      time: "within 90 minutes",
      tech: "Evan Ross",
      price: "$179",
      createdAt: new Date().toISOString(),
    };
    const next = [record, ...recent].slice(0, 8);
    setRecent(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    setStage("confirmed");
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("Emergency lane reserved — we’ll call to confirm arrival");
  };

  const resetFlow = () => {
    setStage("details");
    setServiceId("");
    setZip("");
    setZipChecked(false);
    setTime("");
    setTechId("");
    setContact({ name: "", phone: "", email: "", street: "", notes: "" });
    setFieldErrors({});
    setDateId("mon");
  };

  const copyBooking = (b: StoredBooking) => {
    const text = `${b.id} — ${b.serviceTitle} · ${b.dateLabel} · ${b.time} · ${b.tech} · ${b.zip} ${b.street ? "· " + b.street : ""}`;
    navigator.clipboard.writeText(text).then(() => toast.success("Booking details copied"));
  };

  const downloadIcs = () => {
    if (!service) return;
    const title = `Anchor — ${service.title} with ${selectedTech?.name ?? "Evan Ross"}`;
    const dateStr = selectedDate.date; // Aug 24
    // crude 2026 mapping
    const monthMap: Record<string, string> = { Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12" };
    const [mon, day] = dateStr.split(" ");
    const mm = monthMap[mon] ?? "08";
    const dd = day.padStart(2, "0");
    const startHour = time.includes("PM") && !time.startsWith("12") ? String(parseInt(time) + 12) : time.slice(0,2).padStart(2,"0");
    // format as 20260824T080000
    const dt = `2026${mm}${dd}T${startHour.padStart(2,"0")}0000`;
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}\nDTSTART:${dt}\nDTEND:${dt}\nDESCRIPTION:Service ${service.title} ZIP ${zip} ${contact.street}\nLOCATION:${contact.street || zip}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${service.id}-${Date.now()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Calendar invite downloaded");
  };

  const progress = stage === "details" ? 0 : stage === "schedule" ? 1 : 2;

  return (
    <div className="site-shell">
      <Header />
      <main className="booking-page">
        {/* Head */}
        <section className="booking-head">
          <div className="dispatch-rail" aria-hidden="true">
            <span>DISPATCH DESK</span>
            <div className="anchor-line" />
          </div>
          <div className="booking-head__main">
            <span className="eyebrow">SCHEDULE A SERVICE</span>
            <h1>
              Tell us what is happening.
              <br />
              <em>We will route the rest.</em>
            </h1>
            <p className="booking-head__sub">
              We check coverage first, then show time that a real technician can actually hold.
              <span className="booking-head__meta">
                <span className="live-dot" /> Live dispatch · avg response 92 min today
              </span>
            </p>
          </div>
          <aside className="booking-head__aside">
            <span className="field-label">HOW THIS WORKS</span>
            <p>
              We check your area first, then make available time specific to the kind of help you need.
            </p>
            <div className="head-stats">
              <span>
                <b>02903–02916</b>
                <small>service corridor</small>
              </span>
              <span>
                <b>4 techs</b>
                <small>on today’s board</small>
              </span>
            </div>
            {recent.length > 0 && (
              <div className="recent-mini">
                <small>Recent holds (local demo)</small>
                <b>{recent.length} booking{recent.length > 1 ? "s" : ""} saved on this device</b>
              </div>
            )}
          </aside>
        </section>

        {/* Progress */}
        <div className="booking-progress" aria-label="Booking progress">
          <span className={progress === 0 ? "is-current" : progress > 0 ? "is-done" : ""}>
            <i>1</i>
            <span>
              <b>Job + location</b>
              <small>What & where</small>
            </span>
          </span>
          <span className={progress === 1 ? "is-current" : progress > 1 ? "is-done" : ""}>
            <i>2</i>
            <span>
              <b>Right time</b>
              <small>Capacity-aware</small>
            </span>
          </span>
          <span className={progress === 2 ? "is-current" : ""}>
            <i>3</i>
            <span>
              <b>Confirmed</b>
              <small>Held on board</small>
            </span>
          </span>
        </div>

        {/* Sticky mobile summary — shows live route without scrolling */}
        {service && stage !== "confirmed" && (
          <div className="mobile-route-bar" aria-live="polite">
            <div className="mobile-route-bar__left">
              <span className="field-label">{service.emergency ? "Emergency lane" : "Standard lane"}</span>
              <b>
                {service.title} · {zip || "—"}
              </b>
              {meta && (
                <small>
                  {meta.price} · {meta.duration} · {meta.response}
                </small>
              )}
            </div>
            <div className={`mobile-route-dot ${service.emergency ? "is-emergency" : ""}`} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {stage === "details" && (
            <motion.section
              key="details"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="booking-panel"
            >
              <div className="booking-panel__main">
                <div className="panel-heading">
                  <span className="field-label">01 / WHAT DO YOU NEED?</span>
                  <h2>Choose the closest fit.</h2>
                  <p className="panel-desc">
                    Emergency items take a priority lane — same-day, within 90 minutes. Planned work shows real open time per technician.
                  </p>
                </div>

                <div className="issue-grid">
                  {serviceOptions.map((item) => {
                    const Icon = iconMap[item.icon];
                    const active = serviceId === item.id;
                    const m = serviceMeta[item.id];
                    return (
                      <button
                        type="button"
                        className={`issue-card ${active ? "is-selected" : ""} ${item.emergency ? "issue-card--emergency" : ""}`}
                        key={item.id}
                        onClick={() => setServiceId(item.id)}
                      >
                        <span className="issue-card__icon">
                          <Icon size={20} />
                        </span>
                        <span className="issue-card__text">
                          <b>
                            {item.title} {item.emergency && <em className="emergency-pill">Emergency</em>}
                          </b>
                          <small>{item.description}</small>
                          <span className="issue-card__meta">
                            <Banknote size={12} /> {m.price}
                            <span className="dot">·</span>
                            <Timer size={12} /> {m.duration}
                          </span>
                        </span>
                        <span className={`check-ring ${active ? "is-on" : ""}`}>
                          <CheckCircle2 size={16} />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="location-block">
                  <span className="field-label booking-location-label">02 / WHERE IS THE SERVICE ADDRESS?</span>

                  <label className="booking-zip" aria-label="ZIP code">
                    <MapPin size={19} />
                    <input
                      value={zip}
                      onChange={(event) => {
                        setZip(event.target.value.replace(/\D/g, "").slice(0, 5));
                        setZipChecked(false);
                      }}
                      inputMode="numeric"
                      maxLength={5}
                      placeholder="Five-digit ZIP code"
                    />
                    <span className="zip-hint">Coverage check</span>
                  </label>

                  {/* Live inline validation before button */}
                  {zip.length > 0 && zip.length < 5 && (
                    <div className="inline-validation inline-validation--neutral">
                      <Clock3 size={16} />
                      <span>Enter all five digits — e.g. 02903, 02906</span>
                    </div>
                  )}
                  {zip.length === 5 && !zipChecked && (
                    <div className={`inline-validation ${zipResult.isCovered ? "inline-validation--good" : "inline-validation--error"}`}>
                      {zipResult.isCovered ? (
                        <>
                          <CheckCircle2 size={16} />
                          <span>
                            <b>In our corridor.</b> Tap continue — we’ll show the right availability for {zip}.
                          </span>
                        </>
                      ) : (
                        <>
                          <TriangleAlert size={16} />
                          <span>
                            <b>Outside current route.</b> We keep a tight 15-mile corridor — try a Providence ZIP to demo.
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {zipChecked && (
                    <div
                      className={`inline-validation ${zipResult.isCovered ? "inline-validation--good" : "inline-validation--error"}`}
                    >
                      {zipResult.isCovered ? (
                        <>
                          <CheckCircle2 size={16} />
                          <span>
                            <b>You are in our service area.</b> Continue to see the right availability.
                          </span>
                        </>
                      ) : (
                        <>
                          <TriangleAlert size={16} />
                          <span>
                            <b>{zipResult.isFormatValid ? "Outside our current service area." : "Enter a complete five-digit ZIP code."}</b> We cannot offer a reliable visit at that address right now.
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Street address preview — appears early to feel real, but optional until schedule */}
                  {service && zipResult.isCovered && (
                    <div className="street-preview">
                      <label>
                        <span className="field-label">
                          <HomeIcon size={12} /> Street address (confirm on next step)
                        </span>
                        <input
                          placeholder="123 Benefit St, Providence, RI"
                          value={contact.street}
                          onChange={(e) => setContact((c) => ({ ...c, street: e.target.value }))}
                        />
                      </label>
                      {fieldErrors.street && <small className="field-error">{fieldErrors.street}</small>}
                    </div>
                  )}
                </div>

                <div className="booking-cta-row">
                  <button
                    type="button"
                    className="button booking-next"
                    disabled={!serviceId || zip.length !== 5}
                    onClick={continueFromDetails}
                  >
                    Continue to availability <ArrowRight size={17} />
                  </button>
                  <span className="cta-note">
                    <ShieldAlert size={13} /> No email required until you hold a time
                  </span>
                </div>

                {recent.length > 0 && (
                  <div className="recent-strip">
                    <span className="field-label">Recent holds on this device</span>
                    <div className="recent-list">
                      {recent.slice(0, 2).map((b) => (
                        <div key={b.id} className="recent-card">
                          <b>{b.serviceTitle}</b>
                          <small>
                            {b.dateLabel} · {b.time} · {b.tech}
                          </small>
                          <small className="muted">{b.id}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <aside className="booking-panel__side">
                <span className="field-label">YOUR ROUTE</span>
                {service ? (
                  <>
                    <div className={service.emergency ? "route-status route-status--emergency" : "route-status"}>
                      {service.emergency ? <ShieldAlert size={22} /> : <CalendarDays size={22} />}
                      <span>
                        <b>{service.emergency ? "Emergency response lane" : "Standard scheduling lane"}</b>
                        <small>
                          {service.emergency
                            ? "We will prioritize the next truly available technician."
                            : "You will choose from a technician’s open time."}
                        </small>
                      </span>
                    </div>
                    {meta && (
                      <div className="price-card">
                        <div className="price-card__top">
                          <span>
                            <Banknote size={14} /> Estimate
                          </span>
                          <b>{meta.price}</b>
                        </div>
                        <small>{meta.priceNote} · Visit ~{meta.duration}</small>
                        <div className="price-card__foot">
                          <span>
                            <Timer size={12} /> {meta.response}
                          </span>
                          <span>
                            <MapPin size={12} /> ZIP {zip || "—"}
                          </span>
                        </div>
                      </div>
                    )}
                    <dl>
                      <div>
                        <dt>Service</dt>
                        <dd>{service.title}</dd>
                      </div>
                      <div>
                        <dt>ZIP</dt>
                        <dd>{zip || "—"}</dd>
                      </div>
                      <div>
                        <dt>Category</dt>
                        <dd>{service.category}</dd>
                      </div>
                    </dl>
                  </>
                ) : (
                  <p className="muted-copy">Choose a service to see how it will be routed.</p>
                )}
                <div className="help-box">
                  <b>A different kind of booking</b>
                  <p>
                    We do not offer a generic “open” calendar. The choice you see will be connected to a technician who
                    has room for the job.
                  </p>
                  <ul className="help-list">
                    <li>
                      <CheckCircle2 size={12} /> Real technician capacity
                    </li>
                    <li>
                      <CheckCircle2 size={12} /> No vague callback queue
                    </li>
                    <li>
                      <CheckCircle2 size={12} /> Confirmation holds the slot
                    </li>
                  </ul>
                </div>

                <div className="trust-mini">
                  <span>
                    <Sparkles size={12} /> 4.8/5 average for on-time arrival (demo)
                  </span>
                  <small>Established Greater Providence · Mon–Sat 7–6</small>
                </div>
              </aside>
            </motion.section>
          )}

          {stage === "schedule" && service?.emergency && (
            <motion.section
              key="emergency"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="emergency-booking"
            >
              <div className="emergency-booking__heading">
                <span className="emergency-badge">
                  <ShieldAlert size={16} />
                  EMERGENCY RESPONSE
                </span>
                <h2>
                  We are holding the
                  <br />
                  <em>next available lane.</em>
                </h2>
                <p>
                  Because you selected <b>{service.title.toLowerCase()}</b>, we are not asking you to wait for a standard
                  calendar opening. Dispatch will confirm your exact window by phone.
                </p>
                <button type="button" className="text-link" onClick={() => setStage("details")}>
                  <ArrowLeft size={16} />Change the job details
                </button>

                <div className="emergency-contact-inline">
                  <span className="field-label">Confirm contact for dispatch</span>
                  <div className="contact-grid contact-grid--compact">
                    <label>
                      <span>Name</span>
                      <input
                        placeholder="Your name"
                        value={contact.name}
                        onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                      />
                      {fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}
                    </label>
                    <label>
                      <span>Phone</span>
                      <input
                        placeholder="(401) 555-…"
                        inputMode="tel"
                        value={contact.phone}
                        onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                      />
                      {fieldErrors.phone && <small className="field-error">{fieldErrors.phone}</small>}
                    </label>
                    <label className="full">
                      <span>Street address</span>
                      <input
                        placeholder="Where should we go?"
                        value={contact.street}
                        onChange={(e) => setContact((c) => ({ ...c, street: e.target.value }))}
                      />
                    </label>
                  </div>
                  <p className="contact-note">
                    <Phone size={12} /> We call before we roll — arrival window locked before dispatch.
                  </p>
                </div>
              </div>

              <div className="emergency-arrival">
                <span className="field-label">NEXT TRUE AVAILABILITY</span>
                <div className="arrival-time">
                  <Clock3 size={34} />
                  <div>
                    <b>Today · within 90 minutes</b>
                    <small>Arrival window confirmed before dispatch</small>
                  </div>
                </div>
                <div className="arrival-tech">
                  <div className="tech-avatar" style={{ background: "#6E4D88" }}>
                    ER
                  </div>
                  <span>
                    <b>Evan Ross</b>
                    <small>Emergency response technician</small>
                  </span>
                  <span className="availability-dot">Available</span>
                </div>
                <div className="emergency-rate">
                  <span>Emergency dispatch rate</span>
                  <b>$179</b>
                  <small>Work outside this rate is explained before it begins.</small>
                </div>
                <button className="button button--danger" type="button" onClick={confirmEmergency}>
                  Reserve emergency response <ArrowRight size={16} />
                </button>
                <p className="capacity-note">
                  <CheckCircle2 size={14} /> For this demo, confirmation is held locally — no email sent.
                </p>
              </div>
            </motion.section>
          )}

          {stage === "schedule" && service && !service.emergency && (
            <motion.section
              key="scheduler"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="scheduler"
            >
              <div className="scheduler-main">
                <div className="scheduler-heading">
                  <div>
                    <span className="field-label">02 / CHOOSE A TIME</span>
                    <h2>
                      Open time, not
                      <br />
                      <em>open-ended.</em>
                    </h2>
                    <p className="panel-desc small">
                      Each window shows real free technicians. Disabled = fully assigned.
                    </p>
                  </div>
                  <button type="button" className="text-link" onClick={() => setStage("details")}>
                    <ArrowLeft size={16} />
                    Change job details
                  </button>
                </div>

                <div className="date-tabs" role="tablist" aria-label="Available appointment days">
                  {scheduleDates.map((date) => (
                    <button
                      type="button"
                      key={date.id}
                      className={date.id === dateId ? "is-active" : ""}
                      onClick={() => {
                        setDateId(date.id);
                        setTime("");
                        setTechId("");
                      }}
                    >
                      <b>{date.weekday}</b>
                      <span>{date.date}</span>
                      <small>{availableTechnicians(date.id, "8:00 AM").length} slots</small>
                    </button>
                  ))}
                </div>

                <div className="time-slot-list">
                  <span className="field-label">{selectedDate.full.toUpperCase()}</span>
                  {timeSlots.map((slot) => {
                    const free = availableTechnicians(dateId, slot);
                    const unavailable = free.length === 0;
                    return (
                      <button
                        type="button"
                        className={`time-slot ${time === slot ? "is-selected" : ""}`}
                        disabled={unavailable}
                        key={slot}
                        onClick={() => chooseTime(slot)}
                      >
                        <span>{slot}</span>
                        <small>
                          {unavailable ? "Fully assigned" : `${free.length} technician${free.length > 1 ? "s" : ""} free`}
                        </small>
                        <i />
                      </button>
                    );
                  })}
                </div>

                {time && (
                  <div className="technician-picker">
                    <span className="field-label">ASSIGN A TECHNICIAN</span>
                    <p>
                      This time works for the people shown below. Each other technician already has a job at this exact
                      window.
                    </p>
                    <div className="tech-options">
                      {availableForSelected.map((tech) => (
                        <button
                          key={tech.id}
                          className={techId === tech.id ? "is-selected" : ""}
                          type="button"
                          onClick={() => setTechId(tech.id)}
                        >
                          <div className="tech-avatar" style={{ background: tech.color }}>
                            {tech.initials}
                          </div>
                          <span>
                            <b>{tech.name}</b>
                            <small>{tech.specialty}</small>
                          </span>
                          <UserRoundCheck size={18} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {time && selectedTech && (
                  <div className="contact-section-inline">
                    <span className="field-label">03 / CONTACT & ADDRESS</span>
                    <p className="panel-desc small">We hold this exact window for {selectedTech.name}. Add contact to confirm.</p>
                    <div className="contact-grid">
                      <label>
                        <span>
                          <UserRoundCheck size={12} /> Full name
                        </span>
                        <input
                          placeholder="Jane Example"
                          value={contact.name}
                          onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                        />
                        {fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}
                      </label>
                      <label>
                        <span>
                          <Phone size={12} /> Phone
                        </span>
                        <input
                          placeholder="(401) 555-0198"
                          inputMode="tel"
                          value={contact.phone}
                          onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                        />
                        {fieldErrors.phone && <small className="field-error">{fieldErrors.phone}</small>}
                      </label>
                      <label>
                        <span>
                          <Mail size={12} /> Email
                        </span>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={contact.email}
                          onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                        />
                        {fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}
                      </label>
                      <label>
                        <span>
                          <HomeIcon size={12} /> Street address
                        </span>
                        <input
                          placeholder="123 Way, Providence, RI 02903"
                          value={contact.street}
                          onChange={(e) => setContact((c) => ({ ...c, street: e.target.value }))}
                        />
                        {fieldErrors.street && <small className="field-error">{fieldErrors.street}</small>}
                      </label>
                      <label className="full">
                        <span>
                          <MessageSquare size={12} /> Notes (optional)
                        </span>
                        <textarea
                          placeholder="Gate code, parking, pet, etc."
                          rows={2}
                          value={contact.notes}
                          onChange={(e) => setContact((c) => ({ ...c, notes: e.target.value }))}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <aside className="scheduler-side">
                <span className="field-label">BOOKING SUMMARY</span>
                {meta && (
                  <div className="price-card price-card--side">
                    <div>
                      <small>Estimate</small>
                      <b>{meta.price}</b>
                    </div>
                    <small>{meta.priceNote} · {meta.duration}</small>
                  </div>
                )}
                <dl>
                  <div>
                    <dt>Service</dt>
                    <dd>{service.title}</dd>
                  </div>
                  <div>
                    <dt>ZIP</dt>
                    <dd>{zip}</dd>
                  </div>
                  <div>
                    <dt>Arrival window</dt>
                    <dd>{time ? `${selectedDate.date} · ${time}` : "Choose a time"}</dd>
                  </div>
                  <div>
                    <dt>Technician</dt>
                    <dd>{selectedTech ? selectedTech.name : "Choose a window"}</dd>
                  </div>
                  {contact.street && (
                    <div>
                      <dt>Address</dt>
                      <dd style={{ maxWidth: 150, whiteSpace: "normal", textAlign: "right" }}>{contact.street}</dd>
                    </div>
                  )}
                </dl>
                {time && selectedTech ? (
                  <button className="button" type="button" onClick={confirmBooking}>
                    Hold this time <ArrowRight size={16} />
                  </button>
                ) : (
                  <button className="button" type="button" disabled>
                    Choose time to continue
                  </button>
                )}
                <p className="capacity-note">
                  <CheckCircle2 size={17} />
                  This window is linked to {selectedTech?.name ?? "a technician’s"} current schedule.
                </p>
                <div className="side-help">
                  <span>
                    <ShieldAlert size={12} /> What happens next?
                  </span>
                  <p>We hold the slot locally (demo). In production, you’d get an SMS + email confirmation.</p>
                </div>
              </aside>
            </motion.section>
          )}

          {stage === "confirmed" && (
            <motion.section
              key="confirmed"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="confirmation"
            >
              <div className="confirmation-mark">
                <CheckCircle2 size={42} />
              </div>
              <span className="eyebrow">TIME HELD · LOCAL DEMO</span>
              <h2>{service?.emergency ? "A response lane is reserved." : "Your appointment is on the board."}</h2>
              <p>
                {service?.emergency
                  ? "Evan will confirm your exact arrival window before leaving for the call. For this portfolio demo, the hold is stored on this device only."
                  : `${selectedTech?.name ?? "Your selected technician"} has this service window held in their schedule. For this demo, it’s stored locally — in production you’d receive an SMS + email.`}
              </p>

              <div className="confirmation-ticket">
                <div>
                  <span>JOB</span>
                  <b>{service?.title}</b>
                  <small>{meta?.price} · {meta?.duration}</small>
                </div>
                <div>
                  <span>{service?.emergency ? "ARRIVAL" : "WINDOW"}</span>
                  <b>{service?.emergency ? "Today · within 90 minutes" : `${selectedDate.full} · ${time}`}</b>
                  <small>{contact.street || `ZIP ${zip}`}</small>
                </div>
                <div>
                  <span>TECHNICIAN</span>
                  <b>{service?.emergency ? "Evan Ross" : selectedTech?.name}</b>
                  <small>{selectedTech?.specialty ?? "Emergency response"}</small>
                </div>
              </div>

              {recent[0] && (
                <div className="booking-id">
                  <span>Booking ID</span>
                  <b>{recent[0].id}</b>
                  <small>
                    {new Date(recent[0].createdAt).toLocaleString()} · {contact.name || "Guest"} · {contact.phone || "—"}
                  </small>
                </div>
              )}

              <div className="confirmation-actions">
                <button className="button button--outline" type="button" onClick={copyBooking.bind(null, recent[0])} disabled={!recent[0]}>
                  <Copy size={16} /> Copy details
                </button>
                {!service?.emergency && (
                  <button className="button button--outline" type="button" onClick={downloadIcs}>
                    <CalendarPlus size={16} /> Add to calendar
                  </button>
                )}
                <a className="button" href="tel:+14015550198">
                  Call dispatch <ArrowRight size={16} />
                </a>
              </div>
              <button type="button" className="text-link" onClick={resetFlow}>
                Book another service
              </button>

              {recent.length > 1 && (
                <div className="recent-history">
                  <span className="field-label">Earlier holds on this device</span>
                  <div className="recent-history__list">
                    {recent.slice(1, 4).map((b) => (
                      <div key={b.id} className="history-item">
                        <b>{b.serviceTitle}</b>
                        <small>
                          {b.dateLabel} · {b.time} · {b.tech}
                        </small>
                        <small className="muted">{b.id}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
