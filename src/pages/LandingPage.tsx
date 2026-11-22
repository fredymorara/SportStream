import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "../services/api";
import type { APIMatch } from "../services/api";
import { SPORTS, byProximity, isUpcomingOrLive, sportOf } from "../utils/eventGroups";
import FixtureList from "../components/FixtureList";
import "../landing.css";

const LandingPage: React.FC = () => {
  const [matches, setMatches] = useState<APIMatch[]>([]);
  const heroActionRef = useRef<HTMLAnchorElement>(null);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    let active = true;
    api.getAllMatches().then((data) => {
      if (active) setMatches(data.filter(isUpcomingOrLive).sort(byProximity));
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const node = heroActionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const preview = useMemo(() => matches.slice(0, 12), [matches]);
  const liveCount = matches.filter((match) => match.status === "live").length;

  return (
    <div className="landing">
      <Helmet>
        <title>SportStream: live sports fixtures by sport and kickoff</title>
        <meta
          name="description"
          content="An educational project for finding live and upcoming sports fixtures from third-party sources, grouped by sport and nearest kickoff."
        />
      </Helmet>
      <a className="skip-link" href="#top">Skip to content</a>

      <header className="l-nav">
        <div className="wrap l-wrap l-nav__inner">
          <Link to="/" className="l-mark" aria-label="SportStream home">
            <span className="l-ring" aria-hidden="true" />
            <span>sportstream</span>
          </Link>
          <nav aria-label="Sections" className="l-nav__links">
            <a href="#sports">Sports</a>
            <a href="#how-it-works">How it works</a>
            <a href="#questions">Questions</a>
          </nav>
          <Link to="/app" className="btn btn--primary">Find your match</Link>
        </div>
      </header>

      <main id="top">
        <section className="hero" data-enter>
          <div className="marble" aria-hidden="true">
            <span className="marble__wash marble__wash--a" />
            <span className="marble__wash marble__wash--b" />
            <span className="marble__wash marble__wash--c" />
            <svg className="marble__comb" viewBox="0 0 1200 400" preserveAspectRatio="none">
              <path d="M0 120 C 240 60, 420 200, 620 130 S 980 60, 1200 150" />
              <path d="M0 210 C 260 140, 480 270, 700 190 S 1000 130, 1200 220" />
              <path d="M0 300 C 220 240, 460 350, 680 280 S 1020 220, 1200 300" />
            </svg>
          </div>

          <div className="wrap l-wrap hero__copy">
            <p className="pill">Two public sources · refreshed every 60 seconds</p>
            <h1>Live sports fixtures for fans</h1>
            <p className="hero__lead">
              SportStream gathers fixtures from third-party APIs and groups them by sport, then by
              nearest kickoff. Find the match you came for and see whether a stream is on.
            </p>
            <div className="btn-row">
              <Link to="/app" className="btn btn--primary" ref={heroActionRef}>Find your match</Link>
              <a href="#how-it-works" className="btn btn--secondary">See how it works</a>
            </div>
          </div>

          <div className="wrap l-wrap app-frame" aria-label="SportStream fixture board preview">
            <div className="app-frame__bar">
              <span className="l-ring l-ring--small" aria-hidden="true" />
              <span>sportstream</span>
              <span className="app-frame__tabs">All sports · Live now · Football · Basketball</span>
            </div>
            <div className="app-frame__body">
              <div className="app-frame__tiles">
                {SPORTS.map((sport) => (
                  <div key={sport.id} className="app-frame__tile" style={{ backgroundColor: sport.field }}>
                    <span>{sport.name.toLowerCase()}</span>
                  </div>
                ))}
              </div>
              <div className="app-frame__list">
                <h2 className="sr-only">Current fixtures</h2>
                {preview.length > 0 ? (
                  <FixtureList matches={preview} onSelect={() => undefined} />
                ) : (
                  <div className="app-frame__loading">Loading fixtures…</div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="sports" className="section section--pairs">
          <div className="wrap l-wrap">
            <h2>Sports in one place</h2>
            <p className="section__lede">
              Football, basketball, baseball and everything else. Each sport opens its own board of
              current and future fixtures, ordered by the nearest start time.
            </p>
            <div className="sport-grid">
              {SPORTS.map((sport) => (
                <div key={sport.id} className="sport-card">
                  <span className="sport-card__field" style={{ backgroundColor: sport.field }} aria-hidden="true" />
                  <h3>{sport.name}</h3>
                  <p>{matches.filter((m) => sportOf(m) === sport.id).length} current fixtures</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section section--steps">
          <div className="wrap l-wrap steps-layout">
            <div className="steps-copy">
              <h2>How finding a fixture works</h2>
              <ol>
                <li><strong>Pick your sport.</strong> The board floods with that sport and nothing else.</li>
                <li><strong>Read the order.</strong> Live first, then starting soon, then today and tomorrow.</li>
                <li><strong>Check the stream.</strong> Every row says whether a feed is live or not on yet.</li>
              </ol>
            </div>
            <div className="steps-frame" aria-hidden="true">
              <div className="steps-frame__tile">football</div>
              <div className="steps-frame__row"><span>LIVE</span><span>Man City vs Man Utd</span></div>
              <div className="steps-frame__row"><span>SOON</span><span>Arsenal vs Chelsea</span></div>
              <div className="steps-frame__row"><span>LATER</span><span>Liverpool vs Everton</span></div>
            </div>
          </div>
        </section>

        <section className="section section--statement">
          <div className="wrap l-wrap">
            <h2>The facts, plainly</h2>
            <div className="figure-row">
              <div><strong>2</strong><span>public fixture sources</span></div>
              <div><strong>4</strong><span>sport boards</span></div>
              <div><strong>60</strong><span>seconds between refreshes</span></div>
            </div>
            <p className="statement-admission">
              This is an educational project. SportStream does not create, host or provide streams;
              playback uses sources returned by third-party APIs.
            </p>
          </div>
        </section>

        <section id="questions" className="section section--faq">
          <div className="wrap l-wrap">
            <h2>Questions</h2>
            <div className="faq">
              <div><h3>Does SportStream host streams?</h3><p>No. Fixtures and feeds come from public third-party APIs. Copyright belongs to the original sources.</p></div>
              <div><h3>Why are later fixtures listed without a stream?</h3><p>Some sources publish a fixture before a feed is available. The row says “stream not live yet” so you know before you open it.</p></div>
              <div><h3>Can I search for a team?</h3><p>Yes. Search matches team, competition and league names across every sport board.</p></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer closing">
        <div className="wrap l-wrap footer__close">
          <div>
            <h2>{liveCount} live right now</h2>
            <p>Open the board for your sport and find your match.</p>
          </div>
          <Link to="/app" className="btn btn--primary">Find your match</Link>
        </div>
        <div className="wrap l-wrap footer__directory">
          <div className="footer__col">
            <h3>SportStream</h3>
            <a href="#sports">Sports</a>
            <a href="#how-it-works">How it works</a>
            <a href="#questions">Questions</a>
          </div>
          <div className="footer__col">
            <h3>Legal</h3>
            <span>Educational project</span>
            <span>Third-party sources only</span>
          </div>
        </div>
        <div className="wrap l-wrap footer__legal">
          <span>© {new Date().getFullYear()} SportStream</span>
          <span>Events and streams come from third-party sources.</span>
        </div>
        <div className="wrap l-wrap footer__name" aria-hidden="true">sportstream</div>
      </footer>

      <div className={`actionbar${showBar ? " actionbar--visible" : ""}`}>
        <Link to="/app" className="btn btn--primary">Find your match</Link>
      </div>
    </div>
  );
};

export default LandingPage;
