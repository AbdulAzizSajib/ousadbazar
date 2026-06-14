"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "antd";
import { Icon } from "@iconify/react";
import axios from "axios";
import { apiBasePharma } from "@/lib/config";
import { showNotification } from "@/lib/notification";

interface UploadPrescriptionModalProps {
  open: boolean;
  onClose: () => void;
}

const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export default function UploadPrescriptionModal({ open, onClose }: UploadPrescriptionModalProps) {
  const [mobile, setMobile] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const match = document.cookie.split("; ").find((r) => r.startsWith("mobile="));
      const saved = match ? decodeURIComponent(match.split("=")[1]) : null;
      if (saved) setMobile(saved.replace(/^88/, ""));
    }
  }, [open]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      showNotification("warning", "Please select an image file");
      return;
    }
    setFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    if (!dropped.type.startsWith("image/")) {
      showNotification("warning", "Please drop an image file");
      return;
    }
    setFile(dropped);
  };

  const openGallery = () => fileInputRef.current?.click();
  const openCamera = () => cameraInputRef.current?.click();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length < 11) {
      return showNotification("warning", "Please enter a valid mobile number");
    }
    if (!file) {
      return showNotification("warning", "Please upload a prescription image");
    }
    const formData = new FormData();
    formData.append("mobile", mobile);
    formData.append("image", file);

    setIsUploading(true);
    try {
      const res = await axios.post(`${apiBasePharma}/prescriptions`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showNotification("success", res.data?.message || "Prescription uploaded successfully");
      handleCancel();
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      showNotification(
        "error",
        axiosError.response?.data?.message || "Failed to upload prescription"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const mobile_device = isMobileDevice();

  return (
    <Modal
      open={open}
      title={null}
      footer={null}
      onCancel={handleCancel}
      centered
      width={560}
      styles={{ body: { padding: 0 } }}
    >
      <div className="w-full bg-white rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#012068] to-[#1e3a8a] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
              <Icon icon="garden:upload-fill-16" className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Upload Prescription</h2>
              <p className="text-xs text-white/80 mt-0.5">
                Upload a clear photo of your doctor&apos;s prescription
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="hidden">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mobile Number
            </label>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#012068]/30 focus-within:border-[#012068] transition-all">
              <div className="flex items-center gap-1.5 px-3 bg-[#012068] text-white text-sm font-medium shrink-0">
                <span>(+88)</span>
                <span>BD</span>
              </div>
              <input
                value={mobile}
                type="text"
                maxLength={11}
                placeholder="01XXXXXXXXX"
                className="flex-1 px-4 py-3 outline-none text-sm text-gray-700 placeholder-gray-400 bg-white"
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 11))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Prescription Image
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={handleFileChange}
            />

            {preview ? (
              <div className="relative border-2 border-dashed border-[#012068]/30 rounded-xl p-3 bg-[#f8faff]">
                <img
                  src={preview}
                  alt="Prescription preview"
                  className="w-full max-h-64 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={reset}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors"
                  aria-label="Remove image"
                >
                  <Icon icon="mdi:close" className="w-5 h-5 text-red-500" />
                </button>
                <p className="mt-2 text-xs text-gray-500 text-center truncate">{file?.name}</p>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#012068] transition-colors bg-gray-50"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-[#012068]/10 flex items-center justify-center mb-3">
                  <Icon icon="solar:gallery-add-bold" className="w-7 h-7 text-[#012068]" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {mobile_device
                    ? "Take a picture or choose from gallery"
                    : "Drag & drop an image here, or"}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  {mobile_device && (
                    <button
                      type="button"
                      onClick={openCamera}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#012068] text-white text-sm font-semibold rounded-lg hover:bg-[#012068]/90 transition-colors active:scale-95"
                    >
                      <Icon icon="solar:camera-bold" className="w-5 h-5" />
                      Take Picture
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={openGallery}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors active:scale-95 ${
                      mobile_device
                        ? "border border-[#012068] text-[#012068] hover:bg-[#012068]/5"
                        : "bg-[#012068] text-white hover:bg-[#012068]/90"
                    }`}
                  >
                    <Icon icon="solar:gallery-bold" className="w-5 h-5" />
                    Choose from Gallery
                  </button>
                </div>
                <p className="mt-3 text-xs text-gray-400">PNG, JPG up to 10MB</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3 font-semibold text-white bg-[#012068] rounded-lg hover:bg-[#012068]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex justify-center items-center gap-2 shadow-md shadow-[#012068]/20"
          >
            <span>{isUploading ? "Uploading..." : "Submit Prescription"}</span>
            {isUploading && (
              <Icon className="w-5 h-5 animate-spin" icon="icon-park-outline:loading" />
            )}
          </button>

          <p className="text-xs text-center text-gray-400 leading-relaxed">
            Our pharmacist will review your prescription and contact you shortly.
          </p>
        </form>
      </div>
    </Modal>
  );
}
