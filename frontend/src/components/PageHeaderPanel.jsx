export default function ExplorerLink({ type, value }) {
  if (!value) return null;

  let href = "#";
  let label = "Open";

  if (type === "address") {
    href = `https://sepolia.etherscan.io/address/${value}`;
    label = "View";
  }

  if (type === "tx") {
    href = `https://sepolia.etherscan.io/tx/${value}`;
    label = "View";
  }

  if (type === "ipfs") {
    href = `https://gateway.pinata.cloud/ipfs/${value}`;
    label = "Open";
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        marginLeft: "8px",
        fontSize: "12px",
        color: "#334155",
        fontWeight: 600,
        textDecoration: "underline",
        display: "inline-block"
      }}
    >
      {label}
    </a>
  );
}