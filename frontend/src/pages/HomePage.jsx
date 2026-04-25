{/*
import useDashboardAccess from "../hooks/useDashboardAccess";
import { Link } from "react-router-dom";
import QuickDemoStart from "../components/QuickDemoStart";
import WorkflowDiagram from "../components/WorkflowDiagram";
import FooterNote from "../components/FooterNote";
import PresentationBanner from "../components/PresentationBanner";
import MobileNotice from "../components/MobileNotice";

import {
  Settings,
  BookText,
  Home,
  Wallet,
  MapPinned,
  ReceiptText,
  Landmark,
  FolderSearch
} from "lucide-react";

export default function HomePage({ account, connectWallet, disconnectWallet, contract }) {
  const { allowedRoles, loadingRoles } = useDashboardAccess(contract, account);

  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  const canAccess = (role) => allowedRoles.has(role);

  const roleLabels = {
    admin: "Owner / Admin",
    seller: "Seller",
    buyer: "Buyer",
    surveyor: "Surveyor",
    bir: "BIR",
    treasury: "City Treasury",
    assessor: "Assessor",
    rd: "Registry of Deeds"
  };

  const connectedRoles = [...allowedRoles].map((role) => roleLabels[role] || role);

  const renderDashboardCard = ({ title, description, to, role, icon, accentClass }) => {
    const enabled = canAccess(role);

    const handleBlockedClick = () => {
      alert(account ? "Switch wallet to access this dashboard." : "Connect wallet first.");
    };

    const commonContent = (
      <>
        <div className="role-card-header">
          {icon}
          <h3>{title}</h3>
        </div>
        <p>{description}</p>
        <div className="role-card-arrow">→</div>
      </>
    );

    if (enabled) {
      return (
        <Link to={to} className={`role-link-card ${accentClass} role-card-enabled`}>
          {commonContent}
        </Link>
      );
    }

    return (
      <button
        type="button"
        className={`role-link-card ${accentClass} role-card-disabled`}
        onClick={handleBlockedClick}
      >
        {commonContent}
      </button>
    );
  };

  return (
    <>
      <div className="top-nav">
        <div className="top-nav-inner">
          <div className="top-nav-title">Baguio Land Registry DApp</div>
        </div>
      </div>

      <div className="page-container">

        //-- ✅ MOBILE NOTICE FIX 
        {isMobile && <MobileNotice />}

        <div className="home-wallet-status">
          <button onClick={connectWallet} className="wallet-connect-btn">
            Connect Wallet
          </button>

          {account && (
            <div className="wallet-info-box">
              <div className="wallet-inline">
                <p className="home-wallet-address">
                  Connected: {account}
                </p>

                <div className="wallet-actions">
                  <button
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(account);
                      alert("Copied!");
                    }}
                  >
                    Copy
                  </button>

                  <button
                    className="disconnect-btn"
                    onClick={disconnectWallet}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}

          {loadingRoles && (
            <p className="home-wallet-address">Detecting accessible dashboards...</p>
          )}

          {account && !loadingRoles && connectedRoles.length > 0 && (
            <div className="role-badge-wrap">
              <span className="role-badge-label">Connected as:</span>
              {connectedRoles.map((role) => (
                <span key={role} className="role-badge-chip">
                  {role}
                </span>
              ))}
            </div>
          )}
        </div>

        <h1 className="page-title">Blockchain-Based Land Registry System</h1>
        <p className="page-subtitle">
          Select a role-based dashboard to interact with the smart contract workflow.
        </p>

        <PresentationBanner />

        <div className="home-grid">
          {renderDashboardCard({
            title: "Owner / Admin",
            description: "Set and manage authority addresses.",
            to: "/admin",
            role: "admin",
            accentClass: "accent-admin",
            icon: <Settings className="role-card-icon-svg" size={24} />
          })}

          {renderDashboardCard({
            title: "Registry of Deeds",
            description: "Register land, finalize transfers, and handle succession.",
            to: "/rd",
            role: "rd",
            accentClass: "accent-rd",
            icon: <BookText className="role-card-icon-svg" size={24} />
          })}

          {renderDashboardCard({
            title: "Seller",
            description: "Upload files, request a sale, and monitor status.",
            to: "/seller",
            role: "seller",
            accentClass: "accent-seller",
            icon: <Home className="role-card-icon-svg" size={24} />
          })}

          {renderDashboardCard({
            title: "Buyer",
            description: "Review sale details and fund escrow.",
            to: "/buyer",
            role: "buyer",
            accentClass: "accent-buyer",
            icon: <Wallet className="role-card-icon-svg" size={24} />
          })}

          {renderDashboardCard({
            title: "Surveyor",
            description: "Approve the survey stage.",
            to: "/surveyor",
            role: "surveyor",
            accentClass: "accent-surveyor",
            icon: <MapPinned className="role-card-icon-svg" size={24} />
          })}

          {renderDashboardCard({
            title: "BIR",
            description: "Approve the BIR stage.",
            to: "/bir",
            role: "bir",
            accentClass: "accent-bir",
            icon: <ReceiptText className="role-card-icon-svg" size={24} />
          })}

          {renderDashboardCard({
            title: "City Treasury",
            description: "Approve the treasury stage.",
            to: "/treasury",
            role: "treasury",
            accentClass: "accent-treasury",
            icon: <Landmark className="role-card-icon-svg" size={24} />
          })}

          {renderDashboardCard({
            title: "Assessor",
            description: "Approve the assessor stage.",
            to: "/assessor",
            role: "assessor",
            accentClass: "accent-assessor",
            icon: <FolderSearch className="role-card-icon-svg" size={24} />
          })}
        </div>

        <div className="quick-start-section">
          <QuickDemoStart />
        </div>

        <WorkflowDiagram />
        <FooterNote />
      </div>
    </>
  );
}
*/}


