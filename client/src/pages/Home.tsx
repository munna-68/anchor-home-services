/**
 * Homepage — Field Manual Modernism with portfolio interactivity:
 * interactive zip check, live dispatch ticker, animated entry.
 */
import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Droplets,
  Gauge,
  MapPin,
  ShieldCheck,
  ThermometerSun,
  Wrench,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Footer, Header } from "@/components/SiteShell";
import { coveragePlaces, scheduleDates, technicians, timeSlots, validateZip } from "@/lib/anchor-data";
import { toast } from "sonner";

const services = [
  { icon: ThermometerSun, number: "01", title: "Heating + Cooling", text: "Diagnostics, repair, replacement, and maintenance for the systems that carry you through each season.", href: "/services" },
  { icon: Droplets, number: "02", title: "Plumbing", text: "Clear answers for leaks, fixtures, drains, water pressure, and the lines you do not usually see.", href: "/services" },
  { icon: CalendarCheck2, number: "03", title: "Planned Care", text: "Seasonal service that is scheduled before the rush, with a clear record of what we found.", href: "/plans" },
];

const testimonials = [
  { name: "Sarah M.", location: "Providence, RI", text: "They showed up exactly when they said they would. The technician explained everything in plain terms and left the workspace cleaner than he found it.", service: "Heating repair" },
  { name: "David K.", location: "Cranston, RI", text: "Our AC died during a heat wave. Anchor had someone out within two hours. The booking process was the most straightforward I've experienced with any home service.", service: "Emergency AC" },
  { name: "Maria L.", location: "East Providence, RI", text: "The seasonal plan is worth it alone for the priority scheduling. Spring tune-up was done before the summer rush — exactly as promised.", service: "Seasonal plan" },
  { name: "James T.", location: "Pawtucket, RI", text: "They told us upfront that our issue needed a specialist and scheduled accordingly. No wasted trip, no surprise charges. That kind of honesty is rare.", service: "Plumbing" },
];

