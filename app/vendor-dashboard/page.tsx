"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, CreditCard, Box, PieChart, User, Store, Phone, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface VendorData {
  vendorName: string;
  email: string;
  vendorBusiness: string;
  vendorPhone: string;
  upiId: string;
}

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthorization = () => {
      try {
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        const userData = JSON.parse(userDataStr);
        if (userData.userType !== 'vendor') {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        setVendorData(userData);
        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking authorization:", error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-red-900">Access Denied</h1>
            <p className="text-gray-600">
              This page is only accessible to vendors. Please log in as a vendor to continue.
            </p>
            <div className="pt-4">
              <Button 
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Login as Vendor
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Vendor Dashboard</h1>
          {vendorData && (
            <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{vendorData.vendorName}</h3>
                  <p className="text-xs text-gray-600">{vendorData.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Store className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{vendorData.vendorBusiness}</p>
                  <p className="text-xs text-gray-600">Business Type</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <nav>
          <ul className="space-y-4">
            <li>
              <button
                className={`w-full flex items-center p-2 rounded-lg ${
                  activeTab === "dashboard"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center p-2 rounded-lg ${
                  activeTab === "transactions"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("transactions")}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Transactions
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center p-2 rounded-lg ${
                  activeTab === "inventory"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("inventory")}
              >
                <Box className="w-5 h-5 mr-2" />
                Inventory
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center p-2 rounded-lg ${
                  activeTab === "analytics"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("analytics")}
              >
                <PieChart className="w-5 h-5 mr-2" />
                Analytics
              </button>
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
              <h3 className="text-xl font-semibold mb-6">Welcome, {vendorData?.vendorName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Vendor Profile Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Vendor Name</h4>
                      <p className="text-xl font-semibold text-gray-900">{vendorData?.vendorName}</p>
                    </div>
                  </div>
                </div>

                {/* Business Type Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Store className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Business Type</h4>
                      <p className="text-xl font-semibold text-gray-900">{vendorData?.vendorBusiness}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Contact Number</h4>
                      <p className="text-xl font-semibold text-gray-900">{vendorData?.vendorPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Email Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Email</h4>
                      <p className="text-xl font-semibold text-gray-900">{vendorData?.email}</p>
                    </div>
                  </div>
                </div>

                {/* UPI ID Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="bg-pink-100 p-3 rounded-full">
                      <CreditCard className="h-6 w-6 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">UPI ID</h4>
                      <p className="text-xl font-semibold text-gray-900">{vendorData?.upiId}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <LayoutDashboard className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Quick Actions</h4>
                      <div className="flex space-x-2 mt-2">
                        <button 
                          onClick={() => setActiveTab("transactions")}
                          className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Transactions
                        </button>
                        <button 
                          onClick={() => setActiveTab("inventory")}
                          className="text-sm bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Inventory
                        </button>
                      </div>
                    </div>
                  </div>
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