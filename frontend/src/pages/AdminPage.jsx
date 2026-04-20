import { Link } from "react-router-dom";
import PageHeaderPanel from "../components/PageHeaderPanel";

export default function AdminPage({
  account,
  connectWallet,
  contract
}) {
  return (
    <>
      <div className="top-nav">
        <div className="top-nav-inner">
          <div className="top-nav-title">Owner / Admin Dashboard</div>
        </div>
      </div>

      <div className="page-container">
        <Link to="/" className="back-link">← Back to Home</Link>

        <h1 className="page-title">Owner / Admin</h1>
        <p className="page-subtitle">
          Manage authority addresses and administration settings.
        </p>

        <PageHeaderPanel
          account={account}
          connectWallet={connectWallet}
          contract={contract}
          latestCID=""
          expectedRole="Owner / Admin"
          useRoleGuard={false}
        />

        {!account && (
          <div className="card">
            <p className="section-note">Connect your wallet first.</p>
          </div>
        )}

        {account && !contract && (
          <div className="card">
            <p className="section-note">Contract not loaded yet.</p>
          </div>
        )}

        {account && contract && (
          <div className="card">
            <p className="section-note">
              Admin dashboard loaded successfully.
            </p>
          </div>
        )}
      </div>
    </>
  );
}