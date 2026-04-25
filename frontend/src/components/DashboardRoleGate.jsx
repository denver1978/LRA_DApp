import { Link } from "react-router-dom";
import useDashboardAccess from "../hooks/useDashboardAccess";

export default function DashboardRoleGate({
  contract,
  account,
  expectedRole,
  expectedRoleLabel,
  children
}) {
  const { allowedRoles, loadingRoles } = useDashboardAccess(contract, account);

  if (!account) {
    return (
      <div className="card" style={{ borderLeft: "5px solid #f59e0b" }}>
        <h3>Wallet Required</h3>
        <p>Please connect your MetaMask wallet to access this dashboard.</p>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    );
  }

  if (loadingRoles) {
    return (
      <div className="card">
        <p>Checking wallet authorization...</p>
      </div>
    );
  }

  if (!allowedRoles.has(expectedRole)) {
    return (
      <div className="card" style={{ borderLeft: "5px solid #dc2626" }}>
        <h3 style={{ color: "#dc2626" }}>Unauthorized Wallet</h3>
        <p>
          This wallet is not assigned as <strong>{expectedRoleLabel}</strong>.
        </p>
        <p>
          Please switch to the correct MetaMask account or return to the home page
          to access your assigned dashboard.
        </p>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    );
  }

  return children;
}