"use client";

import Image from "next/image";

export default function BrandHero() {
  return (
    <div className="container-narrow pt-6">
      <div className="w-full overflow-hidden rounded-2xl border border-gray-200 shadow-soft bg-white">
        <div className="relative">
          {/* Replace the banner by dropping your file at public/hero.png */}
          <Image
            src="/hero.png"
            alt="Human & AI Productivity ROI Calculator"
            width={2400}
            height={620}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </div>
  );
}
