"use client";

import { useState, useRef } from "react";
import { Modal } from "antd";
import { Icon } from "@iconify/react";
import axios from "axios";
import { apiBasePharma } from "@/lib/config";
import { showNotification } from "@/lib/notification";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

export default function LoginModal({ open, onClose, onLoginSuccess }: LoginModalProps) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const resendInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startResendTimer = () => {
    setResendTimer(60);
    if (resendInterval.current) clearInterval(resendInterval.current);
    resendInterval.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(resendInterval.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpInput = (val: string, index: number) => {
    const digit = val.replace(/\D/g, "").slice(0, 1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpBackspace = (index: number) => {
    if (!otpDigits[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = (e.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...otpDigits];
    paste.split("").forEach((char, i) => { newDigits[i] = char; });
    setOtpDigits(newDigits);
    otpRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  const resetOtp = () => {
    setOtpSent(false);
    setOtpDigits(["", "", "", "", "", ""]);
    if (resendInterval.current) clearInterval(resendInterval.current);
    setResendTimer(0);
  };

  const handleCancel = () => {
    setPhone("");
    setOtpSent(false);
    setOtpDigits(["", "", "", "", "", ""]);
    if (resendInterval.current) clearInterval(resendInterval.current);
    setResendTimer(0);
    onClose();
  };

  const handleSendOtp = async () => {
    if (!phone) return showNotification("warning", "Phone number required");
    setIsLoading(true);
    try {
      const res = await axios.post(`${apiBasePharma}/send-otp`, { phone: `88${phone}` });
      setIsLoading(false);
      if (res?.data?.message) {
        showNotification("success", res.data.message);
        setOtpSent(true);
        startResendTimer();
      } else {
        showNotification("error", "Failed to send OTP");
      }
    } catch (error: unknown) {
      setIsLoading(false);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showNotification("error", axiosError.response?.data?.message || "Network or server error");
    }
  };

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length < 6) return showNotification("warning", "Please enter the full 6-digit OTP");
    setIsLoading(true);
    try {
      const res = await axios.post(`${apiBasePharma}/verify-otp`, { phone: `88${phone}`, otp });
      setIsLoading(false);
      if (res?.data?.status === "success") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("mobile", res.data.mobile);
        showNotification("success", res.data.message);
        onLoginSuccess(res.data.token);
        handleCancel();
      } else {
        showNotification("error", res?.data?.message || "Unexpected response");
      }
    } catch (error: unknown) {
      setIsLoading(false);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showNotification("error", axiosError.response?.data?.message || "Network or server error");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    otpSent ? handleVerifyOtp() : handleSendOtp();
  };

  return (
    <Modal open={open} title={null} footer={null} onCancel={handleCancel} centered width={900} styles={{ body: { padding: 0 } }}>
      <div className="w-full bg-white flex flex-col md:flex-row overflow-hidden">
        {/* Left Image Section */}
        <div className="hidden md:flex w-1/2 bg-[#f0faf7] flex-col items-center justify-center p-8">
          <img className="w-[85%] max-w-[320px]" src="/ousadbazar/images/loginmedi.svg" alt="Login" />
          <div className="text-center mt-6">
            <h3 className="text-lg font-bold text-gray-800">Quick & easy ordering process</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-[280px] mx-auto">Now you can order your medicine from Ousad Bazar.</p>
          </div>
          <div className="flex items-center gap-2 mt-5">
            <span className="w-6 h-2 rounded-full bg-[#388072]" />
            <span className="w-2 h-2 rounded-full bg-[#388072]/30" />
            <span className="w-2 h-2 rounded-full bg-[#388072]/30" />
          </div>
        </div>

        {/* Right Form Section */}
        <div className="flex-1 p-6 md:p-10">
          <div className="mb-5">
            <h1 className="text-2xl text-[#388072] font-bold mb-2">Login</h1>
            <p className="text-sm text-gray-500">Login to make an order, access your orders, special offers, health tips, and more!</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#388072]/30 focus-within:border-[#388072] transition-all">
                <div className="flex items-center gap-1.5 px-3 bg-[#388072] text-white text-sm font-medium shrink-0">
                  <span>(+88)</span><span>BD</span>
                  <Icon icon="mdi:chevron-down" className="w-4 h-4" />
                </div>
                <input
                  value={phone}
                  type="text"
                  maxLength={11}
                  disabled={otpSent}
                  placeholder="01XXXXXXXXX"
                  className={`flex-1 px-4 py-3 outline-none text-sm text-gray-700 placeholder-gray-400 bg-white ${otpSent ? "opacity-60 cursor-not-allowed" : ""}`}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                />
              </div>
              {otpSent && (
                <p className="text-xs text-[#388072] mt-1 cursor-pointer hover:underline" onClick={resetOtp}>Change number</p>
              )}
            </div>

            {otpSent && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
                <p className="text-xs text-gray-400 mb-3">A 6-digit code has been sent to +88{phone}</p>
                <div className="flex justify-between gap-2">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpInput(e.target.value, i)}
                      onKeyDown={(e) => e.key === "Backspace" && handleOtpBackspace(i)}
                      onPaste={handleOtpPaste}
                      className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg bg-white text-gray-700 outline-none focus:ring-2 focus:ring-[#388072]/30 focus:border-[#388072] transition-all"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-400">Didn&apos;t receive the code?</p>
                  <button type="button" disabled={resendTimer > 0} onClick={handleSendOtp} className={`text-xs font-semibold transition-colors ${resendTimer > 0 ? "text-gray-300 cursor-not-allowed" : "text-[#388072] hover:underline"}`}>
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="w-full py-3 font-semibold text-white bg-[#388072] rounded-lg hover:bg-[#2d6a5a] transition-all duration-300 flex justify-center items-center gap-2 shadow-md shadow-[#388072]/20">
              <span>{isLoading ? "Processing ..." : otpSent ? "Verify OTP" : "Send"}</span>
              {isLoading && <Icon className="w-5 h-5 animate-spin" icon="icon-park-outline:loading" />}
            </button>

            <p className="text-xs text-center text-gray-400 leading-relaxed">
              By continuing you agree to <span className="text-[#388072] font-medium cursor-pointer hover:underline">Terms & Conditions</span>, <span className="text-[#388072] font-medium cursor-pointer hover:underline">Privacy Policy</span> & <span className="text-[#388072] font-medium cursor-pointer hover:underline">Refund-Return Policy</span>
            </p>
          </form>
        </div>
      </div>
    </Modal>
  );
}
