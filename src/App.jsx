import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import ContactModal from "./ContactModal";

const App = () => {
  const [contactOpen, setContactOpen] = useState(false);

  const openContact = (e) => {
    e.preventDefault();
    setContactOpen(true);
  };

  useEffect(() => {
    const nav = document.getElementById("nav");
    const onScroll = () => {
      if (!nav) return;
      nav.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <div className="ambient-landing">
      <nav id="nav">
        <div className="brand">
          ambient<span className="dot">.</span>technology
        </div>
        <div className="nav-links">
          <a href="#story" className="hide-mobile">Story</a>
          <Link to="/projects">Projects</Link>
          <a href="#contact" onClick={openContact}>Contact</a>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-eyebrow">Est. 2022 · Fort Collins, Colorado</div>
          <h1 className="hero-title">
            Technology at its best <em>fades into the background</em> and quietly makes something better.
          </h1>
          <p className="hero-sub">
            Ambient is a small studio building software that's useful, honest, and ... whenever possible ... quiet. A forty-year pattern of noticing when tools recede, continued with the tools of this moment.
          </p>
          <div className="hero-meta">
            <span>№ 001 ... Landing</span>
            <div className="scroll-cue">
              <span>Scroll</span>
              <div className="line"></div>
            </div>
            <span>Dave Armitage, founder</span>
          </div>
        </section>

        <section id="story" className="vertigo">
          <div className="section-label reveal">A note on the name</div>
          <p className="vertigo-intro reveal">
            In 1996, I sold my first software company ... <em>GeoGraphix</em>, one of the first 2D and eventually 3D geographic information systems. By the time Halliburton acquired us, we held over 90% market share. The product represented something like 150 person-years of engineering.
          </p>

          <div className="compare">
            <div className="compare-col then reveal">
              <div className="compare-label">Then · 1996</div>
              <div className="compare-big">150</div>
              <div className="compare-unit">person-years of engineering</div>
              <div className="compare-detail">Rooms full of brilliant people. Months to get anything working. Years to reach an MVP.</div>
            </div>
            <div className="compare-divider reveal">→</div>
            <div className="compare-col now reveal">
              <div className="compare-label">Now · 2026</div>
              <div className="compare-big">6</div>
              <div className="compare-unit">weeks, one developer</div>
              <div className="compare-detail">With today's AI-assisted tools, I'm confident the entire GeoGraphix codebase could be rebuilt ... and surpassed ... by one person in six weeks.</div>
            </div>
          </div>

          <p className="vertigo-outro reveal">
            That is not a boast. It's vertigo. It's the thing I can't stop thinking about.
          </p>
        </section>

        <section>
          <div className="timeline-intro reveal">
            <div className="section-label">Four companies, one instinct</div>
            <h2>After GeoGraphix, I kept chasing a particular kind of idea ... the kind where the technology is quietly present, doing useful work, without demanding your attention.</h2>
          </div>

          <div className="timeline">
            <div className="tl-entry reveal">
              <div className="tl-year">1984 ... 1996</div>
              <div className="tl-body">
                <h3 className="tl-name">GeoGraphix</h3>
                <p className="tl-thesis">The first company. One of the first 2D and eventually 3D geographic information systems.</p>
                <p className="tl-story">
                  Built over roughly a decade for the oil and gas industry. Acquired by Halliburton in 1996. Still operating today, nearly three decades later ... which is either a compliment to the team that built it or an indictment of how long software lives. Probably both.
                </p>
                <div className="tl-outcome">
                  <span>Market position<strong>90%+ share</strong></span>
                  <span>Outcome<strong>Acquired by Halliburton</strong></span>
                  <span>Status<strong>Still operating</strong></span>
                </div>
              </div>
            </div>

            <div className="tl-entry reveal">
              <div className="tl-year">1996 ... 2001</div>
              <div className="tl-body">
                <h3 className="tl-name">Qubit</h3>
                <p className="tl-thesis">A wireless internet tablet, a decade before the iPad was a thing.</p>
                <p className="tl-story">
                  I believed we'd one day have computers in our homes that were always on, always connected, required no expertise, and put the internet in our hands in a form factor the size of a book. We patented around fifteen of the inventions needed to make it real. In 2001 we won <em>Product of the Year at CES</em>. Then the dot-com bust arrived, and Qubit didn't survive it. The idea, of course, did.
                </p>
                <div className="tl-outcome">
                  <span>Recognition<strong>CES Product of the Year, 2001</strong></span>
                  <span>Patents<strong>~15 foundational inventions</strong></span>
                  <span>Outcome<strong>Did not survive dot-com bust</strong></span>
                </div>
              </div>
            </div>

            <div className="tl-entry reveal">
              <div className="tl-year">2002 ... 2017</div>
              <div className="tl-body">
                <h3 className="tl-name">Cartasite</h3>
                <p className="tl-thesis">Real-time wireless data merged with GPS. Eventually, a way to predict crashes before they happened.</p>
                <p className="tl-story">
                  In 2007 a customer with 5,000 vehicles asked a harder question: could we predict which drivers were most likely to crash, <em>before</em> they crashed? Working with the City and County of Denver, we proved that accelerometers, gyros, and a good algorithm could read the subtle signatures of risk. The result was ROVR ... a small device that plugged into a vehicle's OBD port. The mayor of Denver showcased it at the 2008 DNC. By the time we were acquired by GeoForce in 2017, we'd deployed in 31 countries.
                </p>
                <div className="tl-outcome">
                  <span>Countries deployed<strong>31</strong></span>
                  <span>Crash reduction<strong>Over 60% in O&amp;G</strong></span>
                  <span>Outcome<strong>Acquired by GeoForce, 2017</strong></span>
                </div>
              </div>
            </div>

            <div className="tl-entry reveal">
              <div className="tl-year">2017 ... 2020</div>
              <div className="tl-body">
                <h3 className="tl-name">Project Canary</h3>
                <p className="tl-thesis">Real-time fugitive gas emissions monitoring, disguised as bluebird houses.</p>
                <p className="tl-story">
                  Methane is a brutal greenhouse gas, and natural gas wells leak it. The insight that made Canary possible was small but decisive: methane is hard to detect at ground level because it's lighter than air ... but the volatile organic compounds that travel with it are heavier than air, and settle where sensors can find them. We built solar-powered monitoring devices ... disguised, with some affection, as bluebird houses ... that sampled the air every few minutes. Within months of launch we were monitoring wells representing more than 10% of U.S. natural gas production. I retired from Canary in 2020. It's still operating.
                </p>
                <div className="tl-outcome">
                  <span>Coverage at launch<strong>10%+ of U.S. natural gas</strong></span>
                  <span>Form factor<strong>Solar-powered bluebird houses</strong></span>
                  <span>Status<strong>Still operating</strong></span>
                </div>
              </div>
            </div>
          </div>

          <p className="tl-pattern reveal">
            Four companies. One recurring instinct: technology is at its best when it fades into the background and <span className="accent">quietly makes something better.</span>
          </p>
        </section>

        <section className="changed">
          <div className="changed-inner">
            <div className="section-label reveal">What changed</div>
            <h2 className="reveal">Shortly after ChatGPT arrived in November 2022, I started <em>Ambient Technology</em>.</h2>
            <p className="lead reveal">
              I've lived through enough technology cycles to be skeptical of hype, and I've been wrong about plenty of them. But this one is different in a way that's hard to overstate.
            </p>
            <p className="reveal">
              Watching a single person, in an afternoon, build something that would have taken my GeoGraphix team a quarter ... that's not an incremental shift. That's a change in what's possible for any one of us to attempt.
            </p>

            <blockquote className="pull reveal">
              The cost of <em>trying</em> has collapsed.
            </blockquote>

            <p className="reveal">
              Ideas that were too small to justify a team are now worth building. Ideas that were too ambitious for a solo developer are now within reach. The filter on what gets made has moved from <em>"can we afford to build this?"</em> to <em>"is this worth making?"</em>
            </p>
            <p className="reveal">
              That's a better question. I'd like to spend the rest of my working life answering it.
            </p>
          </div>
        </section>

        <section className="mission">
          <div className="section-label reveal" style={{ justifyContent: "center" }}>What Ambient is</div>
          <h2 className="reveal">A small studio building software that's <em>useful, honest, and quiet.</em></h2>
          <p className="reveal">
            Some of what we make is for sale. Some is free. Some exists because it should exist and I had an afternoon. The through-line is simple.
          </p>
          <div className="test reveal">
            <div className="test-label">The test, in full</div>
            Does it make someone's day a little better, or the world a little better, without asking for too much in return?
          </div>
        </section>

        <section className="projects">
          <div className="projects-head reveal">
            <h2>What we're building, right now.</h2>
            <Link to="/projects" className="projects-link">See all projects →</Link>
          </div>

          <div className="project-grid">
            <a className="project reveal" href="#">
              <div className="project-num">№ 001</div>
              <h3 className="project-name">CourseMagic</h3>
              <p className="project-desc">A Notion-native, AI-assisted course creation platform. Turn an outline and a voice into a finished course without leaving the tool you already think in.</p>
              <div className="project-meta">
                <span>Web · AI · Notion</span>
                <span className="project-arrow">→</span>
              </div>
            </a>

            <a className="project reveal" href="#">
              <div className="project-num">№ 002</div>
              <h3 className="project-name">TerraTales</h3>
              <p className="project-desc">A map-based storytelling app for iOS. Vintage cartographic aesthetics, modern AI voices ... place-based stories that find you when you're near them.</p>
              <div className="project-meta">
                <span>iOS · Mapbox · AI</span>
                <span className="project-arrow">→</span>
              </div>
            </a>

            <a className="project reveal" href="#">
              <div className="project-num">№ 003</div>
              <h3 className="project-name">RecipeWorks</h3>
              <p className="project-desc">An AI-assisted recipe organizer for iOS. Import from anywhere, cook from anywhere, finally stop losing recipes to screenshots.</p>
              <div className="project-meta">
                <span>iOS · Capacitor · AI</span>
                <span className="project-arrow">→</span>
              </div>
            </a>

            <a className="project reveal" href="#">
              <div className="project-num">№ 004</div>
              <h3 className="project-name">Care for the Kid</h3>
              <p className="project-desc">An online mental health course for children navigating divorce. Built with care, because some software should exist whether or not it makes money.</p>
              <div className="project-meta">
                <span>Web · Course · Nonprofit-adjacent</span>
                <span className="project-arrow">→</span>
              </div>
            </a>
          </div>

          <p className="projects-more reveal">
            …and so much more in the works. <Link to="/projects">See everything we're building →</Link>
          </p>
        </section>
      </main>

      <footer id="contact">
        <div className="footer-grid">
          <div className="footer-msg">
            The most transformative technologies of my lifetime have been the ones that <em>disappeared into everyday life</em>. That's the standard we're working toward.
          </div>
          <div className="footer-contact">
            <div className="footer-contact-label">Say hello</div>
            <a href="#contact" onClick={openContact}>hello@ambient.technology</a>
          </div>
        </div>
        <div className="footer-base">
          <span>© {new Date().getFullYear()} Ambient Technology</span>
          <span>Fort Collins, Colorado</span>
          <div className="footer-legal">
            <Link to="/privacy">Privacy</Link>
            <span className="footer-dot">·</span>
            <Link to="/support">Support</Link>
            <span className="footer-dot">·</span>
            <Link to="/terms">Terms</Link>
          </div>
          <span>Built quietly.</span>
        </div>
      </footer>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
};

export default App;
