import { useEffect, useState } from "react";

const FIVE_MINUTES = 300;

export default function AutoRefreshPanel({ triggerRefresh }) {
  const [enabled, setEnabled] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(FIVE_MINUTES);

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          triggerRefresh();
          return FIVE_MINUTES;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [enabled, triggerRefresh]);

  const manualRefresh = () => {
    triggerRefresh();
    setSecondsLeft(FIVE_MINUTES);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="card"
      style={{
        marginBottom: "16px",
        padding: "14px",
        borderLeft: "5px solid #2563eb"
      }}
    >
      <h3 style={{ marginTop: 0 }}>Live Refresh Control</h3>

      <p style={{ marginBottom: "10px", fontSize: "14px" }}>
        Auto-refresh: <strong>{enabled ? "ON" : "OFF"}</strong> | Next refresh in:{" "}
        <strong>{formatTime(secondsLeft)}</strong>
      </p>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={manualRefresh}>
          Refresh Now
        </button>

        <button onClick={() => setEnabled((prev) => !prev)}>
          {enabled ? "Turn Off Auto Refresh" : "Turn On Auto Refresh"}
        </button>
      </div>
    </div>
  );
}