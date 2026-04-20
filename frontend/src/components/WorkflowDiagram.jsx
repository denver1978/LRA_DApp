import {
  Settings,
  BookText,
  Upload,
  FileText,
  Wallet,
  MapPinned,
  ReceiptText,
  Landmark,
  FolderSearch,
  ArrowDown
} from "lucide-react";
import CollapsibleSection from "./CollapsibleSection";

export default function WorkflowDiagram() {
  const steps = [
    {
      number: 1,
      title: "Owner / Admin",
      text: "Set authority addresses",
      icon: Settings,
      phase: "setup"
    },
    {
      number: 2,
      title: "Registry of Deeds",
      text: "Register land record",
      icon: BookText,
      phase: "setup"
    },
    {
      number: 3,
      title: "Seller",
      text: "Upload documents to IPFS",
      icon: Upload,
      phase: "sale"
    },
    {
      number: 4,
      title: "Seller",
      text: "Request sale transaction",
      icon: FileText,
      phase: "sale"
    },
    {
      number: 5,
      title: "Buyer",
      text: "Deposit escrow",
      icon: Wallet,
      phase: "sale"
    },
    {
      number: 6,
      title: "Surveyor",
      text: "Approve survey stage",
      icon: MapPinned,
      phase: "approval"
    },
    {
      number: 7,
      title: "BIR",
      text: "Approve tax/compliance stage",
      icon: ReceiptText,
      phase: "approval"
    },
    {
      number: 8,
      title: "City Treasury",
      text: "Approve treasury stage",
      icon: Landmark,
      phase: "approval"
    },
    {
      number: 9,
      title: "Assessor",
      text: "Approve assessor stage",
      icon: FolderSearch,
      phase: "approval"
    },
    {
      number: 10,
      title: "Registry of Deeds",
      text: "Finalize ownership transfer",
      icon: BookText,
      phase: "completion"
    }
  ];

  const getPhaseLabel = (phase) => {
    if (phase === "setup") return "Setup";
    if (phase === "sale") return "Sale";
    if (phase === "approval") return "Approval";
    if (phase === "completion") return "Completion";
    return "";
  };

  return (
    <CollapsibleSection title="Workflow Diagram" defaultOpen={false}>
      <p className="section-note">
        Visual sequence of the smart contract-based land transaction workflow.
      </p>

      <div className="workflow-legend">
        <span className="workflow-legend-item legend-setup">Setup</span>
        <span className="workflow-legend-item legend-sale">Sale</span>
        <span className="workflow-legend-item legend-approval">Approval</span>
        <span className="workflow-legend-item legend-completion">Completion</span>
      </div>

      <div className="workflow-diagram">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div key={step.number} className="workflow-step-wrapper">
              <div className={`workflow-step-card phase-${step.phase}`}>
                <div className={`workflow-step-number phase-number-${step.phase}`}>
                  {step.number}
                </div>

                <div className="workflow-step-content">
                  <div className={`workflow-phase-badge phase-badge-${step.phase}`}>
                    {getPhaseLabel(step.phase)}
                  </div>

                  <div className="workflow-step-icon-wrap">
                    <Icon className={`workflow-step-icon phase-icon-${step.phase}`} size={22} />
                  </div>

                  <div className="workflow-step-title">{step.title}</div>
                  <div className="workflow-step-text">{step.text}</div>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="workflow-arrow">
                  <ArrowDown size={22} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}