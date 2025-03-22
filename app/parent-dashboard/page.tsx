"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Wallet, History, PieChart, CreditCard, User, School } from "lucide-react";
import { db } from "@/app/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface ParentData {
  fullName: string;
  parentName: string;
  parentPhone: string;
  studentName: string;
  studentId: string;
  studentRollNo: string;
  email: string;
}

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [parentData, setParentData] = useState<ParentData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        // Check if user is logged in
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) {
          router.push('/login');
          return;
        }

        const userData = JSON.parse(userDataStr);
        if (userData.userType !== 'parent') {
          router.push('/login');
          return;
        }

        // Fetch parent data from Firestore
        const parentDoc = await getDoc(doc(db, "parents", userData.uid));
        if (parentDoc.exists()) {
          setParentData(parentDoc.data() as ParentData);
        }
      } catch (error) {
        console.error("Error fetching parent data:", error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchParentData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Parent Dashboard</h1>
          {parentData && (
            <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{parentData.parentName}</h3>
                  <p className="text-xs text-gray-600">{parentData.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <School className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{parentData.studentName}</p>
                  <p className="text-xs text-gray-600">Student Name</p>
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
                  activeTab === "payment-recharge"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("payment-recharge")}
              >
                <Wallet className="w-5 h-5 mr-2" />
                Payment Recharge
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center p-2 rounded-lg ${
                  activeTab === "transaction-history"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("transaction-history")}
              >
                <History className="w-5 h-5 mr-2" />
                Transaction History
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center p-2 rounded-lg ${
                  activeTab === "student-info"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("student-info")}
              >
                <User className="w-5 h-5 mr-2" />
                Student Info
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center p-2 rounded-lg ${
                  activeTab === "expenses"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("expenses")}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Expenses
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
          {activeTab === "payment-recharge" && "Payment Recharge"}
          {activeTab === "transaction-history" && "Transaction History"}
          {activeTab === "student-info" && "Student Information"}
          {activeTab === "expenses" && "Expenses"}
          {activeTab === "analytics" && "Analytics"}
        </h2>

        {/* Content Based on Active Tab */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {activeTab === "dashboard" && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Welcome, {parentData?.parentName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Student Profile Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Student Name</h4>
                      <p className="text-xl font-semibold text-gray-900">{parentData?.studentName}</p>
                    </div>
                  </div>
                </div>

                {/* Student ID Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Student ID</h4>
                      <p className="text-xl font-semibold text-gray-900">{parentData?.studentId}</p>
                    </div>
                  </div>
                </div>

                {/* Roll Number Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <School className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Roll Number</h4>
                      <p className="text-xl font-semibold text-gray-900">{parentData?.studentRollNo}</p>
                    </div>
                  </div>
                </div>

                {/* Parent Contact Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <User className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Parent Contact</h4>
                      <p className="text-xl font-semibold text-gray-900">{parentData?.parentPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Email Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="bg-pink-100 p-3 rounded-full">
                      <CreditCard className="h-6 w-6 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Email</h4>
                      <p className="text-xl font-semibold text-gray-900">{parentData?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <Wallet className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Quick Actions</h4>
                      <div className="flex space-x-2 mt-2">
                        <button 
                          onClick={() => setActiveTab("payment-recharge")}
                          className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Recharge
                        </button>
                        <button 
                          onClick={() => setActiveTab("transaction-history")}
                          className="text-sm bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          History
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payment-recharge" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Recharge Your Wallet</h3>
              <div className="mb-6">
                <button 
                  onClick={() => router.push('/temp_location')} 
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Generate QR Code
                </button>
              </div>
              <p className="text-gray-600">
                Add funds to your wallet for seamless transactions.
              </p>
              <div className="mt-6 space-y-4">
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full p-2 border rounded-lg"
                />
                <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  Recharge Now
                </button>
              </div>
            </div>
          )}

          {activeTab === "student-info" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Student Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Student Name</p>
                    <p className="font-semibold">{parentData?.studentName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Student ID</p>
                    <p className="font-semibold">{parentData?.studentId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Roll Number</p>
                    <p className="font-semibold">{parentData?.studentRollNo}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Parent Name</p>
                    <p className="font-semibold">{parentData?.parentName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Parent Phone</p>
                    <p className="font-semibold">{parentData?.parentPhone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-semibold">{parentData?.email}</p>
                  </div>
                </div>
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
