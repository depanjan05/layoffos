export default function Home() {
  return (
    <main className="site-shell">
      <nav className="nav">
        <div className="brand">
          <span className="brand-mark">L</span>
          <span>LayoffOS</span>
        </div>

        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#tools">Tools</a>
          <a href="#about">About</a>
        </div>

        <button className="nav-button">Get started</button>
      </nav>

<section className="hero">
  <div className="hero-left">
    <p className="eyebrow">
      <span className="status-dot" />
      A practical recovery system for your next move
    </p>

    <h1>
      You got laid off.
      <br />
      Here&apos;s what to do next.
    </h1>
  </div>

  <div className="hero-right">
    <p className="hero-copy">
      LayoffOS helps you organize the chaos after a layoff — from financial
      runway and job applications to networking and your next opportunity.
    </p>

    <div className="hero-actions">
      <a href="/start" className="primary-button">
        Start my recovery <span>→</span>
      </a>

      <a href="#tools" className="secondary-button">
        Explore the tools
      </a>
    </div>

    <p className="no-signup">
      Free to use · No credit card required
    </p>
  </div>
</section>
      <section className="stats">
        <div>
          <strong>01</strong>
          <span>Get your situation organized</span>
        </div>
        <div>
          <strong>02</strong>
          <span>Build your job-search system</span>
        </div>
        <div>
          <strong>03</strong>
          <span>Track your path back to work</span>
        </div>
      </section>

      <section className="tools-section" id="tools">
        <div className="section-heading">
          <div>
            <p className="section-label">YOUR RECOVERY TOOLKIT</p>
            <h2>Everything in one place.</h2>
          </div>
          <p>
            No more scattered spreadsheets, bookmarks and random advice.
            Build a system around your actual situation.
          </p>
        </div>

        <div className="tool-grid">
          <article className="tool-card featured">
            <div className="tool-icon">↗</div>
            <p className="card-number">01</p>
            <h3>Financial Runway</h3>
            <p>
              Understand how long your current resources can support you and
              what your minimum monthly income needs to be.
            </p>
            <span className="coming">Coming first</span>
          </article>

          <article className="tool-card">
            <div className="tool-icon">✓</div>
            <p className="card-number">02</p>
            <h3>72-Hour Checklist</h3>
            <p>
              A practical checklist for the first few days after losing your
              job.
            </p>
          </article>

          <article className="tool-card">
            <div className="tool-icon">◎</div>
            <p className="card-number">03</p>
            <h3>Job Search Tracker</h3>
            <p>
              Track applications, interviews, referrals, follow-ups and
              offers without another spreadsheet.
            </p>
          </article>

          <article className="tool-card">
            <div className="tool-icon">↗</div>
            <p className="card-number">04</p>
            <h3>Networking</h3>
            <p>
              Find the people worth contacting and turn your existing network
              into real conversations.
            </p>
          </article>

          <article className="tool-card">
            <div className="tool-icon">⌁</div>
            <p className="card-number">05</p>
            <h3>Target Companies</h3>
            <p>
              Build a focused list of companies that match your experience,
              goals and location.
            </p>
          </article>

          <article className="tool-card">
            <div className="tool-icon">↗</div>
            <p className="card-number">06</p>
            <h3>Recovery Dashboard</h3>
            <p>
              See your applications, conversations, interviews and progress
              in one place.
            </p>
          </article>
        </div>
      </section>

      <section className="cta" id="how-it-works">
        <p className="section-label">THE IDEA</p>
        <h2>
          Getting laid off is an event.
          <br />
          Getting back on your feet is a process.
        </h2>
        <p>
          LayoffOS is being built to make that process less chaotic and more
          actionable.
        </p>
        <button className="primary-button">
          Start my recovery <span>→</span>
        </button>
      </section>

      <footer id="about">
        <div className="brand">
          <span className="brand-mark">L</span>
          <span>LayoffOS</span>
        </div>
        <p>Built for the next move.</p>
      </footer>
    </main>
  );
}
