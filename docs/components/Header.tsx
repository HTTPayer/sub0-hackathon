"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/use-cases", label: "Use Cases" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Spuro</h1>
            <p className="text-xs text-gray-500">Arkiv-backed x402 &mdash; powered by HTTPayer</p>
          </div>
        </div>
        <nav
          className="flex space-x-4 overflow-x-auto pb-1 mt-3"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "whitespace-nowrap text-sm pb-1 border-b-2 " +
                  (isActive
                    ? "text-pink-600 font-medium border-pink-600"
                    : "text-gray-600 hover:text-gray-900 hover:border-gray-300 border-transparent")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

