"use client";

import React, { useCallback } from "react";
import axios from "axios";

const PaytmButton = ({ amount, orderId, customerId, email, mobile }) => {
  const handlePay = useCallback(async () => {
    // Only proceed in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.error("Cannot process payment in server environment");
      return;
    }

    try {
      const res = await axios.post("/api/paytm/initiate", {
        amount,
        orderId,
        customerId,
        email,
        mobile,
      });
      
      const paytmParams = res.data;
      
      // Create a form and submit to Paytm
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://securegw.paytm.in/theia/processTransaction";
      form.style.display = "none";
      
      // Add all parameters as hidden inputs
      Object.entries(paytmParams).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      
      // Add form to document and submit
      document.body.appendChild(form);
      form.submit();
      
      // Clean up the form after submission
      setTimeout(() => {
        if (document.body.contains(form)) {
          document.body.removeChild(form);
        }
      }, 1000);
    } catch (err) {
      console.error("Payment initiation failed:", err);
      alert("Failed to initiate payment. Please try again.");
    }
  }, [amount, orderId, customerId, email, mobile]);

  return (
    <button onClick={handlePay} className="btn btn-primary flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="20" height="20" rx="4" fill="#00B9F1"/>
        <text x="4" y="15" fontSize="10" fill="white" fontFamily="Arial, Helvetica, sans-serif">Paytm</text>
      </svg>
      Pay with Paytm
    </button>
  );
};

export default PaytmButton;
