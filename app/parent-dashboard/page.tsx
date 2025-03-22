"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Wallet, History, PieChart, CreditCard, User, School, Loader2, Search, Filter, ArrowUpDown } from "lucide-react";
import { db } from "@/app/firebase";
import { doc, getDoc, updateDoc, arrayUnion, Timestamp, collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import studentTransactions from './student_transaction.json';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface Transaction {
  StudentID: string;
  Category: string;
  Item: string;
  Quantity: number;
  PricePerUnit: number;
  TotalAmount: number;
  TransactionDate: string;
}

interface ParentData {
  fullName: string;
  parentName: string;
  parentPhone: string;
  studentName: string;
  studentId: string;
  studentRollNo: string;
  email: string;
  userType: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  walletBalance?: number;
  transactions?: Array<{
    id: string;
    amount: number;
    type: 'recharge' | 'spent';
    date: Timestamp;
    description: string;
    status: 'pending' | 'completed' | 'failed';
  }>;
}

interface Vendor {
  id: string;
  businessName: string;
  businessId: string;
  status: 'approved' | 'pending' | 'rejected';
  category: 'Bookstore' | 'Canteen' | 'Xerox' | 'Stationery';
}

interface VendorData {
  id: string;
  businessName: string;
  businessId: string;
  status: 'approved' | 'pending' | 'rejected';
  [key: string]: any; // For other potential fields
}

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [parentData, setParentData] = useState<ParentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlot, setSelectedPlot] = useState("spending-by-category");
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeError, setRechargeError] = useState("");
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorCategory, setVendorCategory] = useState<string>("");
  const [sortField, setSortField] = useState<keyof Transaction>("TransactionDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
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

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendorsRef = collection(db, "vendors");
        const vendorsSnapshot = await getDocs(vendorsRef);
        const vendorsData = vendorsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as VendorData))
          .filter((vendor): vendor is Vendor => 
            vendor.status === 'approved' && 
            typeof vendor.businessName === 'string' &&
            typeof vendor.businessId === 'string' &&
            ['Bookstore', 'Canteen', 'Xerox', 'Stationery'].includes(vendor.category)
          );
        setVendors(vendorsData);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    fetchVendors();
  }, []);

  useEffect(() => {
    if (vendorCategory) {
      const filtered = vendors.filter(vendor => vendor.category === vendorCategory);
      setFilteredVendors(filtered);
      setSelectedVendor(""); // Reset selected vendor when category changes
    } else {
      setFilteredVendors(vendors);
    }
  }, [vendorCategory, vendors]);

  const handleRecharge = async () => {
    if (!parentData || !rechargeAmount) return;

    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      setRechargeError("Please enter a valid amount");
      return;
    }

    setRechargeLoading(true);
    setRechargeError("");
    setRechargeSuccess(false);

    try {
      const parentRef = doc(db, "parents", parentData.studentId);
      const newTransaction = {
        id: Date.now().toString(),
        amount: amount,
        type: 'recharge' as const,
        date: Timestamp.now(),
        description: `Wallet Recharge of ₹${amount}`,
        status: 'completed' as const
      };

      await updateDoc(parentRef, {
        walletBalance: (parentData.walletBalance || 0) + amount,
        transactions: arrayUnion(newTransaction)
      });

      // Update local state
      setParentData(prev => prev ? {
        ...prev,
        walletBalance: (prev.walletBalance || 0) + amount,
        transactions: [...(prev.transactions || []), newTransaction]
      } : null);

      setRechargeSuccess(true);
      setRechargeAmount("");
    } catch (error) {
      console.error("Error recharging wallet:", error);
      setRechargeError("Failed to recharge wallet. Please try again.");
    } finally {
      setRechargeLoading(false);
    }
  };

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
                Student Smart Card
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
        <h2 className="text-2xl font-bold mb-6 text-blue-500">
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
              <h3 className="text-xl font-semibold mb-6 text-blue-500">Welcome, {parentData?.parentName}</h3>
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
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-6 text-blue-500">Recharge Your Wallet</h3>
              
              {/* Current Balance Card
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <p className="text-2xl font-bold text-gray-900">₹{parentData?.walletBalance || 0}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div> */}

              {/* Recharge Form */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Vendor Category
                    </label>
                    <select
                      id="category-select"
                      value={vendorCategory}
                      onChange={(e) => setVendorCategory(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="Bookstore">Bookstore</option>
                      <option value="Canteen">Canteen</option>
                      <option value="Xerox">Xerox</option>
                      <option value="Stationery">Stationery</option>
                    </select>
                  </div>

                  {/* <div>
                    <label htmlFor="vendor-select" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Vendor
                    </label>
                    <select
                      id="vendor-select"
                      value={selectedVendor}
                      onChange={(e) => setSelectedVendor(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={!vendorCategory}
                    >
                      <option value="">Select a vendor</option>
                      {filteredVendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.businessName}
                        </option>
                      ))}
                    </select>
                  </div> */}

            <div>
                    <label htmlFor="recharge-amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        id="recharge-amount"
                        type="number"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={rechargeLoading}
                        required
                      />
                    </div>
                  </div>

                  {rechargeError && (
                    <div className="text-red-500 text-sm">{rechargeError}</div>
                  )}

                  {rechargeSuccess && (
                    <div className="text-green-500 text-sm">Recharge successful!</div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={handleRecharge}
                      disabled={rechargeLoading || !rechargeAmount || !selectedVendor || !vendorCategory}
                      className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors
                        ${rechargeLoading || !rechargeAmount || !selectedVendor || !vendorCategory
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                      {rechargeLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        'Recharge Now'
                      )}
                    </button>

                <button 
                  onClick={() => router.push('/temp_location')} 
                      className="flex-1 py-3 px-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
                >
                  Generate QR Code
                </button>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h4>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {parentData?.transactions?.slice(0, 5).map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.date.toDate().toLocaleDateString()}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            transaction.type === 'recharge' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'recharge' ? '+' : '-'}₹{transaction.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'}`}>
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "student-info" && (
            <div>
              <h3 className="text-xl font-semibold mb-6 text-blue-500">Student Information</h3>
              
              {/* Student Info Banner */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Student Details</h4>
                    <p className="text-sm text-gray-600">Last updated: {parentData?.updatedAt?.toDate().toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <School className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Student Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">Student Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Student Name</label>
                      <p className="text-lg font-semibold text-gray-900">{parentData?.studentName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Student ID</label>
                      <p className="text-lg font-semibold text-gray-900">{parentData?.studentId}</p>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-gray-500">Roll Number</label>
                      <p className="text-lg font-semibold text-gray-900">{parentData?.studentRollNo}</p>
                    </div>
                  </div>
                </div>

                {/* Parent Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">Parent Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Parent Name</label>
                      <p className="text-lg font-semibold text-gray-900">{parentData?.parentName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-lg font-semibold text-gray-900">{parentData?.fullName}</p>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-gray-500">Contact Number</label>
                      <p className="text-lg font-semibold text-gray-900">{parentData?.parentPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">Contact Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email Address</label>
                      <p className="text-lg font-semibold text-gray-900">{parentData?.email}</p>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-gray-500">Account Type</label>
                      <p className="text-lg font-semibold text-gray-900 capitalize">{parentData?.userType}</p>
                    </div>
                  </div>
                </div>

                {/* Account Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">Account Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Created</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {parentData?.createdAt?.toDate().toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {parentData?.updatedAt?.toDate().toLocaleString()}
                      </p>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-gray-500">Wallet Balance</label>
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{parentData?.walletBalance || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "transaction-history" && (
            <div className="max-w-6xl mx-auto">
              <h3 className="text-xl font-semibold mb-6 text-blue-500">Transaction History</h3>

              {/* Student Info Banner */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Student Transactions</h4>
                    <p className="text-sm text-gray-600">Showing transactions for {parentData?.studentName}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <School className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Category
                    </label>
                    <select
                      id="category-select"
                      value={vendorCategory}
                      onChange={(e) => setVendorCategory(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Select transaction category"
                    >
                      <option value="all">All Categories</option>
                      <option value="Bookstore">Bookstore</option>
                      <option value="Stationery">Stationery</option>
                      <option value="Canteen">Canteen</option>
                      <option value="Xerox">Xerox</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-end space-x-4">
                    <span className="text-sm text-gray-600">Total Transactions:</span>
                    <span className="font-semibold text-blue-600">
                      {studentTransactions.filter(t => t.StudentID === parentData?.studentId).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{studentTransactions
                          .filter(t => t.StudentID === parentData?.studentId)
                          .reduce((acc, curr) => acc + curr.TotalAmount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Wallet className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Bookstore</p>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{studentTransactions
                          .filter(t => t.StudentID === parentData?.studentId && t.Category === 'Bookstore')
                          .reduce((acc, curr) => acc + curr.TotalAmount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-100 p-2 rounded-full">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Canteen</p>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{studentTransactions
                          .filter(t => t.StudentID === parentData?.studentId && t.Category === 'Canteen')
                          .reduce((acc, curr) => acc + curr.TotalAmount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-orange-100 p-2 rounded-full">
                      <CreditCard className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
            <div>
                      <p className="text-sm text-gray-600">Other Expenses</p>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{studentTransactions
                          .filter(t => t.StudentID === parentData?.studentId && t.Category !== 'Bookstore' && t.Category !== 'Canteen')
                          .reduce((acc, curr) => acc + curr.TotalAmount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-2 rounded-full">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                  <thead>
                      <tr className="bg-gray-50">
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSortField("TransactionDate");
                            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
                          }}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Date</span>
                            <ArrowUpDown className="h-4 w-4" />
                            {sortField === "TransactionDate" && (
                              <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSortField("Category");
                            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
                          }}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Category</span>
                            <ArrowUpDown className="h-4 w-4" />
                            {sortField === "Category" && (
                              <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSortField("TotalAmount");
                            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
                          }}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Amount</span>
                            <ArrowUpDown className="h-4 w-4" />
                            {sortField === "TotalAmount" && (
                              <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                    </tr>
                  </thead>
                    <tbody className="divide-y divide-gray-200">
                      {studentTransactions
                        .filter(transaction => {
                          const matchesStudent = transaction.StudentID === parentData?.studentId;
                          const matchesSearch = 
                            transaction.Item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            transaction.Category.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesCategory = vendorCategory === "all" || transaction.Category === vendorCategory;
                          return matchesStudent && matchesSearch && matchesCategory;
                        })
                        .sort((a, b) => {
                          const aValue = a[sortField];
                          const bValue = b[sortField];
                          
                          if (sortDirection === "asc") {
                            return aValue > bValue ? 1 : -1;
                          }
                          return aValue < bValue ? 1 : -1;
                        })
                        .map((transaction, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(transaction.TransactionDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${transaction.Category === 'Bookstore' ? 'bg-blue-100 text-blue-800' :
                                  transaction.Category === 'Canteen' ? 'bg-orange-100 text-orange-800' :
                                  transaction.Category === 'Stationery' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'}`}>
                                {transaction.Category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.Item}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {transaction.Quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₹{transaction.TotalAmount.toLocaleString()}
                            </td>
                    </tr>
                        ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "expenses" && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-500">Expenses Overview</h3>
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
              <h3 className="text-xl font-semibold mb-4 text-blue-500">Analytics</h3>
              
              {/* Enhanced Plot Selection Dropdown */}
              <div className="mb-6">
                <label htmlFor="plot-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Visualization
                </label>
                <select 
                  id="plot-select"
                  value={selectedPlot}
                  onChange={(e) => setSelectedPlot(e.target.value)}
                  className="w-full md:w-64 p-3 border border-gray-300 rounded-lg bg-white shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           text-gray-700 font-medium
                           cursor-pointer hover:border-blue-400 transition-colors
                           appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5em_1.5em]
                           bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236B7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M10%203a1%201%200%2001.707.293l3%203a1%201%200%2001-1.414%201.414L10%205.414%207.707%207.707a1%201%200%2001-1.414-1.414l3-3A1%201%200%200110%203zm-3.707%209.293a1%201%200%20011.414%200L10%2014.586l2.293-2.293a1%201%200%20011.414%201.414l-3%203a1%201%200%2001-1.414%200l-3-3a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]"
                  aria-label="Select visualization type"
                >
                  <option value="spending-by-category">📊 Spending by Category</option>
                  <option value="category-distribution">🥧 Category Distribution</option>
                  <option value="amount-distribution">📈 Amount Distribution</option>
                  <option value="spending-trend">📅 Spending Trend</option>
                </select>
              </div>

              {/* Selected Plot Display with Adjusted Size */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                {selectedPlot === "spending-by-category" && (
                  <div className="max-w-3xl mx-auto">
                    <h4 className="text-lg font-medium mb-4 text-gray-800">Spending by Category</h4>
                    <div className="h-[400px]">
                      <Bar
                        data={{
                          labels: ['Bookstore', 'Stationery', 'Canteen', 'Xerox'],
                          datasets: [{
                            label: 'Total Amount Spent',
                            data: [
                              studentTransactions.reduce((acc, curr) => curr.Category === 'Bookstore' ? acc + curr.TotalAmount : acc, 0),
                              studentTransactions.reduce((acc, curr) => curr.Category === 'Stationery' ? acc + curr.TotalAmount : acc, 0),
                              studentTransactions.reduce((acc, curr) => curr.Category === 'Canteen' ? acc + curr.TotalAmount : acc, 0),
                              studentTransactions.reduce((acc, curr) => curr.Category === 'Xerox' ? acc + curr.TotalAmount : acc, 0),
                            ],
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                              labels: {
                                font: {
                                  size: 12
                                }
                              }
                            },
                            title: {
                              display: true,
                              text: 'Total Spending by Category',
                              font: {
                                size: 14
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                font: {
                                  size: 11
                                }
                              }
                            },
                            x: {
                              ticks: {
                                font: {
                                  size: 11
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h5 className="font-semibold text-blue-800 mb-2">Inference:</h5>
                      <p className="text-blue-700 text-sm">
                        This visualization shows the total spending across different categories. 
                        {studentTransactions.reduce((acc, curr) => curr.Category === 'Bookstore' ? acc + curr.TotalAmount : acc, 0) > 
                         studentTransactions.reduce((acc, curr) => curr.Category === 'Canteen' ? acc + curr.TotalAmount : acc, 0) 
                          ? " The highest spending is in the Bookstore category, indicating significant investment in educational materials."
                          : " The highest spending is in the Canteen category, suggesting regular food purchases."}
                      </p>
                    </div>
                  </div>
                )}

                {selectedPlot === "category-distribution" && (
                  <div className="max-w-3xl mx-auto">
                    <h4 className="text-lg font-medium mb-4 text-gray-800">Category Distribution</h4>
                    <div className="h-[400px]">
                      <Doughnut
                        data={{
                          labels: ['Bookstore', 'Stationery', 'Canteen', 'Xerox'],
                          datasets: [{
                            data: [
                              studentTransactions.reduce((acc, curr) => curr.Category === 'Bookstore' ? acc + curr.TotalAmount : acc, 0),
                              studentTransactions.reduce((acc, curr) => curr.Category === 'Stationery' ? acc + curr.TotalAmount : acc, 0),
                              studentTransactions.reduce((acc, curr) => curr.Category === 'Canteen' ? acc + curr.TotalAmount : acc, 0),
                              studentTransactions.reduce((acc, curr) => curr.Category === 'Xerox' ? acc + curr.TotalAmount : acc, 0),
                            ],
                            backgroundColor: [
                              'rgba(255, 99, 132, 0.5)',
                              'rgba(54, 162, 235, 0.5)',
                              'rgba(255, 206, 86, 0.5)',
                              'rgba(75, 192, 192, 0.5)',
                            ],
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                              labels: {
                                font: {
                                  size: 12
                                }
                              }
                            },
                            title: {
                              display: true,
                              text: 'Spending Distribution',
                              font: {
                                size: 14
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h5 className="font-semibold text-blue-800 mb-2">Inference:</h5>
                      <p className="text-blue-700 text-sm">
                        The donut chart shows the proportional distribution of spending across categories. 
                        This helps identify which categories consume the largest portion of the total budget.
                      </p>
                    </div>
                  </div>
                )}

                {selectedPlot === "amount-distribution" && (
                  <div className="max-w-3xl mx-auto">
                    <h4 className="text-lg font-medium mb-4 text-gray-800">Spending Amount Distribution</h4>
                    <div className="h-[400px]">
                      <Bar
                        data={{
                          labels: ['0-50', '51-100', '101-200', '201-500', '501-1000', '>1000'],
                          datasets: [{
                            label: 'Number of Transactions',
                            data: [
                              studentTransactions.filter(t => t.TotalAmount <= 50).length,
                              studentTransactions.filter(t => t.TotalAmount > 50 && t.TotalAmount <= 100).length,
                              studentTransactions.filter(t => t.TotalAmount > 100 && t.TotalAmount <= 200).length,
                              studentTransactions.filter(t => t.TotalAmount > 200 && t.TotalAmount <= 500).length,
                              studentTransactions.filter(t => t.TotalAmount > 500 && t.TotalAmount <= 1000).length,
                              studentTransactions.filter(t => t.TotalAmount > 1000).length,
                            ],
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                              labels: {
                                font: {
                                  size: 12
                                }
                              }
                            },
                            title: {
                              display: true,
                              text: 'Distribution of Transaction Amounts',
                              font: {
                                size: 14
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Number of Transactions',
                                font: {
                                  size: 12
                                }
                              },
                              ticks: {
                                font: {
                                  size: 11
                                }
                              }
                            },
                            x: {
                              title: {
                                display: true,
                                text: 'Amount Range (₹)',
                                font: {
                                  size: 12
                                }
                              },
                              ticks: {
                                font: {
                                  size: 11
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h5 className="font-semibold text-blue-800 mb-2">Inference:</h5>
                      <p className="text-blue-700 text-sm">
                        This histogram shows the frequency of transactions in different amount ranges. 
                        It helps understand the spending patterns and whether the student typically makes small or large purchases.
                      </p>
                    </div>
                  </div>
                )}

                {selectedPlot === "spending-trend" && (
                  <div className="max-w-3xl mx-auto">
                    <h4 className="text-lg font-medium mb-4 text-gray-800">Spending Over Time</h4>
                    <div className="h-[400px]">
                      <Line
                        data={{
                          labels: Array.from(new Set(studentTransactions.map(t => t.TransactionDate.split(' ')[0]))).sort(),
                          datasets: [{
                            label: 'Daily Spending',
                            data: Array.from(new Set(studentTransactions.map(t => t.TransactionDate.split(' ')[0]))).sort().map(date => 
                              studentTransactions
                                .filter(t => t.TransactionDate.startsWith(date))
                                .reduce((acc, curr) => acc + curr.TotalAmount, 0)
                            ),
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                              labels: {
                                font: {
                                  size: 12
                                }
                              }
                            },
                            title: {
                              display: true,
                              text: 'Daily Spending Trend',
                              font: {
                                size: 14
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                font: {
                                  size: 11
                                }
                              }
                            },
                            x: {
                              ticks: {
                                font: {
                                  size: 11
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h5 className="font-semibold text-blue-800 mb-2">Inference:</h5>
                      <p className="text-blue-700 text-sm">
                        The line chart shows the daily spending pattern over time. 
                        This helps identify any unusual spending spikes or patterns in the student's spending behavior.
                      </p>
                    </div>
                </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
