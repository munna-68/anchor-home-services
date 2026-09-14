import { withBase } from "@/lib/withBase";
/**
 * About + Contact — now with local persistence, topic routing, and dispatch context.
 * No backend, but feels operational.
 */
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, Mail, MapPin, Phone, Send, Wrench, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Footer, Header, PageHero } from "@/components/SiteShell";

type Msg = { id: string; name: string; email: string; topic: string; text: string; at: string };

export default function About() {
  const [sent, setSent] = useState<Msg | null>(null);
  const [form, setForm] = useState({ name: "", email: "", topic: "General question", text: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recent, setRecent] = useState<Msg[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("anchor_messages");
      if (raw) setRecent(JSON.parse(raw));
      const last = localStorage.getItem("anchor_last_msg");
      if (last) setSent(JSON.parse(last));
    } catch {}
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Enter your name";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.text.trim() || form.text.trim().length < 10) e.text = "Add a bit more detail (10+ chars)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Fix the highlighted fields");
      return;
    }
    const msg: Msg = {
      id: `MSG-${Date.now().toString(36).toUpperCase()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      topic: form.topic,
      text: form.text.trim(),
      at: new Date().toISOString(),
    };
    const next = [msg, ...recent].slice(0, 6);
    setRecent(next);
    setSent(msg);
    try {
      localStorage.setItem("anchor_messages", JSON.stringify(next));
      localStorage.setItem("anchor_last_msg", JSON.stringify(msg));
    } catch {}
    toast.success("Message marked for dispatch — stored locally (demo)");
  };

  const reset = () => {
    setSent(null);
    setForm({ name: "", email: "", topic: "General question", text: "", phone: "" });
    setErrors({});
  };

  return (
    <div className="site-shell">
      <Header />
      <main>
        <PageHero
          eyebrow="ABOUT + CONTACT"
          title="A smaller route. A more accountable kind of service."
          copy="Anchor is built for homeowners who value a well-run operation: clear information, practical time windows, and people who respect the systems behind a comfortable home."
          image={withBase("/manus-storage/anchor-plumbing-work_f2e1dbd9.jpg")}
        >
          <div className="hero-plans-cta">
            <span><Wrench size={14} /> Field-based, not call-center</span>
            <span><ShieldAlert size={14} /> Emergencies triaged separately</span>
          </div>
        </PageHero>

        <section className="about-intro section-block">
          <div className="section-marker"><span>01 / WHY ANCHOR EXISTS</span><div /></div>
          <div className="about-statement">
            <h2>Good home service should not require a leap of faith.</h2>
            <div>
              <p>
                Most calls begin with uncertainty: Is this urgent? Is the company actually nearby? Will the arrival window mean anything? Anchor is a portfolio demonstration of a different answer—one that makes the operational truth visible before a homeowner commits.
              </p>
              <p>
                The result is calmer for everyone: the visitor gets an honest route, and the field team gets the right job, in the right place, with time to do it well.
              </p>
              {recent.length > 0 && <p className="about-recent-note">{recent.length} note{recent.length > 1 ? "s" : ""} saved on this device (demo) — they persist until you clear storage.</p>}
            </div>
          </div>
        </section>

        <section className="standards-detail">
          <div className="standards-detail__visual"><div className="detail-line" /><span>THE ANCHOR STANDARD</span></div>
          <div className="standards-detail__copy">
            <div><b>01</b><span><h3>Say what happens next</h3><p>Every interaction should lead to a known next action, not a dead-end request form.</p></span></div>
            <div><b>02</b><span><h3>Be precise about capacity</h3><p>An appointment is not “available” unless a specific technician can hold it.</p></span></div>
            <div><b>03</b><span><h3>Use urgency responsibly</h3><p>Emergencies receive a different route and an upfront rate note—not the same generic calendar.</p></span></div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-info">
            <span className="eyebrow">TALK TO DISPATCH</span>
            <h2>Start with the<br /><em>right channel.</em></h2>
            <p>
              For active water, loss of heat, or a true urgent event, use emergency booking so that request is triaged correctly. For general questions, call or send a concise note — it’s stored locally for this demo.
            </p>
            <div className="contact-methods">
              <a href="tel:+14015550198"><Phone size={19} aria-hidden="true" /><span><small>CALL</small><b>(401) 555-0198</b></span></a>
              <a href="mailto:hello@anchorhomeservices.example"><Mail size={19} aria-hidden="true" /><span><small>EMAIL</small><b>hello@anchorhomeservices.example</b></span></a>
              <span><MapPin size={19} aria-hidden="true" /><span><small>ROUTE</small><b>Greater Providence, RI</b></span></span>
              <span><Clock3 size={19} aria-hidden="true" /><span><small>HOURS</small><b>Mon–Sat · 7 AM–6 PM</b></span></span>
            </div>

            {recent.length > 0 && (
              <div className="recent-messages">
                <span className="field-label">Recent notes on this device</span>
                {recent.slice(0, 3).map((m) => (
                  <div key={m.id} className="msg-card">
                    <b>{m.topic} · {m.name}</b>
                    <small>{new Date(m.at).toLocaleString()} · {m.id}</small>
                    <p>{m.text.slice(0, 90)}{m.text.length > 90 ? "…" : ""}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="contact-form">
            {sent ? (
              <div className="contact-sent">
                <CheckCircle2 size={38} />
                <h3>Message marked for dispatch.</h3>
                <p>
                  <b>{sent.topic}</b> from <b>{sent.name}</b> is saved locally as <code>{sent.id}</code>. In production it would enter the same queue as bookings.
                </p>
                <div className="msg-preview">
                  <small>{new Date(sent.at).toLocaleString()}</small>
                  <p>“{sent.text}”</p>
                </div>
                <div className="sent-actions">
                  <button className="text-link" type="button" onClick={reset}>Send another note <ArrowRight size={16} /></button>
                  <button className="button button--outline" type="button" onClick={() => { navigator.clipboard.writeText(`${sent.id} — ${sent.topic}: ${sent.text}`); toast.success("Message copied"); }}>Copy details</button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <span className="field-label">GENERAL QUESTION</span>
                <h3>Leave a clear note.</h3>

                <label htmlFor="about-topic">
                  Topic
                  <select id="about-topic" value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}>
                    <option>General question</option>
                    <option>Quote for new system</option>
                    <option>Follow-up on visit</option>
                    <option>Billing / plan question</option>
                  </select>
                </label>

                <div className="form-row">
                  <label htmlFor="about-name">
                    Name {errors.name && <small className="field-error" role="alert">{errors.name}</small>}
                    <input id="about-name" autoComplete="name" placeholder="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  </label>
                  <label htmlFor="about-phone">
                    Phone (optional)
                    <input id="about-phone" autoComplete="tel" placeholder="(401) 555-…" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  </label>
                </div>

                <label htmlFor="about-email">
                  Email {errors.email && <small className="field-error" role="alert">{errors.email}</small>}
                  <input id="about-email" autoComplete="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </label>

                <label htmlFor="about-text">
                  What can we help with? {errors.text && <small className="field-error" role="alert">{errors.text}</small>}
                  <textarea id="about-text" placeholder="A short description is enough. Include ZIP or address if relevant." rows={4} value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} />
                </label>

                <button className="button" type="submit">Send to dispatch <Send size={16} /></button>
                <small className="form-note">Demo only — message stays on this device, no network request.</small>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
