"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Users, CreditCard, PieChart, Search, Filter, ArrowUpDown, Download, Plus, Store, CheckCircle, XCircle, Phone, X } from "lucide-react";
import { db } from "@/app/firebase";
import { collection, getDocs, query, where, orderBy, doc, updateDoc, addDoc, Timestamp } from "firebase/firestore";
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
import studentTransactions from '../parent-dashboard/student_transaction.json';

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

interface Vendor {
  id: string;
  businessName: string;
  businessId: string;
  govId: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    businessId: string;
    govId: string;
  };
  submittedAt: string;
  rejectionReason?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortField, setSortField] = useState<keyof Transaction>("TransactionDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [vendorStatusFilter, setVendorStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showVendorDetailsModal, setShowVendorDetailsModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [newVendor, setNewVendor] = useState({
    businessName: "",
    businessId: "",
    govId: "",
    email: "",
    phone: "",
    address: "",
    documents: {
      businessId: "",
      govId: ""
    }
  });
  const [error, setError] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAdminAuth = () => {
      const userDataStr = localStorage.getItem('userData');
      if (!userDataStr) {
        router.push('/login');
        return;
      }

      const userData = JSON.parse(userDataStr);
      if (userData.userType !== 'admin') {
        router.push('/login');
        return;
      }

      setLoading(false);
    };

    checkAdminAuth();
  }, [router]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendorsRef = collection(db, "vendors");
        const vendorsSnapshot = await getDocs(vendorsRef);
        const vendorsData = vendorsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Vendor[];
        setVendors(vendorsData);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        setError("Failed to fetch vendors");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get unique students for filter
  const uniqueStudents = Array.from(new Set(studentTransactions.map((t: Transaction) => t.StudentID)));

  // Filter transactions based on search, category, and student
  const filteredTransactions = studentTransactions.filter((transaction: Transaction) => {
    const matchesSearch = 
      transaction.Item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.Category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.StudentID.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || transaction.Category === selectedCategory;
    const matchesStudent = selectedStudent === "all" || transaction.StudentID === selectedStudent;
    return matchesSearch && matchesCategory && matchesStudent;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a: Transaction, b: Transaction) => {
    if (sortDirection === "asc") {
      return a[sortField] > b[sortField] ? 1 : -1;
    }
    return a[sortField] < b[sortField] ? 1 : -1;
  });

  // Calculate statistics
  const totalTransactions = studentTransactions.length;
  const totalAmount = studentTransactions.reduce((acc: number, curr: Transaction) => acc + curr.TotalAmount, 0);
  const averageTransactionAmount = totalAmount / totalTransactions;
  const uniqueStudentsCount = uniqueStudents.length;

  const handleApproveVendor = async (vendorId: string) => {
    try {
      const vendorRef = doc(db, "vendors", vendorId);
      await updateDoc(vendorRef, {
        status: "approved",
        approvedAt: Timestamp.now()
      });
      
      // Update local state
      setVendors(vendors.map(vendor => 
        vendor.id === vendorId 
          ? { ...vendor, status: "approved" }
          : vendor
      ));
    } catch (error) {
      console.error("Error approving vendor:", error);
      setError("Failed to approve vendor");
    }
  };

  const handleRejectVendor = async (vendorId: string, reason: string) => {
    try {
      const vendorRef = doc(db, "vendors", vendorId);
      await updateDoc(vendorRef, {
        status: "rejected",
        rejectedAt: Timestamp.now(),
        rejectionReason: reason
      });
      
      // Update local state
      setVendors(vendors.map(vendor => 
        vendor.id === vendorId 
          ? { ...vendor, status: "rejected", rejectionReason: reason }
          : vendor
      ));
    } catch (error) {
      console.error("Error rejecting vendor:", error);
      setError("Failed to reject vendor");
    }
  };

  const handleAddVendor = async () => {
    try {
      const vendorsRef = collection(db, "vendors");
      await addDoc(vendorsRef, {
        ...newVendor,
        status: "pending",
        submittedAt: Timestamp.now()
      });
      
      // Reset form and close modal
      setNewVendor({
        businessName: "",
        businessId: "",
        govId: "",
        email: "",
        phone: "",
        address: "",
        documents: {
          businessId: "",
          govId: ""
        }
      });
      setShowAddVendorModal(false);
      
      // Refresh vendors list
      const vendorsSnapshot = await getDocs(vendorsRef);
      const vendorsData = vendorsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vendor[];
      setVendors(vendorsData);
    } catch (error) {
      console.error("Error adding vendor:", error);
      setError("Failed to add vendor");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <nav>
          <ul className="space-y-4">
            <li>
              <button
                className={`w-full flex items-center p-2 rounded-lg ${
                  activeTab === "overview"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Overview
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
                  activeTab === "students"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("students")}
              >
                <Users className="w-5 h-5 mr-2" />
                Students
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
            <li>
              <button
                className={`w-full flex items-center p-2 rounded-lg ${
                  activeTab === "vendor-auth"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("vendor-auth")}
              >
                <Store className="w-5 h-5 mr-2" />
                Vendor Authentication
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">
          {activeTab === "overview" && "Dashboard Overview"}
          {activeTab === "transactions" && "Transaction Management"}
          {activeTab === "students" && "Student Management"}
          {activeTab === "analytics" && "Analytics"}
          {activeTab === "vendor-auth" && "Vendor Authentication"}
        </h2>

        {/* Content Based on Active Tab */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {activeTab === "overview" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Transactions Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Transactions</p>
                      <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Total Amount Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">₹{totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Average Transaction Card */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Average Transaction</p>
                      <p className="text-2xl font-bold text-gray-900">₹{averageTransactionAmount.toFixed(2)}</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full">
                      <CreditCard className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>

                {/* Total Students Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold text-gray-900">{uniqueStudentsCount}</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions Table */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {studentTransactions.slice(0, 5).map((transaction, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.TransactionDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.StudentID}
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

          {activeTab === "transactions" && (
            <div>
              {/* Filters */}
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
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
                  <div>
                    <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Student
                    </label>
                    <select
                      id="student-select"
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Select student"
                    >
                      <option value="all">All Students</option>
                      {uniqueStudents.map(studentId => (
                        <option key={studentId} value={studentId}>{studentId}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                      onClick={() => {/* Add export functionality */}}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
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
                      {sortedTransactions.map((transaction, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.TransactionDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.StudentID}
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

          {activeTab === "students" && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uniqueStudents.map(studentId => {
                  const studentSpecificTransactions = studentTransactions.filter((t: Transaction) => t.StudentID === studentId);
                  const totalSpent = studentSpecificTransactions.reduce((acc: number, curr: Transaction) => acc + curr.TotalAmount, 0);
                  const transactionCount = studentSpecificTransactions.length;

                  return (
                    <div key={studentId} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">Student ID: {studentId}</h4>
                          <p className="text-sm text-gray-500">Total Transactions: {transactionCount}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Spent:</span>
                          <span className="font-medium text-gray-900">₹{totalSpent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Average Transaction:</span>
                          <span className="font-medium text-gray-900">₹{(totalSpent / transactionCount).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending by Category */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h4 className="text-lg font-medium mb-4">Spending by Category</h4>
                  <div className="h-[300px]">
                    <Bar
                      data={{
                        labels: ['Bookstore', 'Stationery', 'Canteen', 'Xerox'],
                        datasets: [{
                          label: 'Total Amount Spent',
                          data: [
                            studentTransactions.reduce((acc: number, curr: Transaction) => curr.Category === 'Bookstore' ? acc + curr.TotalAmount : acc, 0),
                            studentTransactions.reduce((acc: number, curr: Transaction) => curr.Category === 'Stationery' ? acc + curr.TotalAmount : acc, 0),
                            studentTransactions.reduce((acc: number, curr: Transaction) => curr.Category === 'Canteen' ? acc + curr.TotalAmount : acc, 0),
                            studentTransactions.reduce((acc: number, curr: Transaction) => curr.Category === 'Xerox' ? acc + curr.TotalAmount : acc, 0),
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
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h4 className="text-lg font-medium mb-4">Category Distribution</h4>
                  <div className="h-[300px]">
                    <Doughnut
                      data={{
                        labels: ['Bookstore', 'Stationery', 'Canteen', 'Xerox'],
                        datasets: [{
                          data: [
                            studentTransactions.reduce((acc: number, curr: Transaction) => curr.Category === 'Bookstore' ? acc + curr.TotalAmount : acc, 0),
                            studentTransactions.reduce((acc: number, curr: Transaction) => curr.Category === 'Stationery' ? acc + curr.TotalAmount : acc, 0),
                            studentTransactions.reduce((acc: number, curr: Transaction) => curr.Category === 'Canteen' ? acc + curr.TotalAmount : acc, 0),
                            studentTransactions.reduce((acc: number, curr: Transaction) => curr.Category === 'Xerox' ? acc + curr.TotalAmount : acc, 0),
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
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Spending Trend */}
                <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                  <h4 className="text-lg font-medium mb-4">Spending Trend</h4>
                  <div className="h-[300px]">
                    <Line
                      data={{
                        labels: Array.from(new Set(studentTransactions.map((t: Transaction) => t.TransactionDate.split(' ')[0]))).sort(),
                        datasets: [{
                          label: 'Daily Spending',
                          data: Array.from(new Set(studentTransactions.map((t: Transaction) => t.TransactionDate.split(' ')[0]))).sort().map(date => 
                            studentTransactions
                              .filter((t: Transaction) => t.TransactionDate.startsWith(date))
                              .reduce((acc: number, curr: Transaction) => acc + curr.TotalAmount, 0)
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
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "vendor-auth" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Vendor Authentication</h3>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  onClick={() => setShowAddVendorModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Vendor
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Filters */}
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search vendors..."
                      value={vendorSearchTerm}
                      onChange={(e) => setVendorSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Status
                    </label>
                    <select
                      id="status-select"
                      value={vendorStatusFilter}
                      onChange={(e) => setVendorStatusFilter(e.target.value as Vendor['status'] | 'all')}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Select vendor status"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Vendors List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors
                  .filter(vendor => {
                    const matchesSearch = 
                      (vendor.businessName?.toLowerCase() || '').includes(vendorSearchTerm.toLowerCase()) ||
                      (vendor.businessId?.toLowerCase() || '').includes(vendorSearchTerm.toLowerCase()) ||
                      (vendor.email?.toLowerCase() || '').includes(vendorSearchTerm.toLowerCase());
                    const matchesStatus = vendorStatusFilter === "all" || vendor.status === vendorStatusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .map(vendor => (
                    <div key={vendor.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{vendor.businessName}</h4>
                          <p className="text-sm text-gray-500">Business ID: {vendor.businessId}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium
                          ${(vendor.status || 'pending') === 'approved' ? 'bg-green-100 text-green-800' :
                            (vendor.status || 'pending') === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                          {(vendor.status || 'pending').charAt(0).toUpperCase() + (vendor.status || 'pending').slice(1)}
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Store className="w-4 h-4 mr-2" />
                          {vendor.address}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <CreditCard className="w-4 h-4 mr-2" />
                          {vendor.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {vendor.phone}
                        </div>
                      </div>

                      {vendor.status === 'rejected' && vendor.rejectionReason && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">
                            <span className="font-medium">Rejection Reason:</span> {vendor.rejectionReason}
                          </p>
                        </div>
                      )}

                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center">
                          <div className="space-x-2">
                            {vendor.status === 'pending' && (
                              <>
                                <button
                                  className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors flex items-center"
                                  onClick={() => handleApproveVendor(vendor.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </button>
                                <button
                                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors flex items-center"
                                  onClick={() => {
                                    setSelectedVendor(vendor);
                                    setShowRejectModal(true);
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                          <button
                            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setShowVendorDetailsModal(true);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Vendor Modal */}
      {showAddVendorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Vendor</h3>
              <button
                onClick={() => setShowAddVendorModal(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="business-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  id="business-name"
                  type="text"
                  value={newVendor.businessName}
                  onChange={(e) => setNewVendor({ ...newVendor, businessName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <label htmlFor="business-id" className="block text-sm font-medium text-gray-700 mb-1">
                  Business ID
                </label>
                <input
                  id="business-id"
                  type="text"
                  value={newVendor.businessId}
                  onChange={(e) => setNewVendor({ ...newVendor, businessId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter business ID"
                />
              </div>
              <div>
                <label htmlFor="gov-id" className="block text-sm font-medium text-gray-700 mb-1">
                  Government ID
                </label>
                <input
                  id="gov-id"
                  type="text"
                  value={newVendor.govId}
                  onChange={(e) => setNewVendor({ ...newVendor, govId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter government ID"
                />
              </div>
              <div>
                <label htmlFor="vendor-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="vendor-email"
                  type="email"
                  value={newVendor.email}
                  onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label htmlFor="vendor-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  id="vendor-phone"
                  type="tel"
                  value={newVendor.phone}
                  onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label htmlFor="vendor-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  id="vendor-address"
                  value={newVendor.address}
                  onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter business address"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddVendorModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                aria-label="Cancel adding vendor"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVendor}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                aria-label="Add new vendor"
              >
                Add Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Details Modal */}
      {showVendorDetailsModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Vendor Details</h3>
              <button
                onClick={() => setShowVendorDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close vendor details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Business Information</h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Business Name</p>
                    <p className="font-medium">{selectedVendor.businessName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Business ID</p>
                    <p className="font-medium">{selectedVendor.businessId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Government ID</p>
                    <p className="font-medium">{selectedVendor.govId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${(selectedVendor.status || 'pending') === 'approved' ? 'bg-green-100 text-green-800' :
                        (selectedVendor.status || 'pending') === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {(selectedVendor.status || 'pending').charAt(0).toUpperCase() + (selectedVendor.status || 'pending').slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedVendor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{selectedVendor.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{selectedVendor.address}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Documents</h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Business ID Document</p>
                    <a
                      href={selectedVendor.documents.businessId}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      View Document
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Government ID Document</p>
                    <a
                      href={selectedVendor.documents.govId}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      View Document
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowVendorDetailsModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Close
              </button>
              {selectedVendor.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApproveVendor(selectedVendor.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Vendor Modal */}
      {showRejectModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Reject Vendor</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason
                </label>
                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Enter reason for rejection"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (rejectionReason.trim()) {
                    handleRejectVendor(selectedVendor.id, rejectionReason);
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }
                }}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Reject Vendor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
