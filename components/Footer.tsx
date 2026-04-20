"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { asset } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="bg-[#5360a7] text-white ">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/">
              <img
                src={asset("/images/logo.svg")}
                alt="OusadBazar"
                className="h-10 mb-5 brightness-0 invert"
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-5">
              High-quality medicines, healthcare products, and daily essentials 
              delivered to your doorstep quickly at affordable prices.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com/ousadbazar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
              >
                <Icon icon="mdi:facebook" className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@ousadbazar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
              >
                <Icon icon="mdi:youtube" className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/8801915606090"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
              >
                <Icon icon="mdi:whatsapp" className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-5 pb-2 border-b border-white/30">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white hover:pl-1 transition-all">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/all-medicines" className="text-gray-300 hover:text-white hover:pl-1 transition-all">
                  All Medicines
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-300 hover:text-white hover:pl-1 transition-all">
                  Search Medicine
                </Link>
              </li>
              <li>
                <Link href="/guest-order" className="text-gray-300 hover:text-white hover:pl-1 transition-all">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-lg mb-5 pb-2 border-b border-white/30">
              Customer Service
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:pl-1 transition-all">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:pl-1 transition-all">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:pl-1 transition-all">
                  Return & Refund
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:pl-1 transition-all">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-5 pb-2 border-b border-white/30">
              Contact
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Icon icon="solar:map-point-linear" className="w-5 h-5 mt-0.5 text-gray-300" />
                <span className="text-gray-300">
                  House 37, Block F, Sector 1, Aftabnagar, Dhaka 1212
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Icon icon="solar:phone-linear" className="w-5 h-5 text-gray-300" />
                <a href="tel:+8801915606090" className="text-gray-300 hover:text-white">
                  +880 1915-606090
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Icon icon="solar:letter-linear" className="w-5 h-5 text-gray-300" />
                <a href="mailto:info@ousadbazar.com" className="text-gray-300 hover:text-white">
                  info@ousadbazar.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Icon icon="solar:clock-circle-linear" className="w-5 h-5 text-gray-300" />
                <span className="text-gray-300">9:00 AM - 10:00 PM</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/15">
        <div className="container mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; 2025 OusadBazar.com — All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <Icon icon="solar:shield-check-bold" className="w-4 h-4 text-green-400" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 border border-gray-500 rounded px-2 py-1">
                bKash
              </span>
              <span className="text-xs text-gray-400 border border-gray-500 rounded px-2 py-1">
                Nagad
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}