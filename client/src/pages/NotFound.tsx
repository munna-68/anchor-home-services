import { ArrowUpRight, MapPin } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Footer, Header } from "@/components/SiteShell";

export default function NotFound() {
  return (
    <div className="site-shell">
      <Header />
      <main>
        <section className="page-hero">
          <div className="dispatch-rail"><span>ROUTE NOT FOUND</span><div className="anchor-line" /></div>
          <div className="page-hero__content">
            <span className="eyebrow">404</span>
            <h1>This page<br /><em>does not exist.</em></h1>
            <p>The route you entered is not part of our service area. It may have been moved or never existed.</p>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 16, flexWrap: "wrap" }}>
              <Link href="/" className="button">Go home <ArrowUpRight size={16} /></Link>
              <Link href="/services" className="text-link">Explore services <ArrowUpRight size={14} /></Link>
            </div>
          </div>
        </section>

        <section className="section-block" style={{ textAlign: "center" }}>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <MapPin size={28} style={{ color: "var(--cobalt)", marginBottom: 16 }} />
            <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", marginBottom: 12 }}>Looking for something specific?</h2>
            <p style={{ color: "var(--ink-muted)", fontSize: 14, marginBottom: 24 }}>
              You can use the navigation above to find services, book an appointment, or check our maintenance plans.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/book" className="button">Book a service <ArrowUpRight size={15} /></Link>
              <Link href="/plans" className="button button--outline">View plans <ArrowUpRight size={15} /></Link>
              <Link href="/about" className="button button--outline">Contact us <ArrowUpRight size={15} /></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
