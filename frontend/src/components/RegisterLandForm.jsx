import { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const KNOWN_LOCATIONS = [
  "Session Road, Baguio City",
  "Burnham Area, Baguio City",
  "Aurora Hill, Baguio City",
  "Bakakeng, Baguio City",
  "Loakan, Baguio City",
  "Camp 7, Baguio City",
  "Engineer’s Hill, Baguio City"
];

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export default function RegisterLandForm({
  contract,
  latestCID,
  triggerRefresh,
  resetKey,
  onSuccessfulRegister,
  onRegisteredSuccess,
  selectedPendingRegistration
}) {
  const [landId, setLandId] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [tctNumber, setTctNumber] = useState("");
  const [location, setLocation] = useState("");
  const [otherLocation, setOtherLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [metadataCID, setMetadataCID] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  const clearForm = () => {
    setLandId("");
    setOwnerAddress("");
    setTctNumber("");
    setLocation("");
    setOtherLocation("");
    setPropertyType("");
    setMetadataCID("");
  };

  const fetchMetadataAndAutofill = async (cid, showErrorToast = false) => {
    try {
      if (!cid) return;

      setLoadingMetadata(true);

      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      if (!response.ok) {
        throw new Error("Failed to load metadata from IPFS");
      }

      const metadata = await response.json();
      const landReference = metadata?.landReference;

      setMetadataCID(cid);

      if (!landReference) return;

      if (landReference.owner) setOwnerAddress(landReference.owner);
      if (landReference.tctNumber) setTctNumber(landReference.tctNumber);
      if (landReference.propertyType) setPropertyType(landReference.propertyType);

      if (landReference.location) {
        if (KNOWN_LOCATIONS.includes(landReference.location)) {
          setLocation(landReference.location);
          setOtherLocation("");
        } else {
          setLocation("Other");
          setOtherLocation(landReference.location);
        }
      }
    } catch (error) {
      console.error("Metadata autofill error:", error);
      setMetadataCID(cid);
      if (showErrorToast) {
        toast.error(error.message || "Failed to auto-fill from metadata.");
      }
    } finally {
      setLoadingMetadata(false);
    }
  };

  // Only auto-fill from latestCID if no selected pending registration
  // and only if the form does not already have a CID.
  useEffect(() => {
    if (!latestCID) return;
    if (selectedPendingRegistration) return;
    if (metadataCID) return;

    fetchMetadataAndAutofill(latestCID, false);
  }, [latestCID, selectedPendingRegistration, metadataCID]);

  useEffect(() => {
    clearForm();
  }, [resetKey]);

  useEffect(() => {
    if (!selectedPendingRegistration) return;

    setLandId(selectedPendingRegistration.landId || "");
    setOwnerAddress(selectedPendingRegistration.ownerAddress || "");
    setTctNumber(selectedPendingRegistration.tctNumber || "");
    setPropertyType(selectedPendingRegistration.propertyType || "");
    setMetadataCID(selectedPendingRegistration.metadataCID || "");

    if (KNOWN_LOCATIONS.includes(selectedPendingRegistration.location)) {
      setLocation(selectedPendingRegistration.location);
      setOtherLocation("");
    } else {
      setLocation("Other");
      setOtherLocation(selectedPendingRegistration.location || "");
    }

    // Only fetch metadata if there is a CID and we want a quiet refresh
    if (selectedPendingRegistration.metadataCID) {
      fetchMetadataAndAutofill(selectedPendingRegistration.metadataCID, false);
    }
  }, [selectedPendingRegistration]);

  const finalLocation = location === "Other" ? otherLocation : location;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!contract) {
        toast.error("Please connect wallet first.");
        return;
      }

      if (!landId) {
        toast.error("Please enter Land ID.");
        return;
      }

      if (!ownerAddress || !ethers.isAddress(ownerAddress.trim())) {
        toast.error("Owner Address must be a valid Ethereum address.");
        return;
      }

      if (ownerAddress.trim().toLowerCase() === ZERO_ADDRESS.toLowerCase()) {
        toast.error("Owner Address cannot be the zero address.");
        return;
      }

      if (!tctNumber.trim()) {
        toast.error("Please enter TCT Number.");
        return;
      }

      if (!finalLocation.trim()) {
        toast.error("Please select or enter a location.");
        return;
      }

      if (!propertyType) {
        toast.error("Please select a property type.");
        return;
      }

      if (!metadataCID.trim()) {
        toast.error("Metadata CID is required.");
        return;
      }

      setLoading(true);

      const tx = await contract.registerLand(
        BigInt(landId),
        ownerAddress.trim(),
        tctNumber.trim(),
        finalLocation.trim(),
        propertyType.trim(),
        metadataCID.trim()
      );

      await tx.wait();

      if (selectedPendingRegistration?.localId) {
        const saved = JSON.parse(localStorage.getItem("pendingPreRegistrations") || "[]");

        const updated = saved.map((item) =>
          item.localId === selectedPendingRegistration.localId
            ? { ...item, status: "registered" }
            : item
        );

        localStorage.setItem("pendingPreRegistrations", JSON.stringify(updated));
      }

      toast.success("Land registered successfully. Forms cleared for next registration...");

      if (onRegisteredSuccess) {
        onRegisteredSuccess({
          landId,
          tctNumber,
          metadataCID
        });
      }

      clearForm();

      if (triggerRefresh) triggerRefresh();
      if (onSuccessfulRegister) onSuccessfulRegister();
    } catch (error) {
      console.error("Register land error:", error);
      toast.error(
        error?.reason ||
          error?.shortMessage ||
          error?.message ||
          error?.info?.error?.message ||
          "Transaction failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="section-title">Register Land</h2>
      <p className="section-note">
        Enter the core land record details for on-chain registration.
      </p>

      {latestCID && !selectedPendingRegistration && (
        <div className="panel-subtle" style={{ marginBottom: "14px" }}>
          <p><strong>Latest Upload CID Detected:</strong> {latestCID}</p>
          <p className="form-help">
            {loadingMetadata
              ? "Loading metadata and auto-filling form..."
              : "Form fields were auto-filled from the latest uploaded metadata when available."}
          </p>
        </div>
      )}

      {selectedPendingRegistration && (
        <div className="panel-subtle" style={{ marginBottom: "14px" }}>
          <p><strong>Selected Pending Pre-Registration Loaded</strong></p>
          <p className="form-help">
            The form is using the owner and property details from the selected pending pre-registration.
          </p>
        </div>
      )}

      <div className="form-grid">
        <div className="form-row">
          <label className="form-label">Land ID</label>
          <input
            type="number"
            placeholder="e.g. 1"
            value={landId}
            onChange={(e) => setLandId(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="form-label">Owner Address</label>
          <input
            type="text"
            placeholder="0x..."
            value={ownerAddress}
            onChange={(e) => setOwnerAddress(e.target.value)}
            readOnly={!!selectedPendingRegistration}
          />
          {selectedPendingRegistration && (
            <p className="form-help">Auto-filled from selected pending pre-registration.</p>
          )}
        </div>

        <div className="form-row">
          <label className="form-label">TCT Number</label>
          <input
            type="text"
            placeholder="Enter TCT Number"
            value={tctNumber}
            onChange={(e) => setTctNumber(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="form-label">Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Select Location</option>
            <option value="Session Road, Baguio City">Session Road, Baguio City</option>
            <option value="Burnham Area, Baguio City">Burnham Area, Baguio City</option>
            <option value="Aurora Hill, Baguio City">Aurora Hill, Baguio City</option>
            <option value="Bakakeng, Baguio City">Bakakeng, Baguio City</option>
            <option value="Loakan, Baguio City">Loakan, Baguio City</option>
            <option value="Camp 7, Baguio City">Camp 7, Baguio City</option>
            <option value="Engineer’s Hill, Baguio City">Engineer’s Hill, Baguio City</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {location === "Other" && (
          <div className="form-row">
            <label className="form-label">Specify Location</label>
            <input
              type="text"
              placeholder="Enter exact location"
              value={otherLocation}
              onChange={(e) => setOtherLocation(e.target.value)}
            />
          </div>
        )}

        <div className="form-row">
          <label className="form-label">Property Type</label>
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
            <option value="">Select Property Type</option>
            <option value="House and Lot">House and Lot</option>
            <option value="Lot Only">Lot Only</option>
            <option value="Condo-Unit">Condo-Unit</option>
          </select>
        </div>

        <div className="form-row">
          <label className="form-label">Metadata CID</label>
          <input
            type="text"
            placeholder="IPFS CID"
            value={metadataCID}
            onChange={(e) => setMetadataCID(e.target.value)}
          />
          {latestCID && !selectedPendingRegistration && (
            <p className="form-help">Auto-filled from latest uploaded metadata.</p>
          )}
        </div>
      </div>

      <div className="card-actions">
        <button type="submit" disabled={loading || loadingMetadata}>
          {loading ? "Registering..." : "Register Land"}
        </button>
      </div>
    </form>
  );
}