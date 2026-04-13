"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { asset } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="bg-[#2c6b5e] text-white">
      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/">
              <img
                src={asset("/images/ousadbazar.svg")}
                alt="ঔষধবাজার"
                className="h-10 mb-4 brightness-0 invert"
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              উন্নতমানের ওষুধ, স্বাস্থ্য সুরক্ষা পণ্য এবং দৈনন্দিন
              স্বাস্থ্যসেবা সামগ্রী দ্রুত ডেলিভারি ও সাশ্রয়ী মূল্যে আপনার
              দোরগোড়ায়।
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com/ousadbazar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Icon icon="mdi:facebook" className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@ousadbazar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Icon icon="mdi:youtube" className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/8801915606090"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Icon icon="mdi:whatsapp" className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-white/40">
              দ্রুত লিংক
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white hover:pl-1 transition-all duration-200">
                  হোম
                </Link>
              </li>
              <li>
                <Link href="/all-medicines" className="text-gray-300 hover:text-white hover:pl-1 transition-all duration-200">
                  সকল ওষুধ
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-300 hover:text-white hover:pl-1 transition-all duration-200">
                  ওষুধ খুঁজুন
                </Link>
              </li>
              <li>
                <Link href="/guest-order" className="text-gray-300 hover:text-white hover:pl-1 transition-all duration-200">
                  অর্ডার ট্র্যাক করুন
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-lg mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-white/40">
              গ্রাহক সেবা
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:pl-1 transition-all duration-200">
                  শর্তাবলী
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:pl-1 transition-all duration-200">
                  গোপনীয়তা নীতি
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:pl-1 transition-all duration-200">
                  রিটার্ন ও রিফান্ড
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:pl-1 transition-all duration-200">
                  প্রায়শই জিজ্ঞাসিত প্রশ্ন
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-white/40">
              যোগাযোগ
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Icon icon="solar:map-point-linear" className="w-5 h-5 mt-0.5 shrink-0 text-gray-300" />
                <span className="text-gray-300">
                  বাড়ি-৩৭, ব্লক-এফ, সেক্টর-১, আফতাবনগর, ঢাকা-১২১২
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Icon icon="solar:phone-linear" className="w-5 h-5 shrink-0 text-gray-300" />
                <a href="tel:+8801915606090" className="text-gray-300 hover:text-white transition-colors">
                  ০১৯১৫৬০৬০৯০
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Icon icon="solar:letter-linear" className="w-5 h-5 shrink-0 text-gray-300" />
                <a href="mailto:info@ousadbazar.com" className="text-gray-300 hover:text-white transition-colors">
                  info@ousadbazar.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Icon icon="solar:clock-circle-linear" className="w-5 h-5 shrink-0 text-gray-300" />
                <span className="text-gray-300">সকাল ৯টা - রাত ১০টা</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/15">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 text-sm">
            &copy; ২০২৫ ঔষধবাজার.কম — সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Icon icon="solar:shield-check-bold" className="w-4 h-4 text-green-400" />
              <span>নিরাপদ পেমেন্ট</span>
            </div>
            <div className="flex items-center gap-2">
              {/* <Icon icon="logos:mastercard" className="h-5 w-auto" />
              <Icon icon="logos:visa" className="h-4 w-auto" /> */}
              <span className="text-xs text-gray-400 border border-gray-500 rounded px-1.5 py-0.5">bKash</span>
              <span className="text-xs text-gray-400 border border-gray-500 rounded px-1.5 py-0.5">নগদ</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
