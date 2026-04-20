import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageHeaderPanel from "../components/PageHeaderPanel";
import RegisterLandForm from "../components/RegisterLandForm";
import ViewLand from "../components/ViewLand";
import QuickStatsCards from "../components/QuickStatsCards";
import TransactionProgressTracker from "../components/TransactionProgressTracker";
import ActivityLog from "../components/ActivityLog";
import RDFinalApprovalForm from "../components/RDFinalApprovalForm";
import MarkOwnerDeceasedForm from "../components/MarkOwnerDeceasedForm";
import ResolveSuccessionForm from "../components/ResolveSuccessionForm";
import CancelSaleForm from "../components/CancelSaleForm";
import MultiFileUploadToIPFS from "../components/MultiFileUploadToIPFS";
import TransactionReferenceSlip from "../components/TransactionReferenceSlip";
import CollapsibleSection from "../components/CollapsibleSection";
import LandIdSelector from "../components/LandIdSelector";
import LastRegisteredPanel from "../components/LastRegisteredPanel";
import PendingPreRegistrations from "../components/PendingPreRegistrations";
import PendingApprovalsTable from "../components/PendingApprovalsTable";
import UploadedDocumentsViewer from "../components/UploadedDocumentsViewer";
import RDPropertyTransferListing from "../components/RDPropertyTransferListing";
import TransferCertificateViewer from "../components/TransferCertificateViewer";

export default function RDPage({
  account,
  connectWallet,
  contract,
  latestCID,
  setLatestCID,
  refreshKey,
  triggerRefresh,
  registrationResetKey,
  triggerRegistrationReset
}) {
  const [selectedLandId, setSelectedLandId] = useState("");
  const [lastRegistered, setLastRegistered] = useState(null);
  const [selectedPendingRegistration, setSelectedPendingRegistration] = useState(null);
  const registerLandRef = useRef(null);

  const scrollToRegisterLand = () => {
    if (registerLandRef.current) {
      registerLandRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

  useEffect(() => {
    setSelectedLandId("");
    setSelectedPendingRegistration(null);
  }, [registrationResetKey]);

  return (
    <>
      <div className="top-nav">
        <div className="top-nav-inner">
          <div className="top-nav-title">Registry of Deeds Dashboard</div>
        </div>
      </div>

      <div className="page-container">
        <Link to="/" className="back-link">← Back to Home</Link>

        <h1 className="page-title">Registry of Deeds</h1>
        <p className="page-subtitle">
          Register land, finalize transfer, cancel eligible sales, and handle succession cases.
        </p>

        <PageHeaderPanel
          account={account}
          connectWallet={connectWallet}
          contract={contract}
          latestCID={latestCID}
          expectedRole="Registry of Deeds"
          useRoleGuard={true}
        />

        <LandIdSelector
          landId={selectedLandId}
          setLandId={setSelectedLandId}
          label="Active RD Land ID"
        />

        <CollapsibleSection title="Upload Documents to IPFS" defaultOpen={true}>
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

        <CollapsibleSection title="Pending Pre-Registrations" defaultOpen={true}>
          <PendingPreRegistrations
            refreshKey={refreshKey}
            onSelectPending={(item) => {
              setSelectedPendingRegistration(item);
              setSelectedLandId(item?.landId || "");
            }}
            onAfterSelect={scrollToRegisterLand}
          />
        </CollapsibleSection>
        
        <div ref={registerLandRef}>
          <CollapsibleSection title="Register Land" defaultOpen={true}>
            <RegisterLandForm
              contract={contract}
              latestCID={latestCID}
              triggerRefresh={triggerRefresh}
              resetKey={registrationResetKey}
              onSuccessfulRegister={triggerRegistrationReset}
              onRegisteredSuccess={setLastRegistered}
              selectedPendingRegistration={selectedPendingRegistration}
            />
          </CollapsibleSection>
        </div>

        <LastRegisteredPanel lastRegistered={lastRegistered} />

        <CollapsibleSection title="View Land">
          <ViewLand
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

        <CollapsibleSection title="Property Transfer Listing" defaultOpen={true}>
          <RDPropertyTransferListing
            contract={contract}
            refreshKey={refreshKey}
            onSelectLandId={setSelectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Pending RD Final Approvals" defaultOpen={true}>
          <PendingApprovalsTable
            contract={contract}
            role="rd"
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
        
        <CollapsibleSection title="RD Final Approval">
          <RDFinalApprovalForm
            contract={contract}
            latestCID={latestCID}
            triggerRefresh={triggerRefresh}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Mark Owner Deceased">
          <MarkOwnerDeceasedForm
            contract={contract}
            triggerRefresh={triggerRefresh}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Resolve Succession">
          <ResolveSuccessionForm
            contract={contract}
            latestCID={latestCID}
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
          <TransferCertificateViewer selectedLandId={selectedLandId} />
        </CollapsibleSection>

        <CollapsibleSection title="Cancel Sale">
          <CancelSaleForm
            contract={contract}
            triggerRefresh={triggerRefresh}
            selectedLandId={selectedLandId}
          />
        </CollapsibleSection>
      </div>
    </>
  );
}