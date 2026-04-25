{/*
import { Link } from "react-router-dom";
import ConnectWallet from "../components/ConnectWallet";
import WalletRoleStatus from "../components/WalletRoleStatus";
import ViewAuthorities from "../components/ViewAuthorities";
import SetAuthoritiesForm from "../components/SetAuthoritiesForm";

export default function AdminPage({ account, connectWallet, contract }) {
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
          Manage role assignments and review the currently configured authorities.
        </p>

        <div className="card">
          <ConnectWallet account={account} connectWallet={connectWallet} />
        </div>

        <WalletRoleStatus contract={contract} account={account} />
        <ViewAuthorities contract={contract} />
        <SetAuthoritiesForm contract={contract} />
      </div>
    </>
  );
}
*/}


import { Link } from "react-router-dom";
import ConnectWallet from "../components/ConnectWallet";
import WalletRoleStatus from "../components/WalletRoleStatus";
import ViewAuthorities from "../components/ViewAuthorities";
import SetAuthoritiesForm from "../components/SetAuthoritiesForm";

export default function AdminPage({ account, connectWallet, disconnectWallet, contract }) {
  return (
    <>
      <div className="top-nav">
        <div className="top-nav-inner">
          <div className="top-nav-title">Owner / Admin Dashboard</div>
        </div>
      </div>

      <div className="page-container">
        <Link to="/" className="back-link">← Back to Home</Link>

        <ConnectWallet
          account={account}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
        />

        <h1 className="page-title">Owner / Admin</h1>
        <p className="page-subtitle">
          Manage role assignments and review the currently configured authorities.
        </p>

        <WalletRoleStatus contract={contract} account={account} />
        <ViewAuthorities contract={contract} />
        <SetAuthoritiesForm contract={contract} />
      </div>
    </>
  );
}