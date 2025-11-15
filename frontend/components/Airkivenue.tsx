"use client";

import React, { useState } from "react";
import Header from "./Header";
import { useTab } from "./TabProvider";
import HackathonBanner from "./HackathonBanner";
import MarketplaceView from "./MarketplaceView";
import ProductDetail from "./ProductDetail";
import SessionsView from "./SessionsView";
import PaymentModal from "./PaymentModal";
import { categories, products, sessions } from "@/data/mockData";
import { Product } from "@/types";

export default function Airkivenue() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // Tab state is provided by the shared TabProvider (Header and pages use it)
  const { activeTab } = useTab();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Marketplace Tab */}
      {activeTab === "marketplace" && !selectedProduct && (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-2">
              AI agents that buy their own infrastructure
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 px-2">
              Monitor Polkadot accounts, persist snapshots to Arkiv, pay with
              HTTPayer all autonomous
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
              <button className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition">
                Browse Capabilities
              </button>
              <button className="border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
                View Demo Video
              </button>
            </div>
          </div>
          <MarketplaceView
            categories={categories}
            products={products}
            onProductSelect={setSelectedProduct}
          />
          <HackathonBanner />
        </div>
      )}

      {/* Product Detail */}
      {activeTab === "marketplace" && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onPaymentClick={() => setShowPaymentModal(true)}
        />
      )}

      {/* Sessions Tab */}
      {activeTab === "sessions" && <SessionsView sessions={sessions} />}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          product={selectedProduct}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
