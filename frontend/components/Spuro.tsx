"use client";

import React, { useState } from "react";
import MarketplaceView from "./MarketplaceView";
import ProductDetail from "./ProductDetail";
import PaymentModal from "./PaymentModal";
import { products } from "@/data/mockData";
import { Product } from "@/types";

export default function Spuro() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Marketplace view */}
      {!selectedProduct && (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-2">
              AI Agents buy their own infra, <br /> Listed on Spuro
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 px-2">
             Powered by HTTPayer &mdash; Easy &amp; Autonomous
            </p>
            <div className="flex justify-center px-4">
              <button className="border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
                View Demo Video
              </button>
            </div>
          </div>
          <MarketplaceView products={products} onProductSelect={setSelectedProduct} />
        </div>
      )}

      {/* Product detail */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onPaymentClick={() => setShowPaymentModal(true)}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedProduct && (
        <PaymentModal
          product={selectedProduct}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}


