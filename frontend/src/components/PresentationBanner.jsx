{/* import { Presentation, ArrowRight } from "lucide-react";

export default function PresentationBanner() {
  return (
    <div className="presentation-banner">
      <div className="presentation-banner-left">
        <div className="presentation-banner-icon-wrap">
          <Presentation className="presentation-banner-icon" size={22} />
        </div>

        <div>
          <h2 className="presentation-banner-title">
            Watch this! Recommended Demo Sequence for Presentation
          </h2>
          <p className="presentation-banner-text">
            Start with authority setup, continue to land registration, then demonstrate the end-to-end sale and approval workflow.
          </p>
        </div>
      </div>

      <div className="presentation-banner-right">
        <span className="presentation-banner-pill">Live Demo Ready</span>
        <ArrowRight size={18} />
      </div>
    </div>
  );
}

*/}

import { useState } from "react";
import { Presentation, ArrowRight } from "lucide-react";

export default function PresentationBanner() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      {/* 🔵 CLICKABLE BANNER */}
      <div
        className="presentation-banner"
        style={{ cursor: "pointer" }}
        onClick={() => setShowVideo(true)}
      >
        <div className="presentation-banner-left">
          <div className="presentation-banner-icon-wrap">
            <Presentation className="presentation-banner-icon" size={22} />
          </div>

          <div>
            <h2 className="presentation-banner-title">
              Watch this! Recommended Demo Sequence for Presentation
            </h2>
            <p className="presentation-banner-text">
              Start with authority setup, continue to land registration, then demonstrate the end-to-end sale and approval workflow.
            </p>
          </div>
        </div>

        <div className="presentation-banner-right">
          <span className="presentation-banner-pill">Demo Ready</span>
          <ArrowRight size={18} />
        </div>
      </div>

      {/* 🎥 VIDEO MODAL */}
      {showVideo && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "18px",
              width: "100%",
              maxWidth: "1100px",
              position: "relative"
            }}
          >
            {/* ❌ CLOSE BUTTON */}
            <button
              onClick={() => setShowVideo(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "6px 10px",
                cursor: "pointer"
              }}
            >
              ✕
            </button>

            <h2 style={{ marginTop: 0 }}>System Recorded Demo</h2>

            <video
              controls
              autoPlay
              style={{
                width: "100%",
                height: "70vh",     // 👈 makes it taller
                objectFit: "contain",
                borderRadius: "10px"
              }}
            >
              <source
                src="/videos/LRA_DApp_System_Tutorial.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </>
  );
}