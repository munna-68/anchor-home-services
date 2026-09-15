import { withBase } from "@/lib/withBase";
/**
 * Field Manual Modernism shell: the Anchor Line and compact operational labels give every page a coherent dispatch-desk frame.
 */
import { Anchor, ArrowUpRight, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

const navItems = [
  { href: "/services", label: "Services" },
  { href: "/book", label: "Book a service" },
  { href: "/plans", label: "Plans" },
  { href: "/about", label: "About + Contact" },
];

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`brand-mark ${light ? "brand-mark--light" : ""}`} aria-label="Anchor Home Services home">
      <img src={withBase("/manus-storage/anchor-pin-logo_696152fa.png")} alt="" className="brand-mark__icon" />
      <span className="brand-mark__words"><strong>ANCHOR</strong><small>HOME SERVICES</small></span>
    </Link>
  );
}

export function Header() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => location === href || (href !== "/" && location.startsWith(href));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const handleToggle = () => setOpen((v) => !v);
  return (
    <header className="site-header">
      <div className="site-header__inside">
        <BrandMark />
        <nav className="site-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={isActive(item.href) ? "is-active" : ""} aria-current={isActive(item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-header__actions">
          <a href="tel:+14015550198" className="phone-link"><Phone size={15} aria-hidden="true" />(401) 555-0198</a>
          <Link href="/book" className="button button--small">Schedule now <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
        <button
          className="mobile-menu-button"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={handleToggle}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <>
          <button
            aria-label="Close navigation overlay"
            className="mobile-nav__backdrop"
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, top: 72, background: "rgba(24,34,45,.08)", backdropFilter: "blur(2px)", border: "none", zIndex: 29 }}
          />
          <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={isActive(item.href) ? "is-active" : ""} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <a href="tel:+14015550198" onClick={() => setOpen(false)}><Phone size={16} /> (401) 555-0198</a>
            <Link href="/book" className="button" onClick={() => setOpen(false)}>Schedule now <ArrowUpRight size={15} /></Link>
          </nav>
        </>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <>
      <div className="logo-strip-marquee" data-marquee>
        <div className="logo-strip">
          <span>Providence Journal</span>
          <span>Rhode Island Monthly</span>
          <span>Better Business Bureau</span>
          <span>EPA Certified</span>
          <span>NATE Certified</span>
          <span>RI Licensed #HC-00198</span>
          <span>Greater Providence Chamber</span>
        </div>
      </div>
      <footer className="site-footer">
        <div className="footer-topline"><span>ANCHOR SERVICE DESK</span><i /><span>GREATER PROVIDENCE, RI</span><i /><span>MON–SAT · 7 AM–6 PM</span></div>
        <div className="footer-main">
          <div><BrandMark light /><p>HVAC and plumbing service with a clearer path from first question to the right person at your door.</p></div>
          <div className="footer-links"><span className="field-label">Explore</span><Link href="/services">Services</Link><Link href="/book">Book a service</Link><Link href="/plans">Maintenance plans</Link><Link href="/about">About + Contact</Link></div>
          <div className="footer-contact"><span className="field-label">Talk to dispatch</span><a href="tel:+14015550198">(401) 555-0198</a><a href="mailto:hello@anchorhomeservices.example">hello@anchorhomeservices.example</a><p>For active water or no heat, choose the emergency path when you book.</p></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Anchor Home Services</span><span>Built around clear scheduling.</span><Anchor size={17} aria-hidden="true" /></div>
      </footer>
    </>
  );
}

export function PageHero({ eyebrow, title, copy, image, children }: { eyebrow: string; title: string; copy: string; image?: string; children?: React.ReactNode }) {
  return (
    <section className={`page-hero ${image ? "page-hero--image" : ""}`} style={image ? { backgroundImage: `linear-gradient(90deg, rgba(239,243,247,.98) 0%, rgba(239,243,247,.92) 38%, rgba(239,243,247,.20) 76%, rgba(239,243,247,.05)), url(${image})` } : undefined}>
      <div className="dispatch-rail"><span>{eyebrow}</span><div className="anchor-line" /></div>
      <div className="page-hero__content"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p>{children}</div>
    </section>
  );
}
