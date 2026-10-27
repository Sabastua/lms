import React, { useState } from "react";

export default function CertificateModal({ certificate, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!certificate) return null;

  const verifyUrl = `${window.location.origin}/#verify=${certificate.id}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handlePrint() {
    window.print();
  }

  const issueDateObj = new Date(certificate.issueDate || Date.now());
  const issueYear = issueDateObj.getFullYear();
  const issueMonth = issueDateObj.getMonth() + 1;
  const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
    certificate.courseTitle
  )}&organizationName=${encodeURIComponent(
    certificate.institution || "OpenLearn Academic Consortium"
  )}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(verifyUrl)}&certId=${encodeURIComponent(
    certificate.id
  )}`;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "850px",
          width: "95%",
          padding: "24px",
          background: "#ffffff",
          borderRadius: "8px",
          maxHeight: "92vh",
          overflowY: "auto"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Official Academic Credential</h3>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm"
              title="Add this verified credential directly to your LinkedIn certifications"
            >
              Add to LinkedIn
            </a>
            <button className="btn btn-sm" onClick={handleCopyLink}>
              {copied ? "Link Copied" : "Share Verification Link"}
            </button>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              Print / Download PDF
            </button>
            <button className="btn btn-sm" onClick={onClose} style={{ fontWeight: "bold" }}>
              Close
            </button>
          </div>
        </div>

        {/* Printable Certificate Frame */}
        <div
          id="printable-certificate"
          style={{
            border: "8px double #1e293b",
            padding: "44px 36px",
            background: "#ffffff",
            textAlign: "center",
            position: "relative",
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: "#0f172a",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
          }}
        >
          {/* Watermark / Badge Top */}
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#f8fafc",
                border: "2px solid #0f172a",
                fontSize: "18px",
                fontWeight: 800,
                letterSpacing: "1px"
              }}
            >
              OL
            </div>
          </div>

          <div style={{ letterSpacing: "3px", textTransform: "uppercase", fontSize: "13px", color: "#64748b", fontWeight: 700, marginBottom: "4px" }}>
            OpenLearn Academic Consortium &bull; OER Initiative
          </div>

          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "30px",
              fontWeight: 700,
              letterSpacing: "1px",
              margin: "8px 0 16px",
              textTransform: "uppercase",
              color: "#0f172a",
              borderBottom: "1px solid #cbd5e1",
              paddingBottom: "12px",
              display: "inline-block"
            }}
          >
            Certificate of Completion
          </h1>

          <p style={{ fontStyle: "italic", fontSize: "15px", color: "#475569", margin: "14px 0 6px" }}>
            This hereby verifies and confers that
          </p>

          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#0284c7",
              letterSpacing: "0.5px",
              margin: "6px 0 12px",
              textDecoration: "underline",
              textUnderlineOffset: "6px"
            }}
          >
            {certificate.recipientName || "Distinguished Scholar"}
          </div>

          <p style={{ fontSize: "14px", color: "#475569", maxWidth: "620px", margin: "0 auto 16px", lineHeight: "1.6" }}>
            has with dedication and academic merit satisfied all curricula modules, video lectures, reading assignments, and interactive assessments for:
          </p>

          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#0f172a",
              padding: "10px 18px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              display: "inline-block",
              marginBottom: "16px",
              maxWidth: "90%"
            }}
          >
            {certificate.courseTitle}
          </div>

          <div style={{ fontSize: "14px", color: "#334155", marginBottom: "28px" }}>
            Academic Institution Sourced: <strong style={{ color: "#0f172a" }}>{certificate.institution || "Open Educational Resources Consortium"}</strong>
          </div>

          {/* Certificate Footer with Signatures & Hash */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              alignItems: "flex-end",
              paddingTop: "20px",
              borderTop: "1px solid #e2e8f0",
              fontSize: "12px",
              color: "#64748b",
              textAlign: "center"
            }}
          >
            <div>
              <div style={{ fontFamily: "cursive", fontSize: "18px", color: "#1e293b", marginBottom: "4px" }}>
                OpenLearn Registry
              </div>
              <div style={{ borderTop: "1px solid #94a3b8", paddingTop: "4px", margin: "0 20px" }}>
                <strong>Academic Registrar</strong>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  border: "1px dashed #0284c7",
                  borderRadius: "4px",
                  background: "#f0f9ff",
                  color: "#0369a1"
                }}
              >
                <div style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>Cryptographic Hash</div>
                <code style={{ fontSize: "11px", fontWeight: "bold" }}>{certificate.verificationHash}</code>
              </div>
            </div>

            <div>
              <div style={{ color: "#0f172a", fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>
                {certificate.issueDate}
              </div>
              <div style={{ borderTop: "1px solid #94a3b8", paddingTop: "4px", margin: "0 20px" }}>
                <strong>Date Conferred</strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "18px", fontSize: "11px", color: "#94a3b8" }}>
            Credential ID: <code>{certificate.id}</code> &bull; Verifiable via OpenLearn LMS Registry
          </div>
        </div>
      </div>
    </div>
  );
}
