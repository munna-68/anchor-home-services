import { withBase } from "@/lib/withBase";
/**
 * Services — now with real-feel interactivity:
 * searchable catalog, category filtering, pricing + duration meta,
 * detail drawer and pre-filled booking links. No backend, portfolio-ready.
 */
import { useMemo, useState, useCallback } from "react";
import {
  ArrowUpRight,
  CalendarCheck2,
  CheckCircle2,
  Droplets,
  MapPin,
  ThermometerSun,
  TriangleAlert,
  Wind,
  Wrench,
  Search,
  Banknote,
  Timer,
  ShieldAlert,
  Sparkles,
  Clock3,
  Star,
} from "lucide-react";
import { Link } from "wouter";
import { Footer, Header, PageHero } from "@/components/SiteShell";
import { coveragePlaces, serviceOptions, validateZip } from "@/lib/anchor-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

const icons = {
  thermometer: ThermometerSun,
  droplet: Droplets,
  wind: Wind,
  wrench: Wrench,
  home: Wrench,
  spark: ThermometerSun,
} as const;

const serviceMeta: Record<string, { price: string; note: string; duration: string; includes: string[] }> = {
  "no-heat": { price: "$179", note: "Emergency dispatch", duration: "60–90 min", includes: ["Priority triage", "On-site safety check", "Clear next-step options"] },
  "no-ac": { price: "$179", note: "Emergency dispatch", duration: "60–90 min", includes: ["Cooling diagnostics", "System safety check", "Written findings"] },
  "active-leak": { price: "$149", note: "Priority dispatch", duration: "45–75 min", includes: ["Leak isolation", "Fixture assessment", "Water shutoff guidance"] },
  "burst-pipe": { price: "$169", note: "Priority dispatch", duration: "60–90 min", includes: ["Flood mitigation", "Pipe assessment", "Repair plan"] },
  "tune-up": { price: "$149", note: "or $19/mo on plan", duration: "60 min", includes: ["Heating + cooling check", "Filter & airflow review", "Seasonal report"] },
  installation: { price: "Free quote", note: "On-site estimate", duration: "90 min", includes: ["Load & sizing review", "Equipment options", "Honest replacement advice"] },
  "plumbing-repair": { price: "$129", note: "Diagnostic incl.", duration: "60 min", includes: ["Drip / clog / pressure check", "Fixture testing", "Repair vs replace note"] },
};

type Category = "All" | "HVAC" | "Plumbing" | "Emergency";

const recommenderData = {
  questions: [
    {
      id: "urgency",
      label: "How urgent is this?",
      options: [
        { value: "emergency", label: "It's an emergency — no heat, no water, flooding", icon: ShieldAlert },
        { value: "soon", label: "Needs attention soon — today or tomorrow", icon: Clock3 },
        { value: "planned", label: "Can be scheduled — planning ahead", icon: CalendarCheck2 },
      ],
    },
    {
      id: "type",
      label: "What system is affected?",
      options: [
        { value: "heating", label: "Heating / furnace / boiler", icon: ThermometerSun },
        { value: "cooling", label: "AC / cooling / heat pump", icon: Wind },
        { value: "plumbing", label: "Plumbing — pipes, fixtures, drains", icon: Droplets },
      ],
    },
  ] as const,
  results: {
    "emergency-heating": { title: "No heat — emergency dispatch", service: "no-heat", description: "We will route the next available emergency technician to your home within 90 minutes." },
    "emergency-cooling": { title: "No AC — emergency dispatch", service: "no-ac", description: "Emergency cooling response. A technician will arrive within 90 minutes." },
    "emergency-plumbing": { title: "Plumbing emergency — priority lane", service: "active-leak", description: "Active leak or burst pipe. We will dispatch the next available plumber immediately." },
    "soon-heating": { title: "Heating repair — priority scheduling", service: "no-heat", description: "Priority scheduling for heating issues. We will find the next available window." },
    "soon-cooling": { title: "Cooling repair — priority scheduling", service: "no-ac", description: "Priority scheduling for cooling issues. Next available technician assigned." },
    "soon-plumbing": { title: "Plumbing repair", service: "plumbing-repair", description: "Scheduled plumbing diagnostic and repair. Same-week availability." },
    "planned-heating": { title: "Seasonal tune-up — HVAC", service: "tune-up", description: "Preventive maintenance to keep your heating system ready for the season." },
    "planned-cooling": { title: "Seasonal tune-up — HVAC", service: "tune-up", description: "Preventive maintenance to keep your cooling system ready for summer." },
    "planned-plumbing": { title: "Plumbing inspection", service: "plumbing-repair", description: "Scheduled plumbing check-up and maintenance." },
  } as Record<string, { title: string; service: string; description: string }>,
};

