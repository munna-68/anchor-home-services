/**
 * Field Manual Modernism homepage: large image fields meet a quiet dispatch rail, turning service competence into the main visual proof.
 */
import { ArrowDownRight, ArrowUpRight, CalendarCheck2, CheckCircle2, Clock3, Droplets, Gauge, MapPin, ShieldCheck, ThermometerSun, Wrench } from "lucide-react";
import { Link } from "wouter";
import { Footer, Header } from "@/components/SiteShell";
import { coveragePlaces } from "@/lib/anchor-data";

const services = [
  { icon: ThermometerSun, number: "01", title: "Heating + Cooling", text: "Diagnostics, repair, replacement, and maintenance for the systems that carry you through each season.", href: "/services" },
  { icon: Droplets, number: "02", title: "Plumbing", text: "Clear answers for leaks, fixtures, drains, water pressure, and the lines you do not usually see.", href: "/services" },
  { icon: CalendarCheck2, number: "03", title: "Planned Care", text: "Seasonal service that is scheduled before the rush, with a clear record of what we found.", href: "/plans" },
];

export default function Home() {
  return (
    <div className="site-shell">
      <Header />
      <main>
        <section className="hero-home">
          <div className="hero-home__image" role="img" aria-label="Anchor technician standing beside an organized service van" />
          <div className="hero-home__wash" />
          <div className="dispatch-rail hero-rail"><span>GREATER PROVIDENCE</span><div className="anchor-line" /></div>
          <div className="hero-home__content">
            <div className="availability-chip"><span className="signal-dot" />Live dispatch · Mon–Sat, 7 AM–6 PM</div>
            <h1>Home service,<br /><em>properly routed.</em></h1>
            <p>HVAC and plumbing support that tells you what happens next—whether you need someone fast or want a time that works around your week.</p>
            <div className="hero-actions"><Link href="/book" className="button">Book a service <ArrowUpRight size={17} /></Link><Link href="/services" className="text-link">Explore services <ArrowDownRight size={17} /></Link></div>
          </div>
          <aside className="hero-ticket" aria-label="Current dispatch status"><div className="ticket-code"><span>DISPATCH / TODAY</span><span>08.22</span></div><strong>We match the job to a technician who is actually free.</strong><p>Start with your ZIP to see the right next step.</p><Link href="/book">Check availability <ArrowUpRight size={15} /></Link></aside>
        </section>

        <section className="proof-strip"><div><Gauge size={19} /><span><b>Technician-aware scheduling</b><small>Slots are tied to real capacity</small></span></div><div><MapPin size={19} /><span><b>Clear service-area check</b><small>We say when we cannot help</small></span></div><div><Clock3 size={19} /><span><b>Emergency triage</b><small>Urgent calls take a different route</small></span></div></section>

        <section className="services-intro section-block"><div className="section-marker"><span>01 / OUR WORK</span><div /></div><div className="intro-split"><h2>The systems behind a good day should work quietly.</h2><div><p>When they do not, you need a calm, specific answer—not a callback queue. Anchor handles everyday service and the situations that cannot wait.</p><Link href="/services" className="text-link">See what we cover <ArrowUpRight size={16} /></Link></div></div><div className="service-grid">{services.map((service) => { const Icon = service.icon; return <Link href={service.href} className="service-card" key={service.number}><span className="service-card__number">{service.number}</span><Icon size={30} strokeWidth={1.5} /><h3>{service.title}</h3><p>{service.text}</p><span className="service-card__arrow"><ArrowUpRight size={18} /></span></Link>; })}</div></section>

        <section className="operating-section"><div className="operating-image" role="img" aria-label="HVAC technician testing a heat pump" /><div className="operating-copy"><span className="eyebrow">THE ANCHOR DIFFERENCE</span><h2>Less phone tag.<br />More <em>certainty.</em></h2><p>Every booking starts with the information that changes the outcome: the problem, the urgency, and whether you are in our service area. Then we show the capacity behind the time you choose.</p><div className="operating-points"><div><CheckCircle2 size={19} /><span><b>Clear boundaries</b><small>We validate coverage before you waste a request.</small></span></div><div><CheckCircle2 size={19} /><span><b>Real capacity</b><small>Each appointment is connected to a working technician.</small></span></div><div><CheckCircle2 size={19} /><span><b>Seasonal foresight</b><small>Members receive visits before demand is at its peak.</small></span></div></div><Link href="/book" className="button button--light">Find a time <ArrowUpRight size={16} /></Link></div></section>

        <section className="coverage-section section-block"><div className="coverage-graphic"><div className="coverage-rings" /><div className="coverage-pin"><MapPin size={28} fill="currentColor" /></div><span>ANCHOR ROUTE / 15 MILES</span></div><div className="coverage-copy"><span className="eyebrow">SERVICE AREA</span><h2>Close enough to<br /><em>keep our word.</em></h2><p>We serve the core Greater Providence area, keeping drive time predictable and emergency routing honest.</p><div className="place-list">{coveragePlaces.map((place) => <span key={place}>{place}</span>)}</div><Link href="/services#coverage" className="text-link">Check your ZIP code <ArrowUpRight size={16} /></Link></div></section>

        <section className="plan-callout"><div className="plan-callout__rail"><span>SEASONAL CARE</span><div className="anchor-line" /></div><div className="plan-callout__content"><span className="eyebrow">KEEP THE GOOD DAYS COMING</span><h2>A visit in spring.<br />A visit in fall.<br /><em>One less thing to remember.</em></h2></div><div className="plan-callout__ticket"><span className="field-label">Seasonal care plan</span><strong>$19 <small>/ month</small></strong><p>Two scheduled HVAC visits and 15% off covered repairs.</p><Link href="/plans" className="button">View the plan <ArrowUpRight size={16} /></Link></div></section>

        <section className="standards section-block"><div className="section-marker"><span>04 / HOW WE SHOW UP</span><div /></div><div className="standards-grid"><div><ShieldCheck size={34} /><h3>Respect for your home</h3><p>Clean work area, clear explainers, and no hand-off until you know what changed.</p></div><div><Wrench size={34} /><h3>Work you can follow</h3><p>We describe the issue in plain language and leave you with a useful service record.</p></div><div><Clock3 size={34} /><h3>Time that means something</h3><p>Your selected window belongs to a technician with room in their actual day.</p></div></div></section>
      </main>
      <Footer />
    </div>
  );
}
