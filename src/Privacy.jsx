import React from "react";
import { Link } from "react-router-dom";
import "./Privacy.css";
import Seo from "./Seo";

const Privacy = () => (
  <main className="privacy-wrapper">
    <Seo
      title="Privacy Policy · Ambient Technology"
      description="How Ambient Technology collects, uses, and protects data across our apps. We never sell your data, never track you across the web, and never use your data to train AI models."
      path="/privacy"
    />
    <section className="privacy-content">
      <nav className="privacy-breadcrumb">
        <Link to="/" className="privacy-home-link">Home</Link>
        <span className="privacy-separator">›</span>
        <span className="privacy-current">Privacy Policy</span>
      </nav>

      <h1>Privacy Policy</h1>
      <p className="privacy-updated">
        <strong>Effective date:</strong> March 19, 2026
      </p>

      <p className="privacy-intro">
        Your privacy isn't a footnote ... it's foundational to everything we build. This policy
        applies to all applications and services created and operated by Ambient Technology,
        including our web apps, iOS apps, and macOS apps. We want you to understand exactly what
        we collect, why, and what we'll never do.
      </p>

      <div className="privacy-section">
        <h2>Who We Are</h2>
        <p>
          Ambient Technology builds software designed to be useful, thoughtful, and respectful
          of the people who use it. When we say "we," "us," or "our" in this policy, we mean
          Ambient Technology. When we say "you," we mean you ... the person using any of our apps
          or visiting our websites.
        </p>
      </div>

      <div className="privacy-section">
        <h2>What We Collect</h2>
        <p>
          We collect only what's necessary to make our apps work for you. Depending on the
          specific app, this may include:
        </p>
        <ul>
          <li>
            <strong>Account information</strong> ... If an app requires sign-in, we collect the
            email address you provide. We use this solely for authentication and to communicate
            with you about your account.
          </li>
          <li>
            <strong>App data</strong> ... Content you create, preferences you set, and actions you
            take within our apps. This data belongs to you and exists to power your experience.
          </li>
          <li>
            <strong>Device and usage information</strong> ... Basic technical details like device
            type, operating system version, and app version to help us fix bugs and ensure
            compatibility. We do not collect device identifiers for tracking purposes.
          </li>
        </ul>
      </div>

      <div className="privacy-section">
        <h2>What We Don't Do</h2>
        <p>This is just as important as what we do. We will never:</p>
        <ul className="privacy-commitments">
          <li>Sell, rent, or trade your personal data to anyone</li>
          <li>Use your data for advertising or ad targeting</li>
          <li>Track you across the web or across other apps</li>
          <li>Use your data to train AI or machine learning models</li>
          <li>Share your information with third-party data brokers</li>
          <li>Collect more data than we need to provide our services</li>
        </ul>
      </div>

      <div className="privacy-section">
        <h2>How We Use Your Data</h2>
        <p>Your data is used for one purpose: to deliver and improve the app you're using.</p>
        <ul>
          <li>
            <strong>To provide our services</strong> ... Storing your content, syncing across
            devices, and keeping your preferences.
          </li>
          <li>
            <strong>To improve reliability</strong> ... Understanding crash reports and
            performance issues so we can fix them.
          </li>
          <li>
            <strong>To communicate with you</strong> ... Responding to support requests or
            notifying you about important changes to our services. We don't send marketing emails.
          </li>
        </ul>
      </div>

      <div className="privacy-section">
        <h2>Third-Party Services</h2>
        <p>
          Some of our apps may use third-party services for essential functionality ... such as
          cloud hosting, authentication, or payment processing. We choose these partners
          carefully and only share the minimum data required for them to function. We do not
          use any third-party analytics, advertising, or tracking services.
        </p>
      </div>

      <div className="privacy-section">
        <h2>Data Storage &amp; Security</h2>
        <p>
          Your data is stored securely using industry-standard encryption in transit and at
          rest. We retain your data only for as long as you use our services. If you delete your
          account or request data removal, we honor that promptly and completely.
        </p>
      </div>

      <div className="privacy-section">
        <h2>Your Rights</h2>
        <p>You have full control over your data. At any time, you can:</p>
        <ul>
          <li>Request a copy of all data we hold about you</li>
          <li>Ask us to correct or update your information</li>
          <li>Request deletion of your account and all associated data</li>
          <li>Withdraw consent for any optional data processing</li>
        </ul>
        <p>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:privacy@ambient.technology">privacy@ambient.technology</a>. We'll
          respond within a few days ... no forms, no runaround.
        </p>
      </div>

      <div className="privacy-section">
        <h2>Children's Privacy</h2>
        <p>
          Our apps are not directed at children under 13, and we do not knowingly collect
          personal information from children. If you believe a child has provided us with
          personal data, please contact us and we will delete it immediately.
        </p>
      </div>

      <div className="privacy-section">
        <h2>Changes to This Policy</h2>
        <p>
          If we make meaningful changes to this policy, we'll update the effective date at the
          top and, where appropriate, notify you within the affected app. We won't quietly
          reduce your protections ... transparency matters to us.
        </p>
      </div>

      <div className="privacy-section privacy-contact">
        <h2>Questions?</h2>
        <p>
          We mean it when we say your privacy matters. If anything in this policy is unclear, or
          if you have any concerns at all, reach out to us at{" "}
          <a href="mailto:privacy@ambient.technology">privacy@ambient.technology</a>. We're
          real people, and we're happy to talk.
        </p>
      </div>
    </section>
  </main>
);

export default Privacy;
