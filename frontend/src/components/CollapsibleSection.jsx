import { useState } from "react";

export default function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px"
        }}
      >
        <h2 className="section-title">{title}</h2>

        <button
          type="button"
          className="small-btn secondary-btn"
          onClick={() => setOpen(!open)}
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open && <div>{children}</div>}
    </div>
  );
}