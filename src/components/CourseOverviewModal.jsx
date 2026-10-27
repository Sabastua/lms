import React, { useState } from "react";
import { getCourseDetails } from "../data/courseraMetadata";

export default function CourseOverviewModal({
  course,
  onClose,
  onStartCourse,
  onEnroll,
  onClaimCert
}) {
  const [expandedWeek, setExpandedWeek] = useState(1);

  if (!course) return null;

  const details = getCourseDetails(course);

  // Group lessons into weeks (e.g. 2 lessons per week)
  const lessons = course.lessons || [];
  const lessonsPerWeek = 2;
  const totalWeeks = Math.max(1, Math.ceil(lessons.length / lessonsPerWeek));

  const weekList = Array.from({ length: totalWeeks }, (_, idx) => {
    const weekNum = idx + 1;
    const weekLessons = lessons.slice(idx * lessonsPerWeek, (idx + 1) * lessonsPerWeek);
    const predefined = details.weeks?.[idx];
    return {
      week: weekNum,
      title: predefined?.title || `Week ${weekNum}: Core Principles & Analytical Methods`,
      duration: predefined?.duration || "3h 30m",
      lessons: weekLessons
    };
  });

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "920px",
          width: "95%",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: "10px",
          padding: 0,
          border: "1px solid var(--border-color)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
        }}
      >
        {/* Coursera-style Hero Header */}
        <div
          style={{
            padding: "36px 36px 28px",
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border-color)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "var(--text-secondary)",
                  background: "#ffffff",
                  padding: "5px 12px",
                  borderRadius: "99px",
                  border: "1px solid var(--border-color)"
                }}
              >
                Offered by {course.institution || "Open Educational Resources Consortium"}
              </span>
              <span className="card-tag" style={{ margin: 0 }}>
                {course.category}
              </span>
            </div>

            <button
              className="btn btn-sm"
              onClick={onClose}
              style={{ fontWeight: "bold", fontSize: "14px", border: "none", background: "transparent" }}
            >
              Close
            </button>
          </div>

          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              margin: "0 0 12px",
              color: "var(--text-primary)"
            }}
          >
            {course.title}
          </h1>

          <p
            style={{
              fontSize: "15px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              maxWidth: "760px",
              margin: "0 0 18px"
            }}
          >
            {course.description}
          </p>

          {/* Social Proof & Rating Metrics */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              flexWrap: "wrap",
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginBottom: "24px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Rating: {details.rating} / 5.0</span>
              <span style={{ color: "var(--text-muted)" }}>({details.reviewsCount} reviews)</span>
            </div>
            <span>&bull;</span>
            <div>
              <strong>{details.studentsEnrolled}</strong> already enrolled
            </div>
            <span>&bull;</span>
            <div>{details.level}</div>
            <span>&bull;</span>
            <div>{details.duration}</div>
          </div>

          {/* Action Row */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {course.isEnrolled ? (
              <button
                className="btn btn-primary"
                style={{ padding: "10px 22px", fontSize: "15px" }}
                onClick={() => {
                  onClose();
                  onStartCourse(course.id);
                }}
              >
                Go to Course / Resume Learning &rarr;
              </button>
            ) : (
              <button
                className="btn btn-primary"
                style={{ padding: "10px 22px", fontSize: "15px" }}
                onClick={() => {
                  if (onEnroll) onEnroll(course.id);
                  onStartCourse(course.id);
                  onClose();
                }}
              >
                Enroll for Free (Starts Today) &rarr;
              </button>
            )}

            {course.progressPercent === 100 && onClaimCert && (
              <button
                className="btn btn-sm"
                style={{ background: "#f0fdf4", color: "#16a34a", borderColor: "#86efac" }}
                onClick={() => {
                  onClose();
                  onClaimCert();
                }}
              >
                View Earned Diploma
              </button>
            )}

            <button
              className="btn btn-sm"
              onClick={() => {
                const blob = new Blob([JSON.stringify(course, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${course.id}-syllabus.json`;
                a.click();
              }}
            >
              Export Syllabus (JSON)
            </button>
          </div>
        </div>

        {/* Course Body Content */}
        <div style={{ padding: "32px 36px" }}>
          {/* What you will learn */}
          <div
            style={{
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "32px",
              background: "#ffffff"
            }}
          >
            <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 16px" }}>
              What you will learn
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "14px"
              }}
            >
              {details.whatYouWillLearn.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "14px", lineHeight: "1.5" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "3px" }}>
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills you will gain */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 12px" }}>
              Skills you'll gain
            </h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {details.skills.map((skill, i) => (
                <span
                  key={i}
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    padding: "6px 14px",
                    borderRadius: "99px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text-primary)"
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Week-by-Week Syllabus Accordion */}
          <div style={{ marginBottom: "36px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 700, margin: 0 }}>
                Syllabus &bull; What you'll learn each week ({weekList.length} Weeks)
              </h3>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {lessons.length} Total Modules &amp; Video Lectures
              </span>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              {weekList.map((w) => {
                const isOpen = expandedWeek === w.week;
                return (
                  <div
                    key={w.week}
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      overflow: "hidden"
                    }}
                  >
                    <div
                      onClick={() => setExpandedWeek(isOpen ? null : w.week)}
                      style={{
                        padding: "16px 20px",
                        background: isOpen ? "var(--bg-secondary)" : "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>
                          {w.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
                          {w.lessons.length} Modules &bull; {w.duration} estimated
                        </div>
                      </div>
                      <span style={{ fontSize: "16px", color: "var(--text-muted)" }}>
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </div>

                    {isOpen && (
                      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border-color)", background: "#ffffff" }}>
                        <div style={{ display: "grid", gap: "10px" }}>
                          {w.lessons.map((l, lIdx) => (
                            <div
                              key={l.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 12px",
                                background: "var(--bg-secondary)",
                                borderRadius: "6px",
                                fontSize: "13px"
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span className="card-tag" style={{ margin: 0, fontSize: "10px", padding: "1px 6px" }}>
                                  {l.lessonType.toUpperCase()}
                                </span>
                                <span style={{ fontWeight: 500 }}>
                                  {l.title}
                                </span>
                              </div>
                              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                Module
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructor Section */}
          <div
            style={{
              paddingTop: "24px",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              gap: "18px",
              alignItems: "flex-start"
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--text-secondary)",
                flexShrink: 0
              }}
            >
              {details.instructor.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)" }}>
                Instructor / Course Director
              </div>
              <h4 style={{ fontSize: "16px", fontWeight: 700, margin: "2px 0 4px" }}>
                {details.instructor.name}
              </h4>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                {details.instructor.role} &bull; {details.instructor.institution}
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                {details.instructor.department}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
