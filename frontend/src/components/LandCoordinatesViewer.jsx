import { useEffect, useState } from "react";

export default function LandCoordinatesViewer({
  contract,
  selectedLandId,
  refreshKey
}) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCoordinates = async () => {
      try {
        setLatitude("");
        setLongitude("");
        setError("");

        if (!contract || !selectedLandId) return;

        setLoading(true);

        const land = await contract.lands(BigInt(selectedLandId));

        if (!land || !land.exists) {
          setError("Land record not found.");
          return;
        }

        if (!land.metadataCID) {
          setError("No metadata found.");
          return;
        }

        const res = await fetch(
          `https://gateway.pinata.cloud/ipfs/${land.metadataCID}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch metadata.");
        }

        const data = await res.json();

        const lat = data?.coordinates?.latitude || "";
        const lng = data?.coordinates?.longitude || "";

        if (!lat || !lng) {
          setError("Coordinates not available in metadata.");
          return;
        }

        setLatitude(lat);
        setLongitude(lng);
      } catch (err) {
        console.error(err);
        setError("Failed to load coordinates.");
      } finally {
        setLoading(false);
      }
    };

    loadCoordinates();
  }, [contract, selectedLandId, refreshKey]);

  const mapLink =
    latitude && longitude
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : "";

  return (
    <div className="card">
      <h2 className="section-title">Land Coordinates</h2>
      <p className="section-note">
        View land location using geographic coordinates.
      </p>

      {!selectedLandId && (
        <p className="section-note">Select a Land ID first.</p>
      )}

      {loading && <p>Loading coordinates...</p>}

      {error && (
        <div className="panel-subtle">
          <p>{error}</p>
        </div>
      )}

      {latitude && longitude && (
        <>
          <div className="panel-subtle">
            <p><strong>Latitude:</strong> {latitude}</p>
            <p><strong>Longitude:</strong> {longitude}</p>
          </div>

          <div className="card-actions">
            <a
              href={mapLink}
              target="_blank"
              rel="noreferrer"
              className="table-link-btn"
            >
              View on Map
            </a>
          </div>
        </>
      )}
    </div>
  );
}