import React from "react";
import { Link } from "react-router-dom";
import "./Terms.css";

const Terms = () => (
  <main className="terms-wrapper">
    <section className="terms-content">
      <nav className="terms-breadcrumb">
        <Link to="/" className="terms-home-link">Home</Link>
        <span className="terms-separator">›</span>
        <span className="terms-current">Terms of Use</span>
      </nav>

      <h1>Terms of Use</h1>
      <p className="terms-updated">
        <strong>Effective date:</strong> March 25, 2026
      </p>

      <p className="terms-intro">
        These Terms of Use ("Terms") govern your access to and use of all applications and
        services created and operated by Ambient Technology ("we," "us," or "our"), including
        our web apps, iOS apps, and macOS apps (collectively, the "Services"). By using any of
        our Services, you agree to these Terms.
      </p>

      <div className="terms-section">
        <h2>Acceptance of Terms</h2>
        <p>
          By downloading, installing, or using any of our Services, you confirm that you have
          read, understood, and agree to be bound by these Terms and our{" "}
          <Link to="/privacy">Privacy Policy</Link>. If you do not agree, please do not use our
          Services.
        </p>
      </div>

      <div className="terms-section">
        <h2>Eligibility</h2>
        <p>
          You must be at least 13 years of age to use our Services. If you are under 18, you
          represent that a parent or legal guardian has reviewed and agreed to these Terms on
          your behalf.
        </p>
      </div>

      <div className="terms-section">
        <h2>Your Account</h2>
        <p>
          Some of our Services require you to create an account. You are responsible for
          maintaining the confidentiality of your login credentials and for all activity that
          occurs under your account. Please notify us immediately at{" "}
          <a href="mailto:support@ambient.technology">support@ambient.technology</a> if you
          suspect unauthorized access.
        </p>
      </div>

      <div className="terms-section">
        <h2>License to Use</h2>
        <p>
          We grant you a limited, non-exclusive, non-transferable, revocable license to use our
          Services for your personal, non-commercial purposes in accordance with these Terms.
          You may not copy, modify, distribute, reverse engineer, or create derivative works
          based on our Services unless expressly permitted.
        </p>
      </div>

      <div className="terms-section">
        <h2>Your Content</h2>
        <p>
          You retain full ownership of any content you create or upload through our Services.
          We do not claim any intellectual property rights over your content. By using our
          Services, you grant us only the limited rights necessary to host, store, and deliver
          your content back to you.
        </p>
      </div>

      <div className="terms-section">
        <h2>Acceptable Use</h2>
        <p>You agree not to use our Services to:</p>
        <ul>
          <li>Violate any applicable law or regulation</li>
          <li>Infringe on the rights of others, including intellectual property rights</li>
          <li>Distribute malware, spam, or other harmful content</li>
          <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
          <li>Interfere with or disrupt the integrity or performance of our Services</li>
          <li>Use our Services for any fraudulent or deceptive purpose</li>
        </ul>
      </div>

      <div className="terms-section">
        <h2>Subscriptions &amp; Payments</h2>
        <p>
          Some of our Services may offer paid subscriptions or in-app purchases. All purchases
          are processed through the applicable platform (Apple App Store or web payment
          provider). Subscription terms, pricing, and renewal details are presented at the time
          of purchase. You may manage or cancel your subscription at any time through your
          account settings or the platform through which you subscribed.
        </p>
        <p>
          Refunds are handled in accordance with the policies of the applicable platform. If you
          have questions about a charge, contact us at{" "}
          <a href="mailto:support@ambient.technology">support@ambient.technology</a> and we'll
          do our best to help.
        </p>
      </div>

      <div className="terms-section">
        <h2>Intellectual Property</h2>
        <p>
          All rights, title, and interest in our Services ... including but not limited to
          software, design, logos, and documentation ... are and remain the property of Ambient
          Technology. These Terms do not grant you any rights to use our trademarks, branding,
          or logos without prior written consent.
        </p>
      </div>

      <div className="terms-section">
        <h2>Termination</h2>
        <p>
          We may suspend or terminate your access to our Services at any time if we reasonably
          believe you have violated these Terms. You may also stop using our Services at any
          time. Upon termination, your right to use the Services ceases, but provisions that by
          their nature should survive (such as ownership, disclaimers, and limitations of
          liability) will remain in effect.
        </p>
      </div>

      <div className="terms-section">
        <h2>Disclaimers</h2>
        <p>
          Our Services are provided "as is" and "as available" without warranties of any kind,
          whether express or implied, including but not limited to implied warranties of
          merchantability, fitness for a particular purpose, and non-infringement. We do not
          guarantee that our Services will be uninterrupted, error-free, or free of harmful
          components.
        </p>
      </div>

      <div className="terms-section">
        <h2>Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, Ambient Technology shall not be
          liable for any indirect, incidental, special, consequential, or punitive damages, or
          any loss of profits, data, or goodwill, arising out of or in connection with your use
          of our Services. Our total liability for any claim arising under these Terms shall not
          exceed the amount you have paid us in the twelve months preceding the claim.
        </p>
      </div>

      <div className="terms-section">
        <h2>Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the
          United States, without regard to conflict of law principles. Any disputes arising from
          these Terms or your use of our Services shall be resolved in accordance with applicable
          law.
        </p>
      </div>

      <div className="terms-section">
        <h2>Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. When we make meaningful changes, we'll
          update the effective date at the top and, where appropriate, notify you within the
          affected app. Your continued use of our Services after changes take effect constitutes
          acceptance of the revised Terms.
        </p>
      </div>

      <div className="terms-section terms-contact">
        <h2>Questions?</h2>
        <p>
          If anything in these Terms is unclear or if you have concerns, reach out to us at{" "}
          <a href="mailto:support@ambient.technology">support@ambient.technology</a>. We're
          real people, and we're happy to talk.
        </p>
      </div>
    </section>
  </main>
);

export default Terms;
