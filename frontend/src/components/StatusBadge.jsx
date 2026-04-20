export default function StatusBadge({ label, value }) {
  const isPositive =
    value === true ||
    value === "Yes" ||
    value === "Approved" ||
    value === "Active" ||
    value === "Completed";

  const badgeStyle = {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "600",
    marginLeft: "10px",
    backgroundColor: isPositive ? "#dcfce7" : "#fef3c7",
    color: isPositive ? "#166534" : "#92400e",
    border: isPositive ? "1px solid #86efac" : "1px solid #fcd34d"
  };

  return (
    <div style={{ marginBottom: "12px" }}>
      <strong>{label}:</strong>
      <span style={badgeStyle}>
        {isPositive ? "✔ Approved" : "⏳ Pending"}
      </span>
    </div>
  );
}