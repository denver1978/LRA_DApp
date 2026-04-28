import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import CopyButton from "./CopyButton";
import ExplorerLink from "./ExplorerLink";

export default function MultiFileUploadToIPFS({
  setLatestCID,
  contract,
  selectedLandId = "",
  resetKey
}) {
  const [landId, setLandId] = useState(selectedLandId || "");
  const [landExists, setLandExists] = useState(false);
  const [landInfo, setLandInfo] = useState(null);

  const [ownerAddress, setOwnerAddress] = useState("");
  const [tctNumber, setTctNumber] = useState("");
  const [location, setLocation] = useState("");
  const [otherLocation, setOtherLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [metadataCID, setMetadataCID] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingLand, setLoadingLand] = useState(false);

  const fileInputRef = useRef(null);

  const activeLandId = selectedLandId || landId;

  const knownLocations = [
    "Session Road, Baguio City",
    "Burnham Area, Baguio City",
    "Aurora Hill, Baguio City",
    "Bakakeng, Baguio City",
    "Loakan, Baguio City",
    "Camp 7, Baguio City",
    "Engineer’s Hill, Baguio City"
  ];

  const clearForm = () => {
    setLandId(selectedLandId || "");
    setLandExists(false);
    setLandInfo(null);
    setOwnerAddress("");
    setTctNumber("");
    setLocation("");
    setOtherLocation("");
    setPropertyType("");
    setLatitude("");
    setLongitude("");
    setFiles([]);
    setUploadedFiles([]);
    setMetadataCID("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearInputsAfterUpload = () => {
    setLandId(selectedLandId || "");
    setLandExists(false);
    setLandInfo(null);
    setOwnerAddress("");
    setTctNumber("");
    setLocation("");
    setOtherLocation("");
    setPropertyType("");
    setLatitude("");
    setLongitude("");
    setFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    clearForm();
  }, [resetKey]);

  const loadLandReference = async (showToast = true) => {
    try {
      if (!contract) {
        if (showToast) toast.error("Connect wallet first");
        return;
      }

      if (!activeLandId) {
        if (showToast) toast.error("Enter Land ID first");
        return;
      }

      setLoadingLand(true);

      const land = await contract.lands(BigInt(activeLandId));

      if (!land.exists) {
        setLandExists(false);
        setLandInfo(null);

        if (showToast) {
          toast("Land record does not exist yet. You can continue with pre-registration upload.");
        }
        return;
      }

      const info = {
        landId: land.landId.toString(),
        tctNumber: land.tctNumber,
        location: land.location,
        propertyType: land.propertyType,
        owner: land.owner,
        metadataCID: land.metadataCID
      };

      setLandExists(true);
      setLandInfo(info);

      setOwnerAddress(info.owner || "");
      setTctNumber(info.tctNumber || "");
      setPropertyType(info.propertyType || "");

      if (knownLocations.includes(info.location)) {
        setLocation(info.location);
        setOtherLocation("");
      } else {
        setLocation("Other");
        setOtherLocation(info.location || "");
      }

      setLatitude("");
      setLongitude("");

      if (showToast) toast.success("Land reference loaded");
    } catch (error) {
      console.error("Load land reference error:", error);
      setLandExists(false);
      setLandInfo(null);

      if (showToast) {
        toast("Land record does not exist yet. You can continue with pre-registration upload.");
      }
    } finally {
      setLoadingLand(false);
    }
  };

  useEffect(() => {
    if (selectedLandId && contract) {
      setLandId(selectedLandId);
      loadLandReference(false);
    }
  }, [selectedLandId, contract]);

  const uploadSingleFile = async (file, jwt) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || data?.message || `Failed to upload ${file.name}`);
    }

    return {
      name: file.name,
      cid: data.IpfsHash,
      type: file.type,
      size: file.size
    };
  };

  const uploadMetadataJSON = async (metadata, jwt) => {
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`
      },
      body: JSON.stringify({
        pinataContent: metadata
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || data?.message || "Failed to upload metadata JSON");
    }

    return data.IpfsHash;
  };

  const handleUpload = async () => {
    try {
      const jwt = import.meta.env.VITE_PINATA_JWT;
      const finalLocation = location === "Other" ? otherLocation : location;

      if (!jwt) {
        toast.error("Pinata JWT not found in .env");
        return;
      }

      if (!files.length) {
        toast.error("Please choose at least one file.");
        return;
      }

      if (!tctNumber.trim()) {
        toast.error("Please enter TCT Number.");
        return;
      }

      if (!finalLocation.trim()) {
        toast.error("Please select or enter Location.");
        return;
      }

      if (!propertyType.trim()) {
        toast.error("Please select Property Type.");
        return;
      }

      if (!ownerAddress.trim()) {
        toast.error("Please enter Owner Address.");
        return;
      }

      if (!latitude.trim()) {
        toast.error("Please enter Latitude.");
        return;
      }

      if (!longitude.trim()) {
        toast.error("Please enter Longitude.");
        return;
      }

      setLoading(true);
      setUploadedFiles([]);
      setMetadataCID("");

      const fileResults = [];

      for (const file of files) {
        const uploaded = await uploadSingleFile(file, jwt);
        fileResults.push(uploaded);
      }

      setUploadedFiles(fileResults);

      const metadata = {
        registrationMode: landExists ? "existing-land-reference" : "pre-registration",
        landReference: {
          landId: activeLandId || "",
          tctNumber: tctNumber.trim(),
          location: finalLocation.trim(),
          propertyType: propertyType.trim(),
          owner: ownerAddress.trim(),
          previousMetadataCID: landInfo?.metadataCID || ""
        },
        coordinates: {
          latitude: latitude.trim(),
          longitude: longitude.trim()
        },
        files: fileResults,
        uploadedAt: new Date().toISOString()
      };

      const finalMetadataCID = await uploadMetadataJSON(metadata, jwt);
      setMetadataCID(finalMetadataCID);

      if (setLatestCID) {
        setLatestCID(finalMetadataCID);
      }

      const pendingItem = {
        localId: Date.now().toString(),
        landId: activeLandId || "",
        ownerAddress: ownerAddress.trim(),
        tctNumber: tctNumber.trim(),
        location: finalLocation.trim(),
        propertyType: propertyType.trim(),
        latitude: latitude.trim(),
        longitude: longitude.trim(),
        metadataCID: finalMetadataCID,
        uploadedAt: new Date().toISOString(),
        status: "pending"
      };

      const existingPending =
        JSON.parse(localStorage.getItem("pendingPreRegistrations") || "[]");

      existingPending.push(pendingItem);

      localStorage.setItem(
        "pendingPreRegistrations",
        JSON.stringify(existingPending)
      );

      toast.success("Files uploaded successfully. Metadata CID is ready for Register Land.");

      // Clear only the inputs for next upload,
      // keep uploadedFiles + metadataCID visible as proof of success
      clearInputsAfterUpload();
    } catch (error) {
      console.error("Multi-file IPFS upload error:", error);
      toast.error(error?.message || "Failed to upload files.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Pre-Registration</h2>
      <p className="section-note">
        For new land records, upload files first to generate a Metadata CID. For existing land records, you may load the land reference.
      </p>

      <div className="form-row">
        <label className="form-label">Land ID</label>
        <input
          type="number"
          placeholder="Enter Land ID (optional for new record reference)"
          value={landId}
          onChange={(e) => setLandId(e.target.value)}
          readOnly={!!selectedLandId}
        />
        <p className="form-help">
          If this Land ID does not exist yet, continue with pre-registration upload.
        </p>
      </div>

      <div className="card-actions">
        <button onClick={() => loadLandReference(true)} disabled={loadingLand}>
          {loadingLand ? "Checking Land..." : "Check / Load Land Reference"}
        </button>
      </div>

      {landExists && landInfo && (
        <div className="panel-subtle" style={{ marginTop: "14px" }}>
          <p><strong>Mode:</strong> Existing Land Reference</p>
          <p><strong>Land ID:</strong> {landInfo.landId}</p>
          <p><strong>TCT Number:</strong> {landInfo.tctNumber}</p>
          <p><strong>Location:</strong> {landInfo.location}</p>
          <p><strong>Property Type:</strong> {landInfo.propertyType}</p>
          <p><strong>Owner:</strong> {landInfo.owner}</p>
        </div>
      )}

      {!landExists && (
        <div className="panel-subtle" style={{ marginTop: "14px" }}>
          <p><strong>Mode:</strong> Pre-registration Upload</p>
          <p>
            This land is not yet registered on-chain. Enter the property details below, upload files,
            then use the generated Metadata CID in Register Land.
          </p>
        </div>
      )}

      <div className="form-grid" style={{ marginTop: "14px" }}>
        <div className="form-row">
          <label className="form-label">Owner Address</label>
          <input
            type="text"
            placeholder="0x..."
            value={ownerAddress}
            onChange={(e) => setOwnerAddress(e.target.value)}
          />
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
          <label className="form-label">Latitude</label>
          <input
            type="text"
            placeholder="e.g. 16.4023"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="form-label">Longitude</label>
          <input
            type="text"
            placeholder="e.g. 120.5960"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="form-label">Select Files</label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
          />
          <p className="form-help">
            Upload title image, tax declaration, deed of sale, survey map, property photo, and other supporting documents.
          </p>
        </div>
      </div>

      <div className="card-actions">
        <button onClick={handleUpload} disabled={loading || loadingLand}>
          {loading ? "Uploading..." : "Upload Files + Generate Metadata CID"}
        </button>
      </div>

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: "15px" }}>
          <h3 className="section-title" style={{ fontSize: "18px" }}>Uploaded Files</h3>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="panel-subtle" style={{ marginBottom: "10px" }}>
              <p><strong>Name:</strong> {file.name}</p>
              <p><strong>Type:</strong> {file.type}</p>
              <p>
                <strong>CID:</strong> {file.cid}
                <CopyButton text={file.cid} />
                <ExplorerLink type="ipfs" value={file.cid} />
              </p>
            </div>
          ))}
        </div>
      )}

      {metadataCID && (
        <div style={{ marginTop: "15px" }}>
          <h3 className="section-title" style={{ fontSize: "18px" }}>Final Metadata CID</h3>
          <div className="panel-subtle">
            <p>
              <strong>Metadata CID:</strong> {metadataCID}
              <CopyButton text={metadataCID} />
              <ExplorerLink type="ipfs" value={metadataCID} />
            </p>
            <p className="form-help">
              Use this Metadata CID in the Register Land form.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}