//------ Final version ---

import useDashboardAccess from "../hooks/useDashboardAccess";
import { Link } from "react-router-dom";
import QuickDemoStart from "../components/QuickDemoStart";
import WorkflowDiagram from "../components/WorkflowDiagram";
import FooterNote from "../components/FooterNote";
import PresentationBanner from "../components/PresentationBanner";
import MobileNotice from "../components/MobileNotice";
import ConnectWallet from "../components/ConnectWallet"; // ✅ ADDED

import {
  Settings,
  BookText,
  Home,
  Wallet,
  MapPinned,
  ReceiptText,
  Landmark,
  FolderSearch
} from "lucide-react";

export default function HomePage({ account, connectWallet, disconnectWallet, contract }) {
  const { allowedRoles, loadingRoles } = useDashboardAccess(contract, account);

  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  const canAccess = (role) => allowedRoles.has(role);

  const roleLabels = {
    admin: "Owner / Admin",
    seller: "Seller",
    buyer: "Buyer",
    surveyor: "Surveyor",
    bir: "BIR",
    treasury: "City Treasury",
    assessor: "Assessor",
    rd: "Registry of Deeds"
  };

  const connectedRoles = [...allowedRoles].map((role) => roleLabels[role] || role);

  const renderDashboardCard = ({ title, description, to, role, icon, accentClass }) => {
    const enabled = canAccess(role);

    const handleBlockedClick = () => {
      alert(account ? "Switch wallet to access this dashboard." : "Connect wallet first.");
    };

    const commonContent = (
      <>
        <div className="role-card-header">
          {icon}
          <h3>{title}</h3>
        </div>
        <p>{description}</p>
        <div className="role-card-arrow">→</div>
      </>
    );

    if (enabled) {
      return (
        <Link to={to} className={`role-link-card ${accentClass} role-card-enabled`}>
          {commonContent}
        </Link>
      );
    }

    return (
      <button
        type="button"
        className={`role-link-card ${accentClass} role-card-disabled`}
        onClick={handleBlockedClick}
      >
        {commonContent}
      </button>
    );
  };

  return (
    <>
      <div className="top-nav">
        <div className="top-nav-inner">
          <div className="top-nav-title">Baguio Land Registry DApp</div>
        </div>
      </div>

      <div className="page-container">

        {/* MOBILE NOTICE */}
        {isMobile && <MobileNotice />}

        {/* ✅ WALLET SECTION (FIXED) */}
        <div className="home-wallet-status">

          <ConnectWallet
            account={account}
            connectWallet={connectWallet}
            disconnectWallet={disconnectWallet}
          />

          {loadingRoles && (
            <p className="home-wallet-address">
              Detecting accessible dashboards...
            </p>
          )}

          {account && !loadingRoles && connectedRoles.length > 0 && (
            <div className="role-badge-wrap">
              <span className="role-badge-label">Connected as:</span>
              {connectedRoles.map((role) => (
                <span key={role} className="role-badge-chip">
                  {role}
                </span>
              ))}
            </div>
          )}
        </div>

        <h1 className="page-title">Blockchain-Based Land Registry System</h1>
        <p className="page-subtitle">
          Select a role-based dashboard to interact with the smart contract workflow.
        </p>

        <PresentationBanner />

        <div className="home-grid">
          {renderDashboardCard({
            title: "Owner / Admin",
            description: "Set and manage authority addresses.",
            to: "/admin",
            role: "admin",
            accentClass: "accent-admin",
            icon: <Settings className="role-card-icon-svg" size={24} />
          })}

          {renderDashboardCard({
            title: "Registry of Deeds",
            description: "Register land, finalize transfers, and handle succession.",
            to: "/rd",
            role: "rd",
            accentClass: "accent-rd",
            icon: <BookText className="role-card-icon-svg" size={24} />
          })}

          {renderDashboardCard({
            title: "Seller",
            description: "Upload files, request a sale, and monitor status.",
            to: "/seller",
            role: "seller",
            accentClass: "accent-seller",
            icon: <Home className="role-card-icon-svg" size={24} />
          })}

          {renderDashboardCard({
            title: "Buyer",
            description: "Review sale details and fund escrow.",
            to: "/buyer",
            role: "buyer",
            accentClass: "accent-buyer",
            icon: <Wallet className="role-card-icon-svg" size={24} />
          })}

          {renderDashboardCard({
            title: "Surveyor",
            description: "Approve the survey stage.",
            to: "/surveyor",
            role: "surveyor",
            accentClass: "accent-surveyor",
            icon: <MapPinned className="role-card-icon-svg" size={24} />
          })}

          {renderDashboardCard({
            title: "BIR",
            description: "Approve the BIR stage.",
            to: "/bir",
            role: "bir",
            accentClass: "accent-bir",
            icon: <ReceiptText className="role-card-icon-svg" size={24} />
          })}

          {renderDashboardCard({
            title: "City Treasury",
            description: "Approve the treasury stage.",
            to: "/treasury",
            role: "treasury",
            accentClass: "accent-treasury",
            icon: <Landmark className="role-card-icon-svg" size={24} />
          })}

          {renderDashboardCard({
            title: "Assessor",
            description: "Approve the assessor stage.",
            to: "/assessor",
            role: "assessor",
            accentClass: "accent-assessor",
            icon: <FolderSearch className="role-card-icon-svg" size={24} />
          })}
        </div>

        <div className="quick-start-section">
          <QuickDemoStart />
        </div>

        <WorkflowDiagram />
        <FooterNote />
      </div>
    </>
  );
}