"use client";

import { useState, useRef } from "react";
import { Modal } from "antd";
import { Icon } from "@iconify/react";
import axios from "axios";
import { apiBasePharma, asset } from "@/lib/config";
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
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#eef0fb] via-[#e4e8f7] to-[#dde2f6] flex-col items-center justify-center p-8 relative overflow-hidden">
          <span className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full bg-[#012068]/10 blur-2xl" />
          <span className="pointer-events-none absolute -bottom-12 -right-10 w-48 h-48 rounded-full bg-[#7c88c9]/20 blur-2xl" />

          <svg
            className="w-[85%] max-w-[320px] relative"
            viewBox="0 0 320 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <ellipse cx="160" cy="250" rx="120" ry="10" fill="#012068" fillOpacity="0.08" />

            <rect x="92" y="40" width="136" height="200" rx="20" fill="#012068" />
            <rect x="100" y="48" width="120" height="184" rx="14" fill="#ffffff" />

            <rect x="144" y="54" width="32" height="4" rx="2" fill="#012068" fillOpacity="0.2" />

            <rect x="112" y="70" width="96" height="28" rx="8" fill="#eef0fb" />
            <circle cx="126" cy="84" r="6" fill="#012068" />
            <rect x="138" y="78" width="56" height="4" rx="2" fill="#012068" fillOpacity="0.4" />
            <rect x="138" y="86" width="38" height="4" rx="2" fill="#012068" fillOpacity="0.2" />

            <rect x="112" y="108" width="44" height="44" rx="10" fill="#eef0fb" />
            <path
              d="M126 120v12M120 126h12"
              stroke="#012068"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect x="134" y="138" width="12" height="10" rx="2" fill="#012068" fillOpacity="0.3" />

            <rect x="164" y="108" width="44" height="44" rx="10" fill="#012068" />
            <rect x="176" y="120" width="20" height="20" rx="4" fill="#ffffff" />
            <path d="M183 128h6M186 125v6" stroke="#012068" strokeWidth="2" strokeLinecap="round" />

            <rect x="112" y="162" width="96" height="14" rx="7" fill="#eef0fb" />
            <rect x="116" y="166" width="60" height="6" rx="3" fill="#012068" fillOpacity="0.4" />

            <rect x="112" y="184" width="96" height="14" rx="7" fill="#eef0fb" />
            <rect x="116" y="188" width="44" height="6" rx="3" fill="#012068" fillOpacity="0.4" />

            <rect x="112" y="208" width="96" height="18" rx="9" fill="#012068" />
            <rect x="144" y="214" width="32" height="6" rx="3" fill="#ffffff" />

            <g transform="translate(34 78) rotate(-20)">
              <rect width="56" height="24" rx="12" fill="#ffffff" stroke="#012068" strokeWidth="2" />
              <rect x="28" width="28" height="24" rx="12" fill="#012068" />
              <line x1="28" y1="0" x2="28" y2="24" stroke="#012068" strokeWidth="2" />
            </g>

            <g transform="translate(238 60) rotate(25)">
              <rect width="50" height="22" rx="11" fill="#ffffff" stroke="#012068" strokeWidth="2" />
              <rect x="25" width="25" height="22" rx="11" fill="#f59e0b" />
              <line x1="25" y1="0" x2="25" y2="22" stroke="#012068" strokeWidth="2" />
            </g>

            <g transform="translate(30 180)">
              <circle cx="22" cy="22" r="22" fill="#ffffff" stroke="#012068" strokeWidth="2" />
              <path d="M18 14h8v8h8v8h-8v8h-8v-8h-8v-8h8z" fill="#012068" />
            </g>

            <circle cx="264" cy="180" r="10" fill="#012068" fillOpacity="0.25" />
            <circle cx="278" cy="200" r="6" fill="#012068" fillOpacity="0.4" />
            <circle cx="50" cy="60" r="5" fill="#012068" fillOpacity="0.3" />
          </svg>

          <div className="text-center mt-6 relative">
            <h3 className="text-lg font-bold text-gray-800">Quick & easy ordering process</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-[280px] mx-auto">Now you can order your medicine from Ousad Bazar.</p>
          </div>
          <div className="flex items-center gap-2 mt-5 relative">
            <span className="w-6 h-2 rounded-full bg-[#012068]" />
            <span className="w-2 h-2 rounded-full bg-[#012068]/30" />
            <span className="w-2 h-2 rounded-full bg-[#012068]/30" />
          </div>
        </div>

        {/* Right Form Section */}
        <div className="flex-1 p-6 md:p-10">
          <div className="mb-5">
            <h1 className="text-2xl text-[#012068] font-bold mb-2">Login</h1>
            <p className="text-sm text-gray-500">Login to make an order, access your orders, special offers, health tips, and more!</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#012068]/30 focus-within:border-[#012068] transition-all">
                <div className="flex items-center gap-1.5 px-3 bg-[#012068] text-white text-sm font-medium shrink-0">
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
                <p className="text-xs text-[#012068] mt-1 cursor-pointer hover:underline" onClick={resetOtp}>Change number</p>
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
                      className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg bg-white text-gray-700 outline-none focus:ring-2 focus:ring-[#012068]/30 focus:border-[#012068] transition-all"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-400">Didn&apos;t receive the code?</p>
                  <button type="button" disabled={resendTimer > 0} onClick={handleSendOtp} className={`text-xs font-semibold transition-colors ${resendTimer > 0 ? "text-gray-300 cursor-not-allowed" : "text-[#012068] hover:underline"}`}>
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="w-full py-3 font-semibold text-white bg-[#012068] rounded-lg hover:bg-[#012068] transition-all duration-300 flex justify-center items-center gap-2 shadow-md shadow-[#012068]/20">
              <span>{isLoading ? "Processing ..." : otpSent ? "Verify OTP" : "Send"}</span>
              {isLoading && <Icon className="w-5 h-5 animate-spin" icon="icon-park-outline:loading" />}
            </button>

            <p className="text-xs text-center text-gray-400 leading-relaxed">
              By continuing you agree to <span className="text-[#012068] font-medium cursor-pointer hover:underline">Terms & Conditions</span>, <span className="text-[#012068] font-medium cursor-pointer hover:underline">Privacy Policy</span> & <span className="text-[#012068] font-medium cursor-pointer hover:underline">Refund-Return Policy</span>
            </p>
          </form>
        </div>
      </div>
    </Modal>
  );
}
