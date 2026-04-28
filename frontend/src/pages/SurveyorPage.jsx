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
import SurveyApprovalForm from "../components/SurveyApprovalForm";
import CollapsibleSection from "../components/CollapsibleSection";
import LandIdSelector from "../components/LandIdSelector";
import PageHeaderPanel from "../components/PageHeaderPanel";
import PendingApprovalsTable from "../components/PendingApprovalsTable";
import UploadedDocumentsViewer from "../components/UploadedDocumentsViewer";
import LandCoordinatesViewer from "../components/LandCoordinatesViewer";


export default function SurveyorPage({
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
          <div className="top-nav-title">Surveyor Dashboard</div>
        </div>
      </div>

      <div className="page-container">
        <Link to="/" className="back-link">← Back to Home</Link>

        <h1 className="page-title">Surveyor</h1>
        <p className="page-subtitle">
          Review the sale record and approve the survey stage.
        </p>

        <PageHeaderPanel
          account={account}
          connectWallet={connectWallet}
          contract={contract}
          latestCID=""
          expectedRole="Surveyor"
          useRoleGuard={true}
        />

        <LandIdSelector
          landId={selectedLandId}
          setLandId={setSelectedLandId}
          label="Active Surveyor Land ID"
        />

        <CollapsibleSection title="View Sale" defaultOpen={true}>
          <ViewSale
            contract={contract}
            refreshKey={refreshKey}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Land Coordinates" defaultOpen={true}>
          <LandCoordinatesViewer
            contract={contract}
            selectedLandId={selectedLandId}
            refreshKey={refreshKey}
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

        <CollapsibleSection title="Pending Survey Approvals" defaultOpen={true}>
          <PendingApprovalsTable
            contract={contract}
            role="surveyor"
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

        <CollapsibleSection title="Survey Approval" defaultOpen={true}>
          <SurveyApprovalForm
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
import SurveyApprovalForm from "../components/SurveyApprovalForm";
import CollapsibleSection from "../components/CollapsibleSection";
import LandIdSelector from "../components/LandIdSelector";
import PageHeaderPanel from "../components/PageHeaderPanel";
import PendingApprovalsTable from "../components/PendingApprovalsTable";
import UploadedDocumentsViewer from "../components/UploadedDocumentsViewer";
import LandCoordinatesViewer from "../components/LandCoordinatesViewer";

export default function SurveyorPage({
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
          <div className="top-nav-title">Surveyor Dashboard</div>
        </div>
      </div>

      <div className="page-container">
        <Link to="/" className="back-link">← Back to Home</Link>

        <ConnectWallet
          account={account}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
        />

        <h1 className="page-title">Surveyor</h1>
        <p className="page-subtitle">
          Review the sale record and approve the survey stage.
        </p>

        <PageHeaderPanel
          account={account}
          connectWallet={connectWallet}
          contract={contract}
          latestCID=""
          expectedRole="Surveyor"
          useRoleGuard={true}
        />

        <DashboardRoleGate
          contract={contract}
          account={account}
          expectedRole="surveyor"
          expectedRoleLabel="Surveyor"
        >
          <LandIdSelector
            landId={selectedLandId}
            setLandId={setSelectedLandId}
            label="Active Surveyor Land ID"
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

          <CollapsibleSection title="Pending Survey Approvals" defaultOpen={true}>
            <PendingApprovalsTable
              contract={contract}
              role="surveyor"
              refreshKey={refreshKey}
              maxLandId={1000}
              onSelectLandId={setSelectedLandId}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Land Coordinates" defaultOpen={true}>
            <LandCoordinatesViewer
              contract={contract}
              selectedLandId={selectedLandId}
              refreshKey={refreshKey}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Uploaded Documents" defaultOpen={true}>
            <UploadedDocumentsViewer
              contract={contract}
              selectedLandId={selectedLandId}
              refreshKey={refreshKey}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Survey Approval" defaultOpen={true}>
            <SurveyApprovalForm
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