import { useState } from "react";
import toast from "react-hot-toast";

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);
      toast.success("Copied to clipboard");

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy text");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="small-btn secondary-btn"
      style={{
        marginLeft: "8px",
        width: "auto",
        display: "inline-flex"
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}