function ServiceRecommender() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQ = recommenderData.questions[step];
  const isLast = step === recommenderData.questions.length - 1;
  const resultKey = `${answers.urgency}-${answers.type}`;
  const result = recommenderData.results[resultKey];

  const handleSelect = useCallback((value: string) => {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);

    if (isLast) {
      // Show result after a brief pause
      setTimeout(() => setStep(step + 1), 300);
    } else {
      setTimeout(() => setStep(step + 1), 300);
    }
  }, [answers, currentQ, isLast, step]);

  const reset = () => {
    setStep(0);
    setAnswers({});
  };

  return (
    <div className="recommender" data-reveal="up">
      <h3>Not sure where to start?</h3>
      <p>Answer two quick questions and we will route you to the right service.</p>

      {step < recommenderData.questions.length ? (
        <div className="recommender-step" key={currentQ.id}>
          <span className="field-label">{currentQ.label}</span>
          <div className="recommender-options">
            {currentQ.options.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`recommender-option ${answers[currentQ.id] === opt.value ? "is-selected" : ""}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <Icon size={18} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : result ? (
        <div className="recommender-result">
          <h4><CheckCircle2 size={18} /> {result.title}</h4>
          <p>{result.description}</p>
          <Link href={`/book?service=${result.service}`} className="button">
            Book now <ArrowUpRight size={16} />
          </Link>
          <br />
          <button type="button" className="text-link" onClick={reset} style={{ marginTop: 12 }}>
            Start over
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function Services() {
  const [zip, setZip] = useState("");
  const [checked, setChecked] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<Category>("All");
  const [detailId, setDetailId] = useState<string | null>(null);

  const result = validateZip(zip);
  const checkZip = () => {
    setChecked(true);
    if (result.isCovered) toast.success(`Zip ${zip} is inside our corridor`);
    else toast.error(result.isFormatValid ? "Outside our corridor — try 02903, 02906" : "Enter a 5-digit ZIP");
  };

  const filtered = useMemo(() => {
    return serviceOptions.filter((s) => {
      const matchesQuery =
        !query ||
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase());
      const matchesCat =
        activeCat === "All" ||
        (activeCat === "Emergency" ? s.emergency : s.category === activeCat);
      return matchesQuery && matchesCat;
    });
  }, [query, activeCat]);

  const hvac = filtered.filter((s) => s.category === "HVAC");
  const plumbing = filtered.filter((s) => s.category === "Plumbing");
  const detail = detailId ? serviceOptions.find((s) => s.id === detailId) : null;
  const detailMeta = detailId ? serviceMeta[detailId] : null;

  const cats: Category[] = ["All", "HVAC", "Plumbing", "Emergency"];

  return (
    <div className="site-shell">
      <Header />
      <main>
        <PageHero
          eyebrow="SERVICES + COVERAGE"
          title="Useful help starts with a clear boundary."
          copy="We handle heating, cooling, and plumbing across the core Greater Providence area—with a booking path that distinguishes urgent from planned work."
          image={withBase("/manus-storage/anchor-van-route_2a2eaf74.jpg")}
        >
          <Link href="/book" className="button">
            Book a service <ArrowUpRight size={16} />
          </Link>
          <span className="hero-sub-note">
            <Clock3 size={13} /> Avg response 90 min · <Star size={13} /> 4.8/5 on-time (demo)
          </span>
        </PageHero>

        <section className="service-catalog section-block">
          <div className="section-marker" data-reveal="up">
            <span>01 / PICK A STARTING POINT</span>
            <div />
          </div>

          <div className="catalog-heading" data-reveal="up" data-delay="60">
            <h2>
              What can we
              <br />
              <em>help with?</em>
            </h2>
            <p>
              Choose the closest description when you book. We will use it to route your request and show the right kind of availability. Prices shown are portfolio demo estimates.
            </p>
          </div>

          {/* Filter bar */}
          <div className="catalog-controls">
            <label className="search-wrap" htmlFor="service-search">
              <Search size={16} aria-hidden="true" />
              <input
                id="service-search"
                type="search"
                placeholder="Search — e.g. 'leak', 'heat', 'tune-up'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery("")} className="clear-search" type="button">
                  Clear
                </button>
              )}
            </label>
            <div className="filter-pills" role="tablist" aria-label="Service categories">
              {cats.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={activeCat === c}
                  className={activeCat === c ? "is-active" : ""}
                  onClick={() => setActiveCat(c)}
                >
                  {c}
                  <span>
                    {c === "All" ? serviceOptions.length : c === "Emergency" ? serviceOptions.filter((s) => s.emergency).length : serviceOptions.filter((s) => s.category === c).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <Search size={28} />
              <b>No matches for “{query}”</b>
              <p>Try “heat”, “leak” or clear the search to see all {serviceOptions.length} services.</p>
              <button className="button button--outline" onClick={() => { setQuery(""); setActiveCat("All"); }} type="button">
                Reset filters
              </button>
            </div>
          ) : (
            <div className="catalog-columns">
              {(activeCat === "All" ? (["HVAC", "Plumbing"] as const) : activeCat === "HVAC" ? ["HVAC"] : activeCat === "Plumbing" ? ["Plumbing"] : ["HVAC", "Plumbing"]).map((category) => {
                const items = category === "HVAC" ? hvac : plumbing;
                if (items.length === 0) return null;
                return (
                  <div className="catalog-column" key={category}>
                    <span className="field-label">
                      {category} · {items.length} services
                    </span>
                    {items.map((item) => {
                      const Icon = icons[item.icon];
                      const meta = serviceMeta[item.id];
                      return (
                        <button
                          key={item.id}
                          className="catalog-item"
                          type="button"
                          aria-label={`${item.title} — ${item.description}`}
                          onClick={() => setDetailId(item.id)}
                        >
                          <Icon size={22} />
                          <span className="catalog-item__main">
                            <b>
                              {item.title} {item.emergency && <em>Priority path</em>}
                            </b>
                            <small>{item.description}</small>
                            <span className="catalog-item__meta">
                              <Banknote size={12} /> {meta.price}
                              <span className="dot">·</span>
                              <Timer size={12} /> {meta.duration}
                            </span>
                          </span>
                          <span className="catalog-item__arrow">
                            <ArrowUpRight size={16} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              {/* When filtering Emergency across both cols, ensure both appear */}
              {activeCat === "Emergency" && filtered.length > 0 && hvac.length === 0 && plumbing.length === 0 && (
                <div className="catalog-column">
                  <span className="field-label">Priority · {filtered.length}</span>
                  {filtered.map((item) => {
                    const Icon = icons[item.icon];
                    const meta = serviceMeta[item.id];
                    return (
                      <button key={item.id} className="catalog-item" type="button" aria-label={`${item.title}`} onClick={() => setDetailId(item.id)}>
                        <Icon size={22} />
                        <span className="catalog-item__main">
                          <b>{item.title} <em>Priority path</em></b>
                          <small>{item.description}</small>
                          <span className="catalog-item__meta"><Banknote size={12} /> {meta.price} <span className="dot">·</span> <Timer size={12} /> {meta.duration}</span>
                        </span>
                        <span className="catalog-item__arrow"><ArrowUpRight size={16} /></span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="catalog-foot">
            <span>
              <Sparkles size={14} /> All items show a realistic estimate — final price confirmed on site before work begins.
            </span>
            <Link href="/book" className="text-link">
              Go to booking <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>

        <section className="section-block" style={{ paddingTop: 0 }}>
          <ServiceRecommender />
        </section>

        <section className="coverage-checker" id="coverage" data-reveal="up">
          <div className="coverage-checker__main">
            <span className="eyebrow">SERVICE-AREA CHECK</span>
            <h2>
              Before you make a plan,
              <br />
              make sure we can <em>keep it.</em>
            </h2>
            <p>
              We do not collect a lead and hope for the best. Enter your five-digit ZIP and we will tell you whether Anchor currently serves that address. Works fully on device — no data sent.
            </p>
            <label className="zip-control" htmlFor="coverage-zip">
              <span className="sr-only">Five-digit ZIP code</span>
              <MapPin size={18} aria-hidden="true" />
              <input
                id="coverage-zip"
                name="postal-code"
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={5}
                placeholder="Enter ZIP code — try 02903"
                value={zip}
                onChange={(event) => {
                  setZip(event.target.value.replace(/\D/g, "").slice(0, 5));
                  setChecked(false);
                }}
              />
              <button type="button" onClick={checkZip}>
                Check area <ArrowUpRight size={15} />
              </button>
            </label>
            {checked && (
              <div className={`coverage-result ${result.isCovered ? "coverage-result--yes" : "coverage-result--no"}`}>
                {result.isCovered ? (
                  <>
                    <CheckCircle2 aria-hidden="true" />
                    <span>
                      <b>You are in the Anchor service area.</b>
                      <small>Booking windows and emergency routing are available for your ZIP.</small>
                    </span>
                    <Link href={`/book?zip=${zip}`}>See availability <ArrowUpRight size={15} /></Link>
                  </>
                ) : (
                  <>
                    <TriangleAlert aria-hidden="true" />
                    <span>
                      <b>{result.isFormatValid ? "That ZIP is outside our current route." : "Please enter a five-digit ZIP code."}</b>
                      <small>
                        {result.isFormatValid
                          ? "We would rather be transparent than accept a request we cannot support reliably."
                          : "Use the ZIP associated with the service address."}
                      </small>
                    </span>
                  </>
                )}
              </div>
            )}
            <div className="zip-presets">
              <small>Try:</small>
              {["02903", "02906", "02908", "02909", "00000"].map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => {
                    setZip(z.slice(0, 5));
                    setChecked(false);
                    setTimeout(() => setChecked(true), 0);
                  }}
                >
                  {z === "00000" ? "Outside (00000)" : z}
                </button>
              ))}
            </div>
          </div>
          <aside className="coverage-checker__side">
            <span className="field-label">CURRENT ROUTE</span>
            <div className="route-map">
              <div className="route-map__ring route-map__ring--one" />
              <div className="route-map__ring route-map__ring--two" />
              <MapPin size={30} fill="currentColor" />
            </div>
            <b>Greater Providence</b>
            <p>{coveragePlaces.join(" · ")}</p>
            <small>Coverage changes only when the team can still honor a practical arrival window.</small>
            <div className="coverage-stats">
              <span><b>15 mi</b> radius</span>
              <span><b>7</b> towns</span>
              <span><b>14</b> ZIPs</span>
            </div>
          </aside>
        </section>

        <section className="emergency-note">
          <div>
            <span className="eyebrow">WHEN IT CANNOT WAIT</span>
            <h2>
              No heat, no AC,
              <br />
              or water moving where it should not?
            </h2>
            <div className="emergency-points">
              <span><ShieldAlert size={16} /> 90-min priority lane</span>
              <span><Clock3 size={16} /> Live dispatch 7–6 Mon–Sat</span>
              <span><Banknote size={16} /> $179 emergency rate shown upfront</span>
            </div>
          </div>
          <div>
            <p>
              Choose the emergency reason in the booking flow. We will use the next truly available response window instead of offering a standard visit that does not fit the situation.
            </p>
            <Link href="/book?service=no-heat" className="button button--danger">
              Start emergency routing <ArrowUpRight size={16} />
            </Link>
            <small className="emergency-note__small">Takes you to booking with “No heat” pre-selected.</small>
          </div>
        </section>

        {/* Detail dialog */}
        <Dialog open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
          <DialogContent className="service-detail-dialog">
            {detail && detailMeta && (
              <>
                <DialogHeader>
                  <div className="detail-badge">
                    {detail.category} {detail.emergency && <span><ShieldAlert size={12} /> Emergency lane</span>}
                  </div>
                  <DialogTitle className="detail-title">
                    {(() => {
                      const Icon = icons[detail.icon];
                      return <><Icon size={22} /> {detail.title}</>;
                    })()}
                  </DialogTitle>
                  <DialogDescription className="detail-desc">{detail.description} — {detailMeta.note} · {detailMeta.duration}.</DialogDescription>
                </DialogHeader>

                <div className="detail-price">
                  <div>
                    <small>Estimate</small>
                    <b>{detailMeta.price}</b>
                  </div>
                  <small>{detailMeta.note} · Visit ~{detailMeta.duration}</small>
                </div>

                <div className="detail-includes">
                  <span className="field-label">What’s included</span>
                  <ul>
                    {detailMeta.includes.map((inc) => (
                      <li key={inc}><CheckCircle2 size={14} /> {inc}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-actions">
                  <Link href={`/book?service=${detail.id}`} className="button" onClick={() => setDetailId(null)}>
                    Book {detail.title} <ArrowUpRight size={16} />
                  </Link>
                  <button className="button button--outline" type="button" onClick={() => { navigator.clipboard.writeText(`${detail.title} — ${detail.description} ${detailMeta.price}`); toast.success("Service details copied"); }}>
                    Copy details
                  </button>
                </div>
                <p className="detail-footnote">Price is a demo estimate — final price confirmed on site before work begins. No obligation to book.</p>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
