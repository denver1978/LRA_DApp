{/*
import { useState } from "react";
import { Link } from "react-router-dom";
import ConnectWallet from "../components/ConnectWallet";
import NetworkStatus from "../components/NetworkStatus";
import DashboardSummary from "../components/DashboardSummary";
import RoleGuard from "../components/RoleGuard";
import WalletRoleStatus from "../components/WalletRoleStatus";
import ViewSale from "../components/ViewSale";
import QuickStatsCards from "../components/QuickStatsCards";
import TransactionProgressTracker from "../components/TransactionProgressTracker";
import ActivityLog from "../components/ActivityLog";
import BIRApprovalForm from "../components/BIRApprovalForm";
import CollapsibleSection from "../components/CollapsibleSection";
import LandIdSelector from "../components/LandIdSelector";
import PageHeaderPanel from "../components/PageHeaderPanel";
import PendingApprovalsTable from "../components/PendingApprovalsTable";
import UploadedDocumentsViewer from "../components/UploadedDocumentsViewer";

export default function BIRPage({
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
          <div className="top-nav-title">BIR Dashboard</div>
        </div>
      </div>

      <div className="page-container">
        <Link to="/" className="back-link">← Back to Home</Link>

        <h1 className="page-title">BIR</h1>
        <p className="page-subtitle">
          Review the sale record and approve the BIR stage.
        </p>

        <PageHeaderPanel
          account={account}
          connectWallet={connectWallet}
          contract={contract}
          latestCID=""
          expectedRole="BIR"
          useRoleGuard={true}
        />

        <LandIdSelector
          landId={selectedLandId}
          setLandId={setSelectedLandId}
          label="Active BIR Land ID"
        />

        <CollapsibleSection title="View Sale" defaultOpen={true}>
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

        <CollapsibleSection title="Pending BIR Approvals" defaultOpen={true}>
          <PendingApprovalsTable
            contract={contract}
            role="bir"
            refreshKey={refreshKey}
            onSelectLandId={setSelectedLandId}
          />
        </CollapsibleSection>
        
        <CollapsibleSection title="Uploaded Documents" defaultOpen={true}>
          <UploadedDocumentsViewer
            contract={contract}
            selectedLandId={selectedLandId}
            refreshKey={refreshKey}
          />
        </CollapsibleSection>

        <CollapsibleSection title="BIR Approval" defaultOpen={true}>
          <BIRApprovalForm
            contract={contract}
            triggerRefresh={triggerRefresh}
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
import DashboardRoleGate from "../components/DashboardRoleGate";
import ViewSale from "../components/ViewSale";
import QuickStatsCards from "../components/QuickStatsCards";
import TransactionProgressTracker from "../components/TransactionProgressTracker";
import ActivityLog from "../components/ActivityLog";
import BIRApprovalForm from "../components/BIRApprovalForm";
import CollapsibleSection from "../components/CollapsibleSection";
import LandIdSelector from "../components/LandIdSelector";
import PageHeaderPanel from "../components/PageHeaderPanel";
import PendingApprovalsTable from "../components/PendingApprovalsTable";
import UploadedDocumentsViewer from "../components/UploadedDocumentsViewer";

export default function BIRPage({
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
          <div className="top-nav-title">BIR Dashboard</div>
        </div>
      </div>

      <div className="page-container">
        <Link to="/" className="back-link">← Back to Home</Link>

        <ConnectWallet
          account={account}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
        />

        <h1 className="page-title">BIR</h1>
        <p className="page-subtitle">
          Review the sale record and approve the BIR stage.
        </p>

        <PageHeaderPanel
          account={account}
          connectWallet={connectWallet}
          contract={contract}
          latestCID=""
          expectedRole="BIR"
          useRoleGuard={true}
        />

        <DashboardRoleGate
          contract={contract}
          account={account}
          expectedRole="bir"
          expectedRoleLabel="BIR"
        >
          <LandIdSelector
            landId={selectedLandId}
            setLandId={setSelectedLandId}
            label="Active BIR Land ID"
          />

          <CollapsibleSection title="View Sale" defaultOpen={true}>
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

          <CollapsibleSection title="Pending BIR Approvals" defaultOpen={true}>
            <PendingApprovalsTable
              contract={contract}
              role="bir"
              refreshKey={refreshKey}
              maxLandId={100}
              onSelectLandId={setSelectedLandId}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Uploaded Documents" defaultOpen={true}>
            <UploadedDocumentsViewer
              contract={contract}
              selectedLandId={selectedLandId}
              refreshKey={refreshKey}
            />
          </CollapsibleSection>

          <CollapsibleSection title="BIR Approval" defaultOpen={true}>
            <BIRApprovalForm
              contract={contract}
              triggerRefresh={triggerRefresh}
              selectedLandId={selectedLandId}
            />
          </CollapsibleSection>
        </DashboardRoleGate>
      </div>
    </>
  );
}