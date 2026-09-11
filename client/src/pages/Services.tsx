import { withBase } from "@/lib/withBase";
/**
 * Field Manual Modernism services page: service categories and coverage validation are treated as fast, transparent routing controls.
 */
import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Droplets, MapPin, ThermometerSun, TriangleAlert, Wind, Wrench } from "lucide-react";
import { Link } from "wouter";
import { Footer, Header, PageHero } from "@/components/SiteShell";
import { coveragePlaces, serviceOptions, validateZip } from "@/lib/anchor-data";

const icons = { thermometer: ThermometerSun, droplet: Droplets, wind: Wind, wrench: Wrench, home: Wrench, spark: ThermometerSun };

export default function Services() {
  const [zip, setZip] = useState("");
  const [checked, setChecked] = useState(false);
  const result = validateZip(zip);
  const checkZip = () => setChecked(true);

  return <div className="site-shell"><Header /><main>
    <PageHero eyebrow="SERVICES + COVERAGE" title="Useful help starts with a clear boundary." copy="We handle heating, cooling, and plumbing across the core Greater Providence area—with a booking path that distinguishes urgent from planned work." image={withBase("/manus-storage/anchor-van-route_2a2eaf74.jpg")}><Link href="/book" className="button">Book a service <ArrowUpRight size={16} /></Link></PageHero>
    <section className="service-catalog section-block"><div className="section-marker"><span>01 / PICK A STARTING POINT</span><div /></div><div className="catalog-heading"><h2>What can we<br /><em>help with?</em></h2><p>Choose the closest description when you book. We will use it to route your request and show the right kind of availability.</p></div><div className="catalog-columns">{["HVAC", "Plumbing"].map((category) => <div className="catalog-column" key={category}><span className="field-label">{category}</span>{serviceOptions.filter((item) => item.category === category).map((item) => { const Icon = icons[item.icon]; return <Link href="/book" className="catalog-item" key={item.id}><Icon size={22} /><span><b>{item.title}</b><small>{item.description}</small></span>{item.emergency && <em>Priority path</em>}<ArrowUpRight size={16} /></Link>; })}</div>)}</div></section>
    <section className="coverage-checker" id="coverage"><div className="coverage-checker__main"><span className="eyebrow">SERVICE-AREA CHECK</span><h2>Before you make a plan,<br />make sure we can <em>keep it.</em></h2><p>We do not collect a lead and hope for the best. Enter your five-digit ZIP and we will tell you whether Anchor currently serves that address.</p><label className="zip-control"><span className="sr-only">Five-digit ZIP code</span><MapPin size={18} /><input inputMode="numeric" maxLength={5} placeholder="Enter ZIP code" value={zip} onChange={(event) => { setZip(event.target.value.replace(/\D/g, "")); setChecked(false); }} /><button type="button" onClick={checkZip}>Check area <ArrowUpRight size={15} /></button></label>{checked && <div className={`coverage-result ${result.isCovered ? "coverage-result--yes" : "coverage-result--no"}`}>{result.isCovered ? <><CheckCircle2 /><span><b>You are in the Anchor service area.</b><small>Booking windows and emergency routing are available for your ZIP.</small></span><Link href="/book">See availability <ArrowUpRight size={15} /></Link></> : <><TriangleAlert /><span><b>{result.isFormatValid ? "That ZIP is outside our current route." : "Please enter a five-digit ZIP code."}</b><small>{result.isFormatValid ? "We would rather be transparent than accept a request we cannot support reliably." : "Use the ZIP associated with the service address."}</small></span></>}</div>}</div><aside className="coverage-checker__side"><span className="field-label">CURRENT ROUTE</span><div className="route-map"><div className="route-map__ring route-map__ring--one" /><div className="route-map__ring route-map__ring--two" /><MapPin size={30} fill="currentColor" /></div><b>Greater Providence</b><p>{coveragePlaces.join(" · ")}</p><small>Coverage changes only when the team can still honor a practical arrival window.</small></aside></section>
    <section className="emergency-note"><div><span className="eyebrow">WHEN IT CANNOT WAIT</span><h2>No heat, no AC,<br />or water moving where it should not?</h2></div><div><p>Choose the emergency reason in the booking flow. We will use the next truly available response window instead of offering a standard visit that does not fit the situation.</p><Link href="/book" className="button button--danger">Start emergency routing <ArrowUpRight size={16} /></Link></div></section>
  </main><Footer /></div>;
}
