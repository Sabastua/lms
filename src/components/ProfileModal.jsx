import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !user) return null;

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateProfile({ name: name.trim(), bio: bio.trim() });
      setMessage("Profile details saved successfully to SQLite!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "500px",
          width: "95%",
          background: "var(--bg-primary)",
          borderRadius: "8px",
          padding: "24px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Account &amp; Scholar Profile</h3>
          </div>
          <button className="btn btn-sm" onClick={onClose} style={{ border: "none", background: "transparent" }}>
            Close
          </button>
        </div>

        {message && <div className="alert-success">{message}</div>}
        {error && <div className="alert-error">{error}</div>}

        <div
          style={{
            padding: "12px 14px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "6px",
            marginBottom: "18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Account Role
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, marginTop: "2px" }}>
              {user.role === "instructor" ? "Academic Instructor / Faculty" : "Registered Scholar / Learner"}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              {user.role === "instructor" ? "Can publish courses & import OER APIs" : "Can enroll, earn certificates & track progress"}
            </div>
          </div>
          <span className="role-pill" style={{ textTransform: "uppercase" }}>{user.role}</span>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
              Full Name
            </label>
            <input
              type="text"
              className="input"
              style={{ width: "100%" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
              Registered Email (Primary Key)
            </label>
            <input
              type="email"
              className="input"
              style={{ width: "100%", background: "var(--bg-secondary)", cursor: "not-allowed" }}
              value={user.email}
              disabled
              title="Email address is fixed to your unique SQLite user record"
            />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
              Academic Bio &amp; Research Interests
            </label>
            <textarea
              className="input"
              style={{ width: "100%", minHeight: "75px" }}
              placeholder="Share your focus area, university affiliation, or learning goals..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
            <button
              type="button"
              className="btn btn-sm"
              style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
              onClick={() => {
                onClose();
                logout();
              }}
            >
              Sign Out
            </button>

            <div style={{ display: "flex", gap: "8px" }}>
              <button type="button" className="btn btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
