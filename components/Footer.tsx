"use client";

import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <div className="bg-[#388072]">
      <footer className="text-white pt-5 leading-tight max-w-6xl mx-auto">
        <div className="px-2">
          <div className="md:flex items-center justify-between gap-3">
            <div className="md:w-1/2">
              <h2 className="md:text-lg font-semibold">
                বাংলাদেশের বিশ্বস্ত অনলাইন ফার্মেসি
              </h2>
              <h2 className="font-semibold text-gray-300 text-sm md:text-lg max-w-[500px] text-justify leading-tight">
                উন্নতমানের ওষুধ, স্বাস্থ্য সুরক্ষা পণ্য এবং দৈনন্দিন
                স্বাস্থ্যসেবা সামগ্রী দ্রুত ডেলিভারি ও সাশ্রয়ী
                মূল্যে—বাংলাদেশে আপনার দোরগোড়ায় সুবিধাজনক স্বাস্থ্যসেবা
                পৌঁছে দিচ্ছি।
              </h2>
            </div>
            <div className="md:w-1/2 mb-3">
              <h2 className="md:text-lg font-semibold">যোগাযোগ করুন</h2>
              <div className="mt-3">
                <Icon icon="ant-design:home-outlined" className="inline align-baseline" />
                <span className="text-white text-sm md:text-lg leading-7 pl-2">
                  বাড়ি-৩৭, ব্লক-এফ, সেক্টর-১, আফতাবনগর, ঢাকা-১২১২
                </span>
              </div>
              <div className="flex items-center mr-3 mt-1">
                <Icon icon="ant-design:phone-filled" />
                <span className="text-white text-sm md:text-lg leading-7 ml-2">
                  ০১৯১৫৬০৬০৯০
                </span>
              </div>
              <div className="flex items-center mt-1">
                <Icon icon="mdi:web" />
                <span className="text-white leading-7 ml-2">
                  https://ousadbazar.com
                </span>
              </div>
            </div>
          </div>
          <hr className="my-1 border-white" />
          <div className="flex items-center justify-center">
            <p className="text-white md:text-left">
              &copy; ২০২৫ ঔষধবাজার.কম সর্বস্বত্ব সংরক্ষিত।
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