function TestimonialCarousel() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [isPaused, next]);

  const t = testimonials[active];

  return (
    <div
      className="testimonial-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-reveal="up"
    >
      <div className="testimonial-card">
        <blockquote>
          <p>"{t.text}"</p>
          <footer>
            <strong>{t.name}</strong>
            <span>{t.location}</span>
            <em>{t.service}</em>
          </footer>
        </blockquote>
      </div>
      <div className="testimonial-nav">
        {testimonials.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`testimonial-dot ${i === active ? "is-active" : ""}`}
            aria-label={`Testimonial ${i + 1}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const [zip, setZip] = useState("");
  const [now, setNow] = useState(new Date());
  const [bookingsCount, setBookingsCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    try {
      const raw = localStorage.getItem("anchor_bookings_v2");
      if (raw) setBookingsCount(JSON.parse(raw).length);
    } catch {}
    return () => clearInterval(id);
  }, []);

  const zipResult = validateZip(zip);
  const canCheck = zip.length === 5;
  const timeLabel = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const check = () => {
    if (!validateZip(zip).isCovered) {
      toast.error(`ZIP ${zip} is outside our 15-mile corridor — try 02903`);
      return;
    }
    navigate(`/book?zip=${zip}`);
  };

  const nextOpening = useMemo(() => {
    // next opening demo: today if morning else tomorrow
    const hour = now.getHours();
    if (hour < 11) return `${scheduleDates[0].weekday} ${scheduleDates[0].date} · ${timeSlots[1]}`;
    if (hour < 15) return `${scheduleDates[0].weekday} ${scheduleDates[0].date} · ${timeSlots[3]}`;
    return `${scheduleDates[1].weekday} ${scheduleDates[1].date} · ${timeSlots[0]}`;
  }, [now]);

  return (
    <div className="site-shell">
      <Header />
      <main>
        <section className="hero-home">
          <div className="hero-home__image" role="img" aria-label="Anchor technician standing beside an organized service van" />
          <div className="hero-home__wash" />
          <div className="dispatch-rail hero-rail"><span>GREATER PROVIDENCE</span><div className="anchor-line" /></div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="hero-home__content"
          >
            <div className="availability-chip"><span className="signal-dot" />Live dispatch · Mon–Sat, 7 AM–6 PM <span className="chip-time">{timeLabel}</span></div>
            <h1>Home service,<br /><em>properly routed.</em></h1>
            <p>HVAC and plumbing support that tells you what happens next—whether you need someone fast or want a time that works around your week.</p>
            <div className="hero-actions"><Link href="/book" className="button">Book a service <ArrowUpRight size={17} /></Link><Link href="/services" className="text-link">Explore services <ArrowDownRight size={17} /></Link></div>
            <div className="hero-stats">
              <span><b>Next opening</b><small>{nextOpening}</small></span>
              <span><b data-count={technicians.length} data-count-suffix=" techs">0 techs</b><small>Technician-aware</small></span>
              <span><b data-count={15} data-count-suffix=" mi">0 mi</b><small>Service radius</small></span>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="hero-ticket"
            aria-label="Current dispatch status"
          >
            <div className="ticket-code"><span>DISPATCH / TODAY</span><span>{now.toLocaleDateString([], { month: "2-digit", day: "2-digit" })}</span></div>
            <strong>We match the job to a technician who is actually free.</strong>
            <p>Enter your ZIP to see the right next step — validated locally, no data sent.</p>

            <div className="ticket-zip">
              <MapPin size={14} aria-hidden="true" />
              <input
                id="hero-zip"
                name="postal-code"
                autoComplete="postal-code"
                aria-label="ZIP code for dispatch check"
                placeholder="ZIP — try 02903"
                inputMode="numeric"
                maxLength={5}
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                onKeyDown={(e) => e.key === "Enter" && canCheck && check()}
              />
              <button type="button" className="ticket-zip__btn" onClick={check} disabled={!canCheck}>
                Check <ArrowUpRight size={12} />
              </button>
            </div>
            {zip.length > 0 && zip.length < 5 && <small className="ticket-hint">Enter all 5 digits</small>}
            {zip.length === 5 && (
              <small className={`ticket-hint ${zipResult.isCovered ? "is-good" : "is-bad"}`}>
                {zipResult.isCovered ? "✓ In our corridor — tap Check" : "Outside corridor — try 02903, 02906"}
              </small>
            )}

            {bookingsCount > 0 && (
              <div className="ticket-bookings">
                <small>{bookingsCount} booking{bookingsCount > 1 ? "s" : ""} held on this device (demo)</small>
                <Link href="/book">View <ArrowUpRight size={12} /></Link>
              </div>
            )}
            <div className="ticket-foot">
              <Link href="/book">Check availability <ArrowUpRight size={15} /></Link>
              <span className="ticket-foot__sep">·</span>
              <a href="tel:+14015550198">(401) 555-0198</a>
            </div>
          </motion.aside>
        </section>

        <section className="proof-strip">
          <div data-reveal="up" data-delay="0"><Gauge size={19} aria-hidden="true" /><span><b>Technician-aware scheduling</b><small>Slots are tied to real capacity</small></span></div>
          <div data-reveal="up" data-delay="80"><MapPin size={19} /><span><b>Clear service-area check</b><small>We say when we cannot help</small></span></div>
          <div data-reveal="up" data-delay="160"><Clock3 size={19} /><span><b>Emergency triage</b><small>Urgent calls take a different route</small></span></div>
        </section>

        <section className="services-intro section-block">
          <div className="section-marker" data-reveal="up"><span>01 / OUR WORK</span><div /></div>
          <div className="intro-split" data-reveal="up" data-delay="60"><h2>The systems behind a good day should work quietly.</h2><div><p>When they do not, you need a calm, specific answer—not a callback queue. Anchor handles everyday service and the situations that cannot wait.</p><Link href="/services" className="text-link">See what we cover <ArrowUpRight size={16} /></Link></div></div>
          <div className="service-grid">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <Link href={service.href} className="service-card" key={service.number} data-reveal="up" data-delay={String(100 + i * 60)}>
                  <span className="service-card__number">{service.number}</span>
                  <Icon size={30} strokeWidth={1.5} />
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <span className="service-card__arrow"><ArrowUpRight size={18} /></span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="operating-section">
          <div className="operating-image" role="img" aria-label="HVAC technician testing a heat pump" />
          <div className="operating-copy" data-reveal="right">
            <span className="eyebrow">THE ANCHOR DIFFERENCE</span>
            <h2>Less phone tag.<br />More <em>certainty.</em></h2>
            <p>Every booking starts with the information that changes the outcome: the problem, the urgency, and whether you are in our service area. Then we show the capacity behind the time you choose.</p>
            <div className="operating-points">
              <div data-reveal="right" data-delay="80"><CheckCircle2 size={19} /><span><b>Clear boundaries</b><small>We validate coverage before you waste a request.</small></span></div>
              <div data-reveal="right" data-delay="160"><CheckCircle2 size={19} /><span><b>Real capacity</b><small>Each appointment is connected to a working technician.</small></span></div>
              <div data-reveal="right" data-delay="240"><CheckCircle2 size={19} /><span><b>Seasonal foresight</b><small>Members receive visits before demand is at its peak.</small></span></div>
            </div>
            <Link href="/book" className="button button--light">Find a time <ArrowUpRight size={16} /></Link>
          </div>
        </section>

        <section className="coverage-section section-block">
          <div className="coverage-graphic" data-reveal="left">
            <div className="coverage-rings" />
            <div className="coverage-pin"><MapPin size={28} fill="currentColor" /></div>
            <span>ANCHOR ROUTE / 15 MILES</span>
          </div>
          <div className="coverage-copy" data-reveal="right">
            <span className="eyebrow">SERVICE AREA</span>
            <h2>Close enough to<br /><em>keep our word.</em></h2>
            <p>We serve the core Greater Providence area, keeping drive time predictable and emergency routing honest.</p>
            <div className="place-list">{coveragePlaces.map((place) => <span key={place}>{place}</span>)}</div>
            <Link href="/services#coverage" className="text-link">Check your ZIP code <ArrowUpRight size={16} /></Link>
            <div className="today-board">
              <span className="field-label">Today's board (demo)</span>
              <div className="today-board__grid">
                {technicians.slice(0, 3).map((t) => (
                  <span key={t.id}>
                    <i className="tech-dot" style={{ background: t.color }} />
                    <b>{t.name}</b>
                    <small>{t.specialty}</small>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="plan-callout" data-reveal="up">
          <div className="plan-callout__rail"><span>SEASONAL CARE</span><div className="anchor-line" /></div>
          <div className="plan-callout__content" data-reveal="up" data-delay="60"><span className="eyebrow">KEEP THE GOOD DAYS COMING</span><h2>A visit in spring.<br />A visit in fall.<br /><em>One less thing to remember.</em></h2></div>
          <div className="plan-callout__ticket" data-reveal="up" data-delay="120"><span className="field-label">Seasonal care plan</span><strong>$19 <small>/ month</small></strong><p>Two scheduled HVAC visits and 15% off covered repairs.</p><Link href="/plans" className="button">View the plan <ArrowUpRight size={16} /></Link></div>
        </section>

        <section className="standards section-block">
          <div className="section-marker" data-reveal="up"><span>04 / HOW WE SHOW UP</span><div /></div>
          <div className="standards-grid"><div data-reveal="up" data-delay="60"><ShieldCheck size={34} aria-hidden="true" /><h3>Respect for your home</h3><p>Clean work area, clear explainers, and no hand-off until you know what changed.</p></div><div data-reveal="up" data-delay="140"><Wrench size={34} /><h3>Work you can follow</h3><p>We describe the issue in plain language and leave you with a useful service record.</p></div><div data-reveal="up" data-delay="220"><Clock3 size={34} /><h3>Time that means something</h3><p>Your selected window belongs to a technician with room in their actual day.</p></div></div>
        </section>

        <section className="testimonials-section section-block" data-reveal="up">
          <div className="section-marker"><span>05 / WHAT PEOPLE SAY</span><div /></div>
          <TestimonialCarousel />
        </section>
      </main>
      <Footer />
    </div>
  );
}
