import React, { useState } from "react";
import Modal from "./Modal";
import axios from "axios";

const TwoFactorAuthModal = ({ open, onClose, enabled, onStatusChange }) => {
  const [step, setStep] = useState("init"); // init | verify | success
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSetup = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/users/2fa/setup");
      if (res.data && res.data.secret) {
        setStep("verify");
      } else {
        setError("Failed to generate 2FA secret.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start 2FA setup.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/users/2fa/verify", { code });
      setSuccess("Two-factor authentication enabled!");
      onStatusChange(true);
      setStep("success");
    } catch (err) {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/users/2fa/disable");
      setSuccess("Two-factor authentication disabled.");
      onStatusChange(false);
      setStep("init");
    } catch (err) {
      setError("Failed to disable 2FA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Two-Factor Authentication">
      <div className="space-y-4">
        {enabled ? (
          <>
            <p>Two-factor authentication is currently <span className="text-green-600 font-semibold">enabled</span> on your account.</p>
            <button className="btn-danger" onClick={handleDisable} disabled={loading}>
              {loading ? "Disabling..." : "Disable 2FA"}
            </button>
            {success && <div className="text-green-600 text-sm">{success}</div>}
            {error && <div className="text-red-600 text-sm">{error}</div>}
          </>
        ) : (
          <>
            {step === "init" && (
              <button className="btn-primary" onClick={handleSetup} disabled={loading}>
                {loading ? "Starting..." : "Start 2FA Setup"}
              </button>
            )}
            {step === "verify" && (
              <form onSubmit={e => { e.preventDefault(); handleVerify(); }} className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Enter the 2FA code sent to your email or authenticator app:</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="input-field w-full"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Enable"}
                </button>
                {error && <div className="text-red-600 text-sm">{error}</div>}
              </form>
            )}
            {step === "success" && (
              <div className="text-green-600">Two-factor authentication enabled!</div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default TwoFactorAuthModal;
