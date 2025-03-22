"use client";

import { useState } from "react";
import { LayoutDashboard, CreditCard, Box, PieChart } from "lucide-react";
import Link from "next/link";

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
        <h1 className="text-xl font-bold mb-8">Vendor Dashboard</h1>
        <nav>
          <ul className="space-y-4">
            <li>
              <Link
                href="#"
                className={`flex items-center p-2 rounded-lg ${
                  activeTab === "dashboard"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className={`flex items-center p-2 rounded-lg ${
                  activeTab === "transactions"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("transactions")}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Transactions
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className={`flex items-center p-2 rounded-lg ${
                  activeTab === "inventory"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("inventory")}
              >
                <Box className="w-5 h-5 mr-2" />
                Inventory
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
          {activeTab === "dashboard" && "Dashboard"}
          {activeTab === "transactions" && "Transactions"}
          {activeTab === "inventory" && "Inventory"}
          {activeTab === "analytics" && "Analytics"}
        </h2>

        {/* Content Based on Active Tab */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {activeTab === "dashboard" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Welcome to Your Dashboard</h3>
              <p className="text-gray-600">
                Manage your business operations efficiently.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">₹15,000</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold">120</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-gray-600">Inventory Items</p>
                  <p className="text-2xl font-bold">45</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
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
                      <th className="p-2 border">Customer</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border">
                      <td className="p-2 border">2023-10-01</td>
                      <td className="p-2 border">₹500</td>
                      <td className="p-2 border">John Doe</td>
                    </tr>
                    <tr className="border">
                      <td className="p-2 border">2023-10-02</td>
                      <td className="p-2 border">₹200</td>
                      <td className="p-2 border">Jane Smith</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Inventory Management</h3>
              <p className="text-gray-600">
                Manage your inventory items here.
              </p>
              <div className="mt-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Item</th>
                      <th className="p-2 border">Quantity</th>
                      <th className="p-2 border">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border">
                      <td className="p-2 border">Notebook</td>
                      <td className="p-2 border">50</td>
                      <td className="p-2 border">₹20</td>
                    </tr>
                    <tr className="border">
                      <td className="p-2 border">Pen</td>
                      <td className="p-2 border">100</td>
                      <td className="p-2 border">₹10</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Analytics</h3>
              <p className="text-gray-600">
                Visualize your business performance and trends.
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