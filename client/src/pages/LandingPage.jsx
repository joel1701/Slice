import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── LANDING PAGE ───────────────────────────────────────────────────────────────
// Public marketing page — shown to users who aren't logged in
// Converts visitors to signups
const LandingPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const heroRef = useRef(null);

  // if already logged in, skip the landing page and go straight to dashboard
  useEffect(() => {
    if (isLoggedIn) navigate('/dashboard', { replace: true });
  }, [isLoggedIn, navigate]);

  return (
    <div style={styles.page}>

      {/* ── NAVBAR ── */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.logo}>
            <img src="/favicon.svg" alt="Slice" width="28" height="28" />
            <span style={styles.logoText}>Slice</span>
          </div>
          <div style={styles.navActions}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/login')}
            >
              Sign in
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/register')}
            >
              Get started free
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={styles.hero} ref={heroRef}>
        {/* subtle background grid pattern */}
        <div style={styles.grid} aria-hidden="true" />

        <div style={styles.heroInner}>
          {/* eyebrow badge */}
          <div className="animate-fadeUp" style={styles.eyebrow}>
            <span style={styles.eyebrowDot} />
            Free forever · No credit card needed
          </div>

          <h1 className="animate-fadeUp delay-1" style={styles.heroHeading}>
            Split expenses.<br />
            <span style={styles.heroAccent}>Not friendships.</span>
          </h1>

          <p className="animate-fadeUp delay-2" style={styles.heroSub}>
            Track shared costs with roommates, travel groups, or anyone.
            Slice calculates who owes what — instantly.
          </p>

          <div className="animate-fadeUp delay-3" style={styles.heroCtas}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/register')}
              style={styles.primaryCta}
            >
              Start splitting for free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => navigate('/login')}
            >
              I have an account
            </button>
          </div>

          {/* ── MOCK APP PREVIEW ── */}
          <div className="animate-fadeUp delay-4" style={styles.mockWrap}>
            <div style={styles.mockBar}>
              <div style={styles.mockDots}>
                {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
                  <span key={i} style={{ ...styles.mockDot, background: c }} />
                ))}
              </div>
              <span style={styles.mockUrl}>slice.app/group/goa-trip</span>
            </div>
            <div style={styles.mockBody}>
              {/* mock group header */}
              <div style={styles.mockHeader}>
                <div>
                  <p style={styles.mockGroupName}>Goa Trip 🏖</p>
                  <p style={styles.mockGroupMeta}>4 members · ₹12,400 total</p>
                </div>
                <div className="badge badge-red">₹1,800 owed</div>
              </div>

              {/* mock expense list */}
              {[
                { desc: 'Hotel booking', amount: '₹6,000', who: 'Rahul paid', cat: 'Stay', catColor: '#8b5cf6', catBg: '#f5f3ff' },
                { desc: 'Beach shacks dinner', amount: '₹2,400', who: 'Priya paid', cat: 'Food', catColor: '#f59e0b', catBg: '#fffbeb' },
                { desc: 'Cab from airport', amount: '₹1,800', who: 'You paid', cat: 'Travel', catColor: '#3b82f6', catBg: '#eff6ff' },
              ].map((e, i) => (
                <div key={i} style={styles.mockExpense}>
                  <div>
                    <span style={{ ...styles.mockCat, color: e.catColor, background: e.catBg }}>
                      {e.cat}
                    </span>
                    <p style={styles.mockDesc}>{e.desc}</p>
                    <p style={styles.mockMeta}>{e.who}</p>
                  </div>
                  <p style={styles.mockAmount}>{e.amount}</p>
                </div>
              ))}

              {/* mock balance bar */}
              <div style={styles.mockBalance}>
                <div style={styles.mockBalanceText}>
                  <span>Priya owes you</span>
                  <strong style={{ color: '#10b981' }}>₹900</strong>
                </div>
                <div style={styles.mockBalanceText}>
                  <span>You owe Rahul</span>
                  <strong style={{ color: '#ef4444' }}>₹1,800</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={styles.features}>
        <div style={styles.featuresInner}>
          <p style={styles.sectionLabel}>Why Slice</p>
          <h2 style={styles.sectionTitle}>Everything you need, nothing you don't</h2>

          <div style={styles.featureGrid}>
            {[
              {
                icon: '⚡',
                title: 'Instant settlement math',
                desc: 'Our algorithm finds the minimum number of payments to settle everyone. 5 people → at most 4 payments, not 20.',
              },
              {
                icon: '👥',
                title: 'Invite by email',
                desc: 'Add anyone to a group just by their email. They sign up and instantly see the group — no invite links to manage.',
              },
              {
                icon: '🏷',
                title: 'Expense categories',
                desc: 'Tag expenses as food, travel, accommodation, and more. See exactly where the money went at a glance.',
              },
              {
                icon: '📊',
                title: 'Live balance dashboard',
                desc: 'See your net balance across all groups on one screen. Know exactly what you owe and what you\'re owed.',
              },
              {
                icon: '💱',
                title: 'Multi-currency groups',
                desc: 'Create groups in INR, USD, EUR, or GBP. Perfect for international trips and remote teams.',
              },
              {
                icon: '🔒',
                title: 'Private and secure',
                desc: 'Your data stays yours. Passwords are hashed. Groups are private. No ads, ever.',
              },
            ].map((f, i) => (
              <div key={i} style={styles.featureCard}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={styles.proof}>
        <div style={styles.proofInner}>
          {[
            { quote: "Finally stopped the awkward 'you owe me' texts with my roommates.", name: "Ananya S.", role: "Student, Bangalore" },
            { quote: "We used this for our Ladakh trip. 6 people, zero confusion.", name: "Karan M.", role: "Software engineer" },
            { quote: "Way simpler than spreadsheets. The settle-up math is genius.", name: "Riya P.", role: "Product manager" },
          ].map((t, i) => (
            <div key={i} style={styles.testimonialCard}>
              <p style={styles.testimonialQuote}>"{t.quote}"</p>
              <div style={styles.testimonialAuthor}>
                <div style={styles.testimonialAvatar}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p style={styles.testimonialName}>{t.name}</p>
                  <p style={styles.testimonialRole}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={styles.ctaBanner}>
        <h2 style={styles.ctaTitle}>Ready to stop doing math in WhatsApp?</h2>
        <p style={styles.ctaSub}>Join thousands of people who split smarter.</p>
        <button
          className="btn btn-lg"
          style={styles.ctaBtn}
          onClick={() => navigate('/register')}
        >
          Create your free account →
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.logo}>
            <img src="/favicon.svg" alt="Slice" width="32" height="32" style={{ display: 'block' }} />
            <span style={{ ...styles.logoText, fontSize: '14px' }}>Slice</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            © 2026 Slice. Built with MERN.
          </p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  page: { background: 'var(--gray-50)' },

  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(250,250,249,0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
  },
  navInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 2rem',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '-0.4px',
  },
  navActions: { display: 'flex', alignItems: 'center', gap: '10px' },

  hero: {
    position: 'relative',
    overflow: 'hidden',
    padding: '5rem 2rem 3rem',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
    opacity: 0.5,
    maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 75%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 75%)',
  },
  heroInner: {
    position: 'relative',
    maxWidth: '720px',
    margin: '0 auto',
    textAlign: 'center',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    background: 'var(--surface-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-full)',
    padding: '5px 14px',
    marginBottom: '1.75rem',
  },
  eyebrowDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'var(--accent)',
    display: 'inline-block',
    flexShrink: 0,
  },
  heroHeading: {
    fontSize: 'clamp(2.2rem, 6vw, 3.5rem)',
    fontWeight: '700',
    letterSpacing: '-1.5px',
    lineHeight: 1.1,
    color: 'var(--text-primary)',
    marginBottom: '1.25rem',
  },
  heroAccent: {
    color: 'var(--accent)',
  },
  heroSub: {
    fontSize: '1.05rem',
    color: 'var(--text-secondary)',
    maxWidth: '520px',
    margin: '0 auto 2rem',
    lineHeight: 1.7,
  },
  heroCtas: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '4rem',
  },
  primaryCta: {
    background: 'var(--accent)',
    boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
  },

  /* mock browser preview */
  mockWrap: {
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-lg)',
    textAlign: 'left',
    maxWidth: '560px',
    margin: '0 auto',
  },
  mockBar: {
    background: 'var(--gray-100)',
    borderBottom: '1px solid var(--border)',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  mockDots: { display: 'flex', gap: '6px' },
  mockDot: { width: '11px', height: '11px', borderRadius: '50%' },
  mockUrl: {
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--font-mono)',
  },
  mockBody: {
    background: '#fff',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  mockHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border)',
  },
  mockGroupName: { fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' },
  mockGroupMeta: { fontSize: '12px', color: 'var(--text-secondary)' },
  mockExpense: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '10px 0',
    borderBottom: '1px solid var(--gray-100)',
  },
  mockCat: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '20px',
    marginBottom: '3px',
  },
  mockDesc: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' },
  mockMeta: { fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' },
  mockAmount: {
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
  },
  mockBalance: {
    background: 'var(--gray-50)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  mockBalanceText: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },

  /* features */
  features: {
    padding: '5rem 2rem',
    background: '#fff',
    borderTop: '1px solid var(--border)',
  },
  featuresInner: { maxWidth: '1100px', margin: '0 auto' },
  sectionLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--accent)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    color: 'var(--text-primary)',
    marginBottom: '3rem',
    maxWidth: '480px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1px',
    background: 'var(--border)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  featureCard: {
    background: '#fff',
    padding: '1.75rem',
  },
  featureIcon: { fontSize: '1.75rem', display: 'block', marginBottom: '12px' },
  featureTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  featureDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.65,
  },

  /* testimonials */
  proof: {
    padding: '5rem 2rem',
    background: 'var(--gray-50)',
    borderTop: '1px solid var(--border)',
  },
  proofInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  testimonialCard: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
  },
  testimonialQuote: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    lineHeight: 1.7,
    marginBottom: '1rem',
    fontStyle: 'italic',
  },
  testimonialAuthor: { display: 'flex', alignItems: 'center', gap: '10px' },
  testimonialAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'var(--accent-dim)',
    color: 'var(--accent-dark)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0,
  },
  testimonialName: { fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' },
  testimonialRole: { fontSize: '12px', color: 'var(--text-secondary)' },

  /* cta */
  ctaBanner: {
    background: 'var(--gray-900)',
    padding: '5rem 2rem',
    textAlign: 'center',
    borderTop: '1px solid var(--border)',
  },
  ctaTitle: {
    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.5px',
    marginBottom: '10px',
  },
  ctaSub: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: '2rem',
  },
  ctaBtn: {
    background: 'var(--accent)',
    color: '#fff',
    boxShadow: '0 4px 24px rgba(16,185,129,0.35)',
  },

  /* footer */
  footer: {
    background: 'var(--gray-900)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: '1.5rem 2rem',
  },
  footerInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
};

export default LandingPage;