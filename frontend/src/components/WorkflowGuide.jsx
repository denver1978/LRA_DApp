import CollapsibleSection from "./CollapsibleSection";

export default function WorkflowGuide() {
  const steps = [
    "Owner / Admin sets authority addresses",
    "Registry of Deeds registers the land record",
    "Seller uploads documents to IPFS",
    "Seller requests sale transaction",
    "Buyer deposits escrow",
    "Surveyor approves survey stage",
    "BIR approves tax/compliance stage",
    "City Treasury approves treasury stage",
    "Assessor approves assessor stage",
    "Registry of Deeds finalizes ownership transfer"
  ];

  return (
    <CollapsibleSection title="Full Smart Contract Workflow Guide" defaultOpen={false}>
      <p className="section-note">
        Use this sequence during presentation to demonstrate the full smart contract workflow.
      </p>

      <div className="form-grid">
        {steps.map((step, index) => (
          <div
            key={index}
            className="panel-subtle"
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start"
            }}
          >
            <span className="info-pill">{index + 1}</span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}