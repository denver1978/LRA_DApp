{/*
import { useState } from "react";
import { Link } from "react-router-dom";

import ViewSale from "../components/ViewSale";
import BuyerDepositForm from "../components/BuyerDepositForm";
import ViewEscrow from "../components/ViewEscrow";
import QuickStatsCards from "../components/QuickStatsCards";
import TransactionProgressTracker from "../components/TransactionProgressTracker";
import ActivityLog from "../components/ActivityLog";
import CollapsibleSection from "../components/CollapsibleSection";
import LandIdSelector from "../components/LandIdSelector";
import PageHeaderPanel from "../components/PageHeaderPanel";
import TransactionReferenceSlip from "../components/TransactionReferenceSlip";
import MyPropertiesTable from "../components/MyPropertiesTable";
import TransactionRoleGuard from "../components/TransactionRoleGuard";
import TransferCertificateViewer from "../components/TransferCertificateViewer";
import LandCoordinatesViewer from "../components/LandCoordinatesViewer";

export default function BuyerPage({
  account,
  connectWallet,
  contract,
  refreshKey,
  triggerRefresh
}) {
  const [selectedLandId, setSelectedLandId] = useState("");

  return (
    <>
      <div className="top-nav">
        <div className="top-nav-inner">
          <div className="top-nav-title">Buyer Dashboard</div>
        </div>
      </div>

      <div className="page-container">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>

        <h1 className="page-title">Buyer</h1>
        <p className="page-subtitle">
          Review sale details, fund escrow, and track blockchain activity.
        </p>

        <PageHeaderPanel
          account={account}
          connectWallet={connectWallet}
          contract={contract}
          latestCID=""
          useRoleGuard={false}
        />

        <TransactionRoleGuard
          contract={contract}
          account={account}
          mode="buyer"
        />

        //--- this LandIdSelector should be disable
        {/* <LandIdSelector
          landId={selectedLandId}
          setLandId={setSelectedLandId}
          label="Active Buyer Land ID"
        /> 

        <CollapsibleSection title="Land / Sale Quick Stats">
          <QuickStatsCards
            contract={contract}
            refreshKey={refreshKey}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="My Purchased Properties" defaultOpen={true}>
          <MyPropertiesTable
            contract={contract}
            account={account}
            role="buyer"
            refreshKey={refreshKey}
            onSelectLandId={setSelectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="View Sale" defaultOpen={true}>
          <ViewSale
            contract={contract}
            refreshKey={refreshKey}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>


        // ----- this also need to be diable
        {/* <CollapsibleSection title="Land Coordinates">
          <LandCoordinatesViewer
            contract={contract}
            selectedLandId={selectedLandId}
            refreshKey={refreshKey}
          />
        </CollapsibleSection> 

        <CollapsibleSection title="Transaction Progress Tracker">
          <TransactionProgressTracker
            contract={contract}
            refreshKey={refreshKey}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Blockchain Activity Log">
          <ActivityLog
            contract={contract}
            refreshKey={refreshKey}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Buyer Deposit" defaultOpen={true}>
          <BuyerDepositForm
            contract={contract}
            triggerRefresh={triggerRefresh}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Transaction Reference Slip">
          <TransactionReferenceSlip
            contract={contract}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Temporary Transfer Certificate">
          <TransferCertificateViewer
            contract={contract}
            account={account}
            selectedLandId={selectedLandId}
            refreshKey={refreshKey}
          />
        </CollapsibleSection>

        <CollapsibleSection title="View Escrow">
          <ViewEscrow
            contract={contract}
            refreshKey={refreshKey}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>
      </div>
    </>
  );
}
*/}

import { useState } from "react";
import { Link } from "react-router-dom";

import ConnectWallet from "../components/ConnectWallet";
import ViewSale from "../components/ViewSale";
import BuyerDepositForm from "../components/BuyerDepositForm";
import ViewEscrow from "../components/ViewEscrow";
import QuickStatsCards from "../components/QuickStatsCards";
import TransactionProgressTracker from "../components/TransactionProgressTracker";
import ActivityLog from "../components/ActivityLog";
import CollapsibleSection from "../components/CollapsibleSection";
import PageHeaderPanel from "../components/PageHeaderPanel";
import TransactionReferenceSlip from "../components/TransactionReferenceSlip";
import MyPropertiesTable from "../components/MyPropertiesTable";
import TransactionRoleGuard from "../components/TransactionRoleGuard";
import TransferCertificateViewer from "../components/TransferCertificateViewer";
import AutoRefreshPanel from "../components/AutoRefreshPanel";

export default function BuyerPage({
  account,
  connectWallet,
  disconnectWallet,
  contract,
  refreshKey,
  triggerRefresh
}) {
  const [selectedLandId, setSelectedLandId] = useState("");

  return (
    <>
      <div className="top-nav">
        <div className="top-nav-inner">
          <div className="top-nav-title">Buyer Dashboard</div>
        </div>
      </div>

      <div className="page-container">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>

        <ConnectWallet
          account={account}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
        />

        <h1 className="page-title">Buyer</h1>
        <p className="page-subtitle">
          Review sale details, fund escrow, and track blockchain activity.
        </p>

        <PageHeaderPanel
          account={account}
          connectWallet={connectWallet}
          contract={contract}
          latestCID=""
          useRoleGuard={false}
        />

        <TransactionRoleGuard
          contract={contract}
          account={account}
          mode="buyer"
        />

        <CollapsibleSection title="Land / Sale Quick Stats">
          <QuickStatsCards
            contract={contract}
            refreshKey={refreshKey}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="My Purchased Properties" defaultOpen={true}>
          <AutoRefreshPanel triggerRefresh={triggerRefresh} />
          
          <MyPropertiesTable
            contract={contract}
            account={account}
            role="buyer"
            refreshKey={refreshKey}
            maxLandId={100}
            onSelectLandId={setSelectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="View Sale" defaultOpen={true}>
          <ViewSale
            contract={contract}
            refreshKey={refreshKey}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Transaction Progress Tracker">
          <TransactionProgressTracker
            contract={contract}
            refreshKey={refreshKey}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Blockchain Activity Log">
          <ActivityLog
            contract={contract}
            refreshKey={refreshKey}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Buyer Deposit" defaultOpen={true}>
          <BuyerDepositForm
            contract={contract}
            triggerRefresh={triggerRefresh}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Transaction Reference Slip">
          <TransactionReferenceSlip
            contract={contract}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Temporary Transfer Certificate">
          <TransferCertificateViewer
            contract={contract}
            account={account}
            selectedLandId={selectedLandId}
            refreshKey={refreshKey}
          />
        </CollapsibleSection>

        <CollapsibleSection title="View Escrow">
          <ViewEscrow
            contract={contract}
            refreshKey={refreshKey}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>
      </div>
    </>
  );
}