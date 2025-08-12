import React, { useState } from "react";
import Modal from "./Modal";
import api from "../utils/api";

const DownloadAccountDataModal = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleDownload = async () => {
    // Only proceed in browser environment
    if (typeof window === 'undefined') return;
    
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      const response = await api.get("/users/download-data", { responseType: "blob" });
      if (!response.success) throw new Error(response.error || 'Failed to download data');
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `alumni-data-${new Date().toISOString().split('T')[0]}.json`);
      
      // Append to body, trigger download, and clean up
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 0);
      
      setSuccess("Your account data has been downloaded.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to download account data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Download Account Data" size="sm">
      <div className="space-y-4">
        <p>Click below to download all your account data as a JSON file.</p>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleDownload}
            disabled={loading}
          >
            {loading ? "Downloading..." : "Download Data"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DownloadAccountDataModal;
