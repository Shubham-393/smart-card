"use client";

import { useState } from "react";
import { LayoutDashboard, Wallet, History, PieChart, CreditCard } from "lucide-react";
import Link from "next/link";

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState("payment-recharge");

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
        <h1 className="text-xl font-bold mb-8">Parent Dashboard</h1>
        <nav>
          <ul className="space-y-4">
            <li>
              <Link
                href="#"
                className={`flex items-center p-2 rounded-lg ${
                  activeTab === "payment-recharge"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("payment-recharge")}
              >
                <Wallet className="w-5 h-5 mr-2" />
                Payment Recharge
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className={`flex items-center p-2 rounded-lg ${
                  activeTab === "transaction-history"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("transaction-history")}
              >
                <History className="w-5 h-5 mr-2" />
                Transaction History
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className={`flex items-center p-2 rounded-lg ${
                  activeTab === "expenses"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("expenses")}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Expenses
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className={`flex items-center p-2 rounded-lg ${
                  activeTab === "analytics"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("analytics")}
              >
                <PieChart className="w-5 h-5 mr-2" />
                Analytics
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">
          {activeTab === "payment-recharge" && "Payment Recharge"}
          {activeTab === "transaction-history" && "Transaction History"}
          {activeTab === "expenses" && "Expenses"}
          {activeTab === "analytics" && "Analytics"}
        </h2>

        {/* Content Based on Active Tab */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {activeTab === "payment-recharge" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Recharge Your Wallet</h3>
              <p className="text-gray-600">
                Add funds to your wallet for seamless transactions.
              </p>
              <div className="mt-6">
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full p-2 border rounded-lg"
                />
                <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
                  Recharge Now
                </button>
              </div>
            </div>
          )}

          {activeTab === "transaction-history" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
              <p className="text-gray-600">
                View all your past transactions here.
              </p>
              <div className="mt-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Date</th>
                      <th className="p-2 border">Amount</th>
                      <th className="p-2 border">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border">
                      <td className="p-2 border">2023-10-01</td>
                      <td className="p-2 border">₹500</td>
                      <td className="p-2 border">Canteen Payment</td>
                    </tr>
                    <tr className="border">
                      <td className="p-2 border">2023-10-02</td>
                      <td className="p-2 border">₹200</td>
                      <td className="p-2 border">Bookstore Purchase</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "expenses" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Expenses Overview</h3>
              <p className="text-gray-600">
                Track your spending and manage your budget.
              </p>
              <div className="mt-6">
                <div className="flex justify-between mb-4">
                  <p>Canteen</p>
                  <p>₹500</p>
                </div>
                <div className="flex justify-between mb-4">
                  <p>Bookstore</p>
                  <p>₹200</p>
                </div>
                <div className="flex justify-between mb-4">
                  <p>Transport</p>
                  <p>₹100</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Analytics</h3>
              <p className="text-gray-600">
                Visualize your spending patterns and trends.
              </p>
              <div className="mt-6">
                <div className="bg-gray-200 h-40 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart Placeholder</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}