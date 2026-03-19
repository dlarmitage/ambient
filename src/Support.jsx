import React from "react";
import { Link } from "react-router-dom";
import "./Support.css";

const Support = () => (
  <main className="support-wrapper">
    <section className="support-content">
      <nav className="support-breadcrumb">
        <Link to="/" className="support-home-link">Home</Link>
        <span className="support-separator">›</span>
        <span className="support-current">Support</span>
      </nav>

      <h1>We're Here for You</h1>

      <p className="support-intro">
        At Ambient Technology, you're never just a user — you're part of what we're building.
        Whether you have a question, an idea, a concern, or just want to say hello, we genuinely
        want to hear from you.
      </p>

      <div className="support-card">
        <div className="support-card-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <div className="support-card-body">
          <h2>Reach Out Anytime</h2>
          <p>
            Drop us a line at{" "}
            <a href="mailto:support@ambient.technology">support@ambient.technology</a>.
            We read every message personally and do our best to respond as quickly as we can —
            often the same day.
          </p>
        </div>
      </div>

      <h2>What You Can Write to Us About</h2>
      <ul className="support-list">
        <li>
          <strong>Questions</strong> — No question is too small. If something isn't clear or you're
          wondering how something works, ask away.
        </li>
        <li>
          <strong>Feedback &amp; Ideas</strong> — Your perspective shapes what we build next. Tell us what's
          working, what could be better, or what you wish existed.
        </li>
        <li>
          <strong>Bug Reports</strong> — If something isn't working the way it should, let us know.
          Every report helps us make things better for everyone.
        </li>
        <li>
          <strong>Just Saying Hi</strong> — Seriously. We love hearing from the people who use what
          we make. It means more than you know.
        </li>
      </ul>

      <div className="support-promise">
        <h2>Our Promise to You</h2>
        <p>
          We believe great software starts with genuine human connection. When you reach out, a
          real person reads your message — not a bot, not a ticket queue. We care deeply about your
          experience, and we're committed to being responsive, thoughtful, and honest in every
          interaction.
        </p>
        <p>
          Your time matters. Your voice matters. And we're grateful you've chosen to spend both
          with us.
        </p>
      </div>

      <div className="support-cta">
        <a href="mailto:support@ambient.technology" className="support-button">
          Get in Touch
        </a>
      </div>
    </section>
  </main>
);

export default Support;
