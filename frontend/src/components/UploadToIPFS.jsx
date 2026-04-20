import { useState } from "react";

export default function UploadToIPFS() {
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    try {
      if (!file) {
        alert("Please choose a file first.");
        return;
      }

      const jwt = import.meta.env.VITE_PINATA_JWT;

      if (!jwt) {
        alert("Pinata JWT not found in .env");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Upload failed.");
      }

      setCid(data.IpfsHash);
      alert("File uploaded successfully.");
    } catch (error) {
      console.error("IPFS upload error:", error);
      alert(error?.message || "Failed to upload file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #ccc" }}>
      <h2>Upload File to IPFS</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <br />

      <button onClick={handleUpload} disabled={loading} style={{ marginTop: "10px" }}>
        {loading ? "Uploading..." : "Upload to IPFS"}
      </button>

      {cid && (
        <div style={{ marginTop: "15px" }}>
          <p><strong>IPFS CID:</strong> {cid}</p>
          <p><strong>Gateway URL:</strong> https://gateway.pinata.cloud/ipfs/{cid}</p>
        </div>
      )}
    </div>
  );
}