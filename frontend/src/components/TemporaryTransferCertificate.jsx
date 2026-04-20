export default function TemporaryTransferCertificate({ certificateData }) {
  if (!certificateData) return null;

  const {
    referenceNo,
    approvalDate,
    landId,
    tctNumber,
    location,
    propertyType,
    previousOwner,
    newOwner,
    status
  } = certificateData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="card printable-certificate">
      <div className="certificate-header">
        <h2 className="section-title">Temporary Land Transfer Certificate</h2>
        <p className="section-note">
          This serves as temporary proof that the ownership transfer was finalized in the blockchain-based system.
        </p>
      </div>

      <div className="certificate-body">
        <div className="certificate-grid">
          <p><strong>Reference No.:</strong> {referenceNo}</p>
          <p><strong>Approval Date:</strong> {approvalDate}</p>
          <p><strong>Land ID:</strong> {landId}</p>
          <p><strong>TCT Number:</strong> {tctNumber}</p>
          <p><strong>Location:</strong> {location}</p>
          <p><strong>Property Type:</strong> {propertyType}</p>
          <p><strong>Previous Owner:</strong> {previousOwner}</p>
          <p><strong>New Owner:</strong> {newOwner}</p>
          <p><strong>Status:</strong> {status}</p>
        </div>

        <div className="panel-subtle" style={{ marginTop: "16px" }}>
          <p>
            <strong>Notice:</strong> Claim the original certificate at the Registry of Deeds within 14 days from approval.
          </p>
        </div>
      </div>

      <div className="card-actions no-print">
        <button onClick={handlePrint}>Print / Save as PDF</button>
      </div>
    </div>
  );
}