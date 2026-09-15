import { withBase } from "@/lib/withBase";
/**
 * Plans — portfolio-grade interactivity:
 * billing toggle (monthly / annual), savings highlight,
 * local persistence, comparison table, toast feedback.
 */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { Footer, Header, PageHero } from "@/components/SiteShell";
import { plans } from "@/lib/anchor-data";

type Billing = "monthly" | "annual";

export default function Plans() {
  const [selected, setSelected] = useState("seasonal");
  const [billing, setBilling] = useState<Billing>("monthly");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const selectedPlan = useMemo(() => plans.find((p) => p.id === selected) ?? plans[0], [selected]);

  // hydrate from localStorage (demo persistence)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("anchor_plan");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.id) {
          setSelected(parsed.id);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.name) setName(parsed.name);
          // don't auto-show subscribed, let user see again
        }
      }
      const sub = localStorage.getItem("anchor_plan_subscribed");
      if (sub === "1") setSubscribed(true);
    } catch {}
  }, []);

  const subscribe = () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Enter a valid email to activate");
      return;
    }
    if (!name.trim()) {
      toast.error("Enter your name");
      return;
    }
    try {
      localStorage.setItem("anchor_plan", JSON.stringify({ id: selected, email, name, billing, at: new Date().toISOString() }));
      localStorage.setItem("anchor_plan_subscribed", "1");
    } catch {}
    setSubscribed(true);
    toast.success(`${selectedPlan.name} activated — check email (demo, stored locally)`);
  };

  const cancel = () => {
    try {
      localStorage.removeItem("anchor_plan_subscribed");
    } catch {}
    setSubscribed(false);
    toast("Plan deactivated (local demo)");
  };

  const priceFor = (plan: (typeof plans)[number]) => {
    if (billing === "monthly") return plan.price;
    // annual billing shown as monthly equivalent but with savings note: 2 months free logic
    // For demo we keep same number but show savings badge separately
    return plan.price;
  };

  const annualTotal = (plan: (typeof plans)[number]) => plan.annual;
  const savings = (plan: (typeof plans)[number]) => {
    // if annual billed vs 12* monthly, show savings if annual < monthly*12
    const monthlyTotal = plan.price * 12;
    const diff = monthlyTotal - plan.annual;
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="site-shell">
      <Header />
      <main>
        <PageHero
          eyebrow="MAINTENANCE PLANS"
          title="Care that arrives before you have to think about it."
          copy="A practical plan turns seasonal maintenance into a known date on the calendar—with member pricing you can compare against the usual one-time cost."
          image={withBase("/manus-storage/anchor-hvac-work_fd63c616.jpg")}
        >
          <div className="hero-plans-cta">
            <span>
              <Star size={14} /> 4.8/5 member satisfaction (demo)
            </span>
            <span>
              <Award size={14} /> No contract · cancel anytime
            </span>
          </div>
        </PageHero>

        <section className="plans-intro section-block">
          <div className="section-marker" data-reveal="up">
            <span>01 / MEMBERSHIP WITH A PURPOSE</span>
            <div />
          </div>
          <div className="intro-split" data-reveal="up" data-delay="60">
            <h2>
              Do the easy work
              <br />
              before it becomes <em>urgent.</em>
            </h2>
            <div>
              <p>
                Anchor plans are built around the moments systems change modes. We reserve the visit in advance, document what we see, and give members an earlier line into the schedule.
              </p>
              <div className="value-pills">
                <span>
                  <CalendarDays size={17} />
                  Auto-scheduled visits
                </span>
                <span>
                  <CircleDollarSign size={17} />
                  Member repair rates
                </span>
                <span>
                  <ShieldCheck size={17} />
                  Priority windows
                </span>
              </div>

              <div className="billing-toggle" role="tablist" aria-label="Billing frequency">
                <button
                  type="button"
                  role="tab"
                  aria-selected={billing === "monthly"}
                  aria-pressed={billing === "monthly"}
                  className={billing === "monthly" ? "is-active" : ""}
                  onClick={() => setBilling("monthly")}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={billing === "annual"}
                  aria-pressed={billing === "annual"}
                  className={billing === "annual" ? "is-active" : ""}
                  onClick={() => setBilling("annual")}
                >
                  Annual <small>Save up to $42</small>
                </button>
              </div>
              <small className="billing-note">
                <Timer size={12} /> Annual billing locks visits — you still get the same seasonal slots, just one payment.
              </small>
            </div>
          </div>
        </section>

        <section className="plan-grid">
          {plans.map((plan, i) => {
            const isSelected = selected === plan.id;
            const s = savings(plan);
            return (
              <article className={`plan-card ${plan.recommended ? "plan-card--featured" : ""} ${isSelected ? "is-selected" : ""}`} key={plan.id} data-reveal="up" data-delay={String(i * 80)}>
                {plan.recommended && <span className="recommended-label">MOST PRACTICAL</span>}
                {s > 0 && billing === "annual" && <span className="saving-badge">Save ${s} annually</span>}
                <span className="field-label">ANCHOR {plan.name.toUpperCase()}</span>
                <h2>{plan.name}</h2>
                <p>{plan.description}</p>
                <div className="price-block">
                  <b>${priceFor(plan)}</b>
                  <span>/ month</span>
                  <small>
                    ${annualTotal(plan)} billed {billing === "annual" ? "annually" : "annually if you choose annual"} · {plan.oneTime} one-time
                    {s > 0 && billing === "annual" && <em> · Save ${s}/yr</em>}
                  </small>
                </div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Check size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="plan-card__foot">
                  <button
                    type="button"
                    className={plan.recommended ? "button" : "button button--outline"}
                    onClick={() => {
                      setSelected(plan.id);
                      document.getElementById("subscribe")?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                  >
                    Choose {plan.name} <ArrowRight size={16} />
                  </button>
                  <small>
                    <Sparkles size={12} /> {plan.recommended ? "Chosen by 68% of members (demo)" : "Great for larger homes"}
                  </small>
                </div>
              </article>
            );
          })}
        </section>

        {/* Comparison micro-table */}
        <section className="plan-compare section-block">
          <h3>At a glance</h3>
          <div className="compare-table">
            <div className="compare-head">
              <span>Feature</span>
              <span>One-time visit</span>
              <span>Seasonal Care</span>
              <span>Whole Home</span>
            </div>
            {[
              { label: "HVAC visits / year", a: "1", b: "2", c: "2 + plumbing" },
              { label: "Repair discount", a: "—", b: "15% off", c: "20% off" },
              { label: "Priority windows", a: "—", b: "Yes", c: "First call" },
              { label: "Annual cost", a: "$149", b: "$228", c: "$384" },
            ].map((row) => (
              <div key={row.label} className="compare-row">
                <span>{row.label}</span>
                <span>{row.a}</span>
                <span>
                  <b>{row.b}</b>
                </span>
                <span>
                  <b>{row.c}</b>
                </span>
              </div>
            ))}
          </div>
          <p className="compare-note">
            All demo pricing — in production you’d see real invoices and itemized visit reports in email.
          </p>
        </section>

        <section className="plan-subscription" id="subscribe">
          <div className="subscription-rail">
            <span>MEMBER SETUP</span>
            <div className="anchor-line" />
          </div>
          {subscribed ? (
            <div className="subscribed-state">
              <CheckCircle2 size={38} />
              <span className="eyebrow">PLAN ACTIVATED</span>
              <h2>{selectedPlan.name} is on your schedule.</h2>
              <p>
                Your first auto-scheduled visit has been generated. You will receive a confirmation link before we arrive. <b>{name || email}</b> is on file (stored locally for this demo).
              </p>
              <div className="next-visit">
                <CalendarDays size={23} />
                <span>
                  <small>NEXT AUTO-SCHEDULED VISIT</small>
                  <b>{selectedPlan.nextVisit}</b>
                  <em>Spring cooling tune-up · Technician assigned closer to date · {billing === "annual" ? "Annual billing" : "Monthly billing"}</em>
                </span>
              </div>
              <div className="subscribed-actions">
                <button type="button" className="text-link" onClick={cancel}>
                  Deactivate (demo)
                </button>
                <button type="button" className="button button--outline" onClick={() => toast.success("Confirmation re-sent (demo)")}>
                  Resend confirmation
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="subscription-copy">
                <span className="eyebrow">START A PLAN</span>
                <h2>
                  Choose the rhythm
                  <br />
                  that fits your <em>home.</em>
                </h2>
                <p>
                  There is no vague “membership submitted” state here. Once you start, we show the first visit this plan creates. Stored locally — no email actually sent.
                </p>
                <ul className="sub-bullets">
                  <li>
                    <CheckCircle2 size={14} /> Visit appears immediately after activation
                  </li>
                  <li>
                    <CheckCircle2 size={14} /> Change plan anytime before renewal
                  </li>
                  <li>
                    <CheckCircle2 size={14} /> Cancel stored locally — no backend
                  </li>
                </ul>
              </div>
              <div className="subscription-form">
                <label htmlFor="plan-select">
                  <span className="field-label">Select plan</span>
                  <span className="select-wrap">
                    <select id="plan-select" value={selected} onChange={(event) => setSelected(event.target.value)}>
                      {plans.map((plan) => (
                        <option value={plan.id} key={plan.id}>
                          {plan.name} · ${plan.price}/month {billing === "annual" ? `(annual $${plan.annual})` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} />
                  </span>
                </label>
                <div className="billing-inline">
                  <span className="field-label">BILLING</span>
                  <div className="billing-toggle billing-toggle--small">
                    <button type="button" className={billing === "monthly" ? "is-active" : ""} onClick={() => setBilling("monthly")}>
                      Monthly
                    </button>
                    <button type="button" className={billing === "annual" ? "is-active" : ""} onClick={() => setBilling("annual")}>
                      Annual
                    </button>
                  </div>
                </div>
                <label htmlFor="plan-name">
                  <span className="field-label">Full name <span aria-hidden="true" style={{color:"var(--danger)"}}>*</span></span>
                  <input id="plan-name" autoComplete="name" placeholder="Jane Example" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label htmlFor="plan-email">
                  <span className="field-label">Email for confirmation <span aria-hidden="true" style={{color:"var(--danger)"}}>*</span></span>
                  <input id="plan-email" autoComplete="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
                </label>
                <div className="next-visit">
                  <CalendarDays size={22} />
                  <span>
                    <small>YOUR GENERATED FIRST VISIT</small>
                    <b>{selectedPlan.nextVisit}</b>
                    <em>We will confirm the service address before finalizing.</em>
                  </span>
                </div>
                <button type="button" className="button" onClick={subscribe} disabled={!email || !name}>
                  Activate {selectedPlan.name} <ArrowRight size={16} />
                </button>
                <small className="form-note">Demo only — data stays on this device. No network request.</small>
              </div>
            </>
          )}
        </section>

        <section className="faq-section section-block">
          <div>
            <span className="eyebrow">COMMON QUESTIONS</span>
            <h2>
              Plan details,
              <br />
              <em>without the runaround.</em>
            </h2>
          </div>
          <div className="faq-list">
            <details>
              <summary>
                Can I change my plan later?
                <ChevronDown size={18} />
              </summary>
              <p>Yes. You can move between plans before the next renewal; any confirmed upcoming visit is shown before the change is made.</p>
            </details>
            <details>
              <summary>
                What does “priority windows” mean?
                <ChevronDown size={18} />
              </summary>
              <p>Members see reserved scheduling capacity earlier when seasonal demand is high. It does not replace emergency triage for active leaks or loss of heat.</p>
            </details>
            <details>
              <summary>
                Is the visit date fixed?
                <ChevronDown size={18} />
              </summary>
              <p>The visit is auto-generated to start the process. We confirm address and access details before assigning the final technician and arrival window.</p>
            </details>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
