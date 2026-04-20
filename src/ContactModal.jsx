import React, { useEffect, useRef, useState } from "react";
import "./ContactModal.css";

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

const loadTurnstile = () => {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (document.querySelector(`script[src="${TURNSTILE_SRC}"]`)) {
    return new Promise((resolve) => {
      const check = () => (window.turnstile ? resolve(window.turnstile) : setTimeout(check, 50));
      check();
    });
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = TURNSTILE_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(window.turnstile);
    s.onerror = () => reject(new Error("Failed to load Turnstile."));
    document.head.appendChild(s);
  });
};

const ContactModal = ({ open, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [siteKey, setSiteKey] = useState(null);
  const widgetRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setSiteKey(d.turnstileSiteKey))
      .catch(() => setSiteKey(null));
  }, [open]);

  useEffect(() => {
    if (!open || !siteKey || !widgetRef.current) return;
    let cancelled = false;
    loadTurnstile()
      .then((ts) => {
        if (cancelled || !widgetRef.current) return;
        widgetIdRef.current = ts.render(widgetRef.current, {
          sitekey: siteKey,
          callback: (t) => setToken(t),
          "error-callback": () => setToken(""),
          "expired-callback": () => setToken(""),
          theme: "light",
        });
      })
      .catch(() => setErrorMsg("Couldn't load the verification widget. Try refreshing."));

    return () => {
      cancelled = true;
      if (window.turnstile && widgetIdRef.current !== null) {
        try { window.turnstile.remove(widgetIdRef.current); } catch (_) {}
        widgetIdRef.current = null;
      }
    };
  }, [open, siteKey]);

  useEffect(() => {
    if (!open) {
      setName(""); setEmail(""); setMessage("");
      setToken(""); setStatus("idle"); setErrorMsg("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const disabled = status === "submitting" || !token || !name.trim() || !email.trim() || !message.trim();

  const submit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, turnstileToken: token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong.");
        if (window.turnstile && widgetIdRef.current !== null) {
          try { window.turnstile.reset(widgetIdRef.current); } catch (_) {}
        }
        setToken("");
        return;
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <div className="contact-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Contact Ambient Technology">
      <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
        <button className="contact-close" onClick={onClose} aria-label="Close">×</button>

        {status === "success" ? (
          <div className="contact-success">
            <div className="contact-eyebrow">Sent</div>
            <h2>Thank you.</h2>
            <p>Your message is on its way to hello@ambient.technology. We'll reply from that address.</p>
            <button type="button" className="contact-submit" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={submit} noValidate>
            <div className="contact-eyebrow">Say hello</div>
            <h2>Send a note.</h2>
            <p className="contact-lede">
              Goes straight to <span className="contact-mail">hello@ambient.technology</span>. We read every message.
            </p>

            <label>
              <span>Your name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={200}
                required
                autoComplete="name"
              />
            </label>

            <label>
              <span>Your email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={320}
                required
                autoComplete="email"
              />
            </label>

            <label>
              <span>Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                maxLength={5000}
                required
              />
            </label>

            <div className="contact-turnstile" ref={widgetRef} />

            {errorMsg && <p className="contact-error">{errorMsg}</p>}

            <button type="submit" className="contact-submit" disabled={disabled}>
              {status === "submitting" ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
