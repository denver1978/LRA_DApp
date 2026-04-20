import { Presentation, ArrowRight } from "lucide-react";

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