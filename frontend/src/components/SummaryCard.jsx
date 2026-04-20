export default function SummaryCard({ title, value, subtitle }) {
  return (
    <div
      className="card"
      style={{
        minWidth: "220px",
        flex: "1 1 220px",
        marginBottom: 0
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "14px",
          color: "#64748b"
        }}
      >
        {title}
      </p>

      <h2
        style={{
          margin: "10px 0 6px 0",
          fontSize: "24px",
          color: "#0f172a",
          wordBreak: "break-word"
        }}
      >
        {value}
      </h2>

      {subtitle && (
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#475569",
            wordBreak: "break-word"
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}