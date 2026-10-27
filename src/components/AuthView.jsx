import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthView({ initialMode = "login", targetCourse = null, onBackToLanding, onSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("learner");
  const [bio, setBio] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim() || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    if (mode === "register" && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email.trim().toLowerCase(), password);
        setSuccessMessage("Signed in successfully! Redirecting...");
      } else {
        await register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          bio: bio.trim()
        });
        setSuccessMessage("Account created successfully! Welcome to OpenLearn.");
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDemoLogin(demoEmail) {
    setError("");
    setSuccessMessage("");
    setSubmitting(true);
    try {
      await login(demoEmail, "password123");
      setSuccessMessage("Demo session authenticated! Launching workspace...");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function fillCredentials(fillEmail, fillPass) {
    setEmail(fillEmail);
    setPassword(fillPass);
    setMode("login");
    setError("");
  }

  return (
    <div className="auth-page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div
        className="auth-card"
        style={{
          maxWidth: "460px",
          width: "100%",
          background: "#ffffff",
          padding: "32px 28px",
          borderRadius: "10px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)"
        }}
      >
        {onBackToLanding && (
          <button
            type="button"
            className="btn btn-sm"
            style={{ marginBottom: "16px", border: "none", padding: 0, color: "var(--text-muted)", background: "transparent" }}
            onClick={onBackToLanding}
          >
            &larr; Return to Public Course Catalog
          </button>
        )}

        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div className="brand-logo" style={{ width: "38px", height: "38px", fontSize: "16px" }}>
            OL
          </div>
          <div>
            <div className="brand-title" style={{ fontSize: "17px", fontWeight: 700 }}>OpenLearn LMS</div>
            <span className="brand-subtitle" style={{ fontSize: "12px" }}>Open Educational Resources &amp; University Curricula</span>
          </div>
        </div>

        {/* Context Banner if attempting to enroll in a specific course */}
        {targetCourse && (
          <div
            style={{
              padding: "10px 14px",
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "6px",
              marginBottom: "18px",
              fontSize: "13px",
              color: "#0369a1"
            }}
          >
            <strong>Enrollment Target:</strong> {targetCourse.title}
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              Offered by {targetCourse.institution} &bull; Sign in below to save progress &amp; earn credentials.
            </div>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", background: "var(--bg-secondary)", padding: "4px", borderRadius: "8px" }}>
          <button
            type="button"
            className={`btn btn-sm ${mode === "login" ? "btn-primary" : ""}`}
            style={{ flex: 1, border: "none" }}
            onClick={() => {
              setMode("login");
              setError("");
              setSuccessMessage("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === "register" ? "btn-primary" : ""}`}
            style={{ flex: 1, border: "none" }}
            onClick={() => {
              setMode("register");
              setError("");
              setSuccessMessage("");
            }}
          >
            Create Free Account
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}
        {successMessage && <div className="alert-success">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "5px" }}>Full Name</label>
              <input
                type="text"
                className="input"
                style={{ width: "100%" }}
                placeholder="e.g., Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "5px" }}>Email Address</label>
            <input
              type="email"
              className="input"
              style={{ width: "100%" }}
              placeholder="e.g., learner@openlearn.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus={mode === "login"}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600 }}>Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: "none", border: "none", fontSize: "12px", color: "var(--text-muted)", cursor: "pointer" }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="input"
                style={{ width: "100%", paddingRight: "40px" }}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {mode === "register" && (
            <>
              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "5px" }}>Academic Role</label>
                <select
                  className="select"
                  style={{ width: "100%" }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="learner">Learner (Enroll in courses, study OER, take quizzes, earn diplomas)</option>
                  <option value="instructor">Instructor (Author courses, import OER API lessons, manage syllabi)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "5px" }}>Academic Focus / Bio (Optional)</label>
                <input
                  type="text"
                  className="input"
                  style={{ width: "100%" }}
                  placeholder="e.g., Computer Science &amp; Neuroscience"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember session on this device
            </label>
            {mode === "login" && (
              <span style={{ color: "#0284c7", cursor: "pointer" }} onClick={() => fillCredentials("learner@openlearn.org", "password123")}>
                Forgot password?
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "10px", fontSize: "14px", fontWeight: 600 }}
            disabled={submitting}
          >
            {submitting
              ? "Authenticating with SQLite..."
              : mode === "login"
              ? "Sign In to My Account"
              : "Create Free Student Account"}
          </button>
        </form>

        {/* 1-Click Demo Accounts Section */}
        <div
          style={{
            marginTop: "24px",
            paddingTop: "18px",
            borderTop: "1px solid var(--border-color)",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Instant 1-Click Demo Access
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div
              style={{
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                padding: "10px",
                textAlign: "left",
                background: "var(--bg-secondary)"
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>Alex Rivera</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>Demo Learner</div>
              <button
                type="button"
                className="btn btn-sm"
                style={{ width: "100%", background: "#ffffff" }}
                disabled={submitting}
                onClick={() => handleDemoLogin("learner@openlearn.org")}
              >
                Log In as Learner &rarr;
              </button>
            </div>

            <div
              style={{
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                padding: "10px",
                textAlign: "left",
                background: "var(--bg-secondary)"
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>Dr. Sarah Chen</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>Demo Instructor</div>
              <button
                type="button"
                className="btn btn-sm"
                style={{ width: "100%", background: "#ffffff" }}
                disabled={submitting}
                onClick={() => handleDemoLogin("instructor@openlearn.org")}
              >
                Log In as Faculty &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Toggle mode helper footer */}
        <div style={{ marginTop: "18px", textAlign: "center", fontSize: "13px", color: "var(--text-secondary)" }}>
          {mode === "login" ? (
            <span>
              Don't have an account yet?{" "}
              <button
                type="button"
                style={{ background: "none", border: "none", color: "#0284c7", fontWeight: 600, cursor: "pointer", padding: 0 }}
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                Sign up free
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                style={{ background: "none", border: "none", color: "#0284c7", fontWeight: 600, cursor: "pointer", padding: 0 }}
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
