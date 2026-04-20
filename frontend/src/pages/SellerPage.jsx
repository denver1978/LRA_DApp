import { useState } from "react";
import { Link } from "react-router-dom";

import ViewSale from "../components/ViewSale";
import QuickStatsCards from "../components/QuickStatsCards";
import TransactionProgressTracker from "../components/TransactionProgressTracker";
import ActivityLog from "../components/ActivityLog";
import CollapsibleSection from "../components/CollapsibleSection";
import LandIdSelector from "../components/LandIdSelector";
import PageHeaderPanel from "../components/PageHeaderPanel";
import RequestSellForm from "../components/RequestSellForm";
import MyPropertiesTable from "../components/MyPropertiesTable";
import MultiFileUploadToIPFS from "../components/MultiFileUploadToIPFS";

export default function SellerPage({
  account,
  connectWallet,
  contract,
  latestCID,
  setLatestCID,
  refreshKey,
  triggerRefresh,
  registrationResetKey,
  selectedLandId: initialLandId
}) {
  const [selectedLandId, setSelectedLandId] = useState(initialLandId || "");

  return (
    <>
      <div className="top-nav">
        <div className="top-nav-inner">
          <div className="top-nav-title">Seller Dashboard</div>
        </div>
      </div>

      <div className="page-container">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>

        <h1 className="page-title">Seller</h1>
        <p className="page-subtitle">
          Manage your registered properties, upload documents, and initiate property sales.
        </p>

        <PageHeaderPanel
          account={account}
          connectWallet={connectWallet}
          contract={contract}
          latestCID={latestCID || ""}
          expectedRole="Seller"
          useRoleGuard={true}
        />

        <LandIdSelector
          landId={selectedLandId}
          setLandId={setSelectedLandId}
          label="Active Seller Land ID"
        />

        <CollapsibleSection title="My Properties" defaultOpen={true}>
          <MyPropertiesTable
            contract={contract}
            account={account}
            role="seller"
            refreshKey={refreshKey}
            onSelectLandId={setSelectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Upload Sale Documents to IPFS" defaultOpen={true}>
          <MultiFileUploadToIPFS
            setLatestCID={setLatestCID}
            contract={contract}
            selectedLandId={selectedLandId}
            resetKey={registrationResetKey}
          />

          <div className="cid-box">
            <strong>Latest Generated CID:</strong> {latestCID || "None yet"}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="View Sale Details" defaultOpen={true}>
          <ViewSale
            contract={contract}
            refreshKey={refreshKey}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Land / Sale Quick Stats">
          <QuickStatsCards
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

        <CollapsibleSection title="Request Property Sale" defaultOpen={true}>
          <RequestSellForm
            contract={contract}
            triggerRefresh={triggerRefresh}
            selectedLandId={selectedLandId}
            latestCID={latestCID}
          />
        </CollapsibleSection>
      </div>
    </>
  );
}