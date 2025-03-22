"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, CreditCard, Box, PieChart, User, Store, Phone, Mail, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Bar, Doughnut, Line, Scatter } from 'react-chartjs-2';
import vendorCanteenData from './vendor_canteen.json';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface VendorData {
  vendorName: string;
  email: string;
  vendorBusiness: string;
  vendorPhone: string;
  upiId: string;
}

interface BillItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface VendorTransaction {
  Vendor_Email: string;
  Date: string;
  Item: string;
  Quantity_Sold: number;
  Revenue: number;
  Profit: number;
}

interface AnalyticsData {
  revenueProfit: {
    [date: string]: { revenue: number; profit: number };
  };
  topSelling: {
    [item: string]: { quantity: number; revenue: number };
  };
  profitMargin: {
    [item: string]: { revenue: number; profit: number };
  };
  categoryDistribution: {
    [category: string]: number;
  };
  heatmap: {
    [day: number]: {
      [timeSlot: string]: number;
    };
  };
}

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [items, setItems] = useState<BillItem[]>([]);
  const [selectedPlot, setSelectedPlot] = useState("revenue-profit");
  const [newItem, setNewItem] = useState<BillItem>({
    id: Date.now(),
    name: "",
    quantity: 1,
    price: 0,
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const router = useRouter();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#1F2937',
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6B7280'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280'
        }
      }
    }
  };

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

  useEffect(() => {
    if (activeTab === "analytics") {
      processAnalyticsData();
    }
  }, [activeTab]);

  const addItem = () => {
    if (newItem.name && newItem.price > 0) {
      setItems([...items, newItem]);
      setNewItem({
        id: Date.now(),
        name: "",
        quantity: 1,
        price: 0,
      });
    }
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const processAnalyticsData = () => {
    // Process data for different visualizations
    const data = vendorCanteenData;

    // 1. Revenue and Profit Over Time
    const revenueProfitData = data.reduce((acc: any, curr: any) => {
      const date = curr.Date;
      if (!acc[date]) {
        acc[date] = { revenue: 0, profit: 0 };
      }
      acc[date].revenue += curr.Revenue;
      acc[date].profit += curr.Profit;
      return acc;
    }, {});

    // 2. Top Selling Items
    const topSellingItems = data.reduce((acc: any, curr: any) => {
      if (!acc[curr.Item]) {
        acc[curr.Item] = { quantity: 0, revenue: 0 };
      }
      acc[curr.Item].quantity += curr.Quantity_Sold;
      acc[curr.Item].revenue += curr.Revenue;
      return acc;
    }, {});

    // 3. Profit Margin by Item
    const profitMarginData = data.reduce((acc: any, curr: any) => {
      if (!acc[curr.Item]) {
        acc[curr.Item] = { revenue: 0, profit: 0 };
      }
      acc[curr.Item].revenue += curr.Revenue;
      acc[curr.Item].profit += curr.Profit;
      return acc;
    }, {});

    // 4. Sales Distribution by Category
    const categories = {
      Food: ["Sandwich", "Burger", "Vada Pav", "Samosa", "Puff", "Maggie"],
      Beverages: ["Coffee", "Cold Drink", "Tea"],
      Snacks: ["Chips"]
    };

    const categoryData = Object.entries(categories).reduce((acc: any, [category, items]) => {
      acc[category] = data.reduce((sum: number, curr: any) => {
        if (items.includes(curr.Item)) {
          return sum + curr.Revenue;
        }
        return sum;
      }, 0);
      return acc;
    }, {});

    // 5. Daily Sales Heatmap
    const heatmapData = data.reduce((acc: any, curr: any) => {
      const date = new Date(curr.Date);
      const day = date.getDay();
      const hour = date.getHours();
      const timeSlot = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
      
      if (!acc[day]) acc[day] = {};
      if (!acc[day][timeSlot]) acc[day][timeSlot] = 0;
      acc[day][timeSlot] += curr.Revenue;
      return acc;
    }, {});

    setAnalyticsData({
      revenueProfit: revenueProfitData,
      topSelling: topSellingItems,
      profitMargin: profitMarginData,
      categoryDistribution: categoryData,
      heatmap: heatmapData
    });
  };

  const renderAnalytics = () => {
    if (!analyticsData) return null;

    return (
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <Select value={selectedPlot} onValueChange={setSelectedPlot}>
            <SelectTrigger className="w-[250px] bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm border-2 border-blue-200 shadow-md hover:border-blue-300 transition-all">
              <SelectValue placeholder="Select visualization" className="text-blue-900 font-medium" />
              <span className="text-blue-900 font-bold text-lg">^</span>
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-sm border-2 border-blue-100 shadow-lg">
              <SelectItem value="revenue-profit" className="hover:bg-blue-50 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-blue-900">Revenue and Profit Over Time</span>
                </div>
              </SelectItem>
              <SelectItem value="top-selling" className="hover:bg-green-50 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-green-900">Top Selling Items</span>
                </div>
              </SelectItem>
              <SelectItem value="profit-margin" className="hover:bg-purple-50 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-purple-900">Profit Margin by Item</span>
                </div>
              </SelectItem>
              <SelectItem value="category-distribution" className="hover:bg-orange-50 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-orange-900">Sales Distribution by Category</span>
                </div>
              </SelectItem>
              <SelectItem value="heatmap" className="hover:bg-pink-50 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                  <span className="text-pink-900">Daily Sales Heatmap</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 max-w-5xl mx-auto">
          {selectedPlot === "revenue-profit" && (
            <div className="transform hover:scale-[1.02] transition-transform duration-300">
              {renderRevenueProfitChart()}
            </div>
          )}
          {selectedPlot === "top-selling" && (
            <div className="transform hover:scale-[1.02] transition-transform duration-300">
              {renderTopSellingItems()}
            </div>
          )}
          {selectedPlot === "profit-margin" && (
            <div className="transform hover:scale-[1.02] transition-transform duration-300">
              {renderProfitMarginChart()}
            </div>
          )}
          {selectedPlot === "category-distribution" && (
            <div className="transform hover:scale-[1.02] transition-transform duration-300">
              {renderCategoryDistribution()}
            </div>
          )}
          {selectedPlot === "heatmap" && (
            <div className="transform hover:scale-[1.02] transition-transform duration-300">
              {renderHeatmap()}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRevenueProfitChart = () => {
    if (!analyticsData) return null;
    const dates = Object.keys(analyticsData.revenueProfit).sort();
    const data = {
      labels: dates,
      datasets: [
        {
          label: 'Revenue',
          data: dates.map(date => analyticsData.revenueProfit[date].revenue),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2
        },
        {
          label: 'Profit',
          data: dates.map(date => analyticsData.revenueProfit[date].profit),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2
        }
      ]
    };

    return (
      <Card className="bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-blue-900">Revenue and Profit Over Time</CardTitle>
          <CardDescription className="text-blue-600">Track daily trends in revenue and profit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line data={data} options={chartOptions} />
          </div>
          <div className="mt-4 p-4 bg-white/50 rounded-lg border border-blue-100">
            <p className="text-sm font-medium text-blue-900 mb-2">Key Insights:</p>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Peak revenue day: {dates.reduce((max, date) => 
                analyticsData.revenueProfit[date].revenue > analyticsData.revenueProfit[max].revenue ? date : max
              )}</li>
              <li>• Average daily revenue: ₹{Math.round(dates.reduce((sum, date) => 
                sum + analyticsData.revenueProfit[date].revenue, 0) / dates.length)}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTopSellingItems = () => {
    if (!analyticsData) return null;
    const items = Object.entries(analyticsData.topSelling)
      .sort(([, a], [, b]) => (b as { quantity: number }).quantity - (a as { quantity: number }).quantity)
      .slice(0, 5);

    const data = {
      labels: items.map(([item]) => item),
      datasets: [{
        label: 'Quantity Sold',
        data: items.map(([, data]) => (data as { quantity: number }).quantity),
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: '#10B981',
        borderWidth: 2,
        borderRadius: 8
      }]
    };

    return (
      <Card className="bg-gradient-to-br from-white to-green-50 backdrop-blur-sm border-2 border-green-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-green-900">Top Selling Items</CardTitle>
          <CardDescription className="text-green-600">Most popular items by quantity sold</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={data} options={chartOptions} />
          </div>
          <div className="mt-4 p-4 bg-white/50 rounded-lg border border-green-100">
            <p className="text-sm font-medium text-green-900 mb-2">Key Insights:</p>
            <ul className="space-y-1 text-sm text-green-700">
              <li>• Best seller: {items[0][0]} with {(items[0][1] as { quantity: number }).quantity} units</li>
              <li>• Total revenue from top 5: ₹{items.reduce((sum, [, data]) => sum + (data as { revenue: number }).revenue, 0)}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderProfitMarginChart = () => {
    if (!analyticsData) return null;
    const items = Object.entries(analyticsData.profitMargin)
      .map(([item, data]: [string, any]) => ({
        item,
        margin: (data.profit / data.revenue) * 100
      }))
      .sort((a, b) => b.margin - a.margin);

    const data = {
      labels: items.map(item => item.item),
      datasets: [{
        label: 'Profit Margin (%)',
        data: items.map(item => item.margin),
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: '#8B5CF6',
        borderWidth: 2,
        borderRadius: 8
      }]
    };

    return (
      <Card className="bg-gradient-to-br from-white to-purple-50 backdrop-blur-sm border-2 border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-purple-900">Profit Margin by Item</CardTitle>
          <CardDescription className="text-purple-600">Profitability analysis of each item</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={data} options={chartOptions} />
          </div>
          <div className="mt-4 p-4 bg-white/50 rounded-lg border border-purple-100">
            <p className="text-sm font-medium text-purple-900 mb-2">Key Insights:</p>
            <ul className="space-y-1 text-sm text-purple-700">
              <li>• Highest margin: {items[0].item} ({Math.round(items[0].margin)}%)</li>
              <li>• Average margin: {Math.round(items.reduce((sum, item) => sum + item.margin, 0) / items.length)}%</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCategoryDistribution = () => {
    if (!analyticsData) return null;
    const data = {
      labels: Object.keys(analyticsData.categoryDistribution),
      datasets: [{
        data: Object.values(analyticsData.categoryDistribution),
        backgroundColor: [
          'rgba(251, 146, 60, 0.2)',
          'rgba(16, 185, 129, 0.2)',
          'rgba(59, 130, 246, 0.2)',
        ],
        borderColor: [
          '#FB923C',
          '#10B981',
          '#3B82F6',
        ],
        borderWidth: 2
      }]
    };

    return (
      <Card className="bg-gradient-to-br from-white to-orange-50 backdrop-blur-sm border-2 border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-orange-900">Sales Distribution by Category</CardTitle>
          <CardDescription className="text-orange-600">Revenue contribution by product category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Doughnut data={data} options={chartOptions} />
          </div>
          <div className="mt-4 p-4 bg-white/50 rounded-lg border border-orange-100">
            <p className="text-sm font-medium text-orange-900 mb-2">Key Insights:</p>
            <ul className="space-y-1 text-sm text-orange-700">
              <li>• Leading category: {Object.entries(analyticsData.categoryDistribution)
                .reduce((max, [category, revenue]) => 
                  revenue > max.revenue ? { category, revenue } : max
                , { category: '', revenue: 0 }).category}</li>
              <li>• Total revenue: ₹{Object.values(analyticsData.categoryDistribution)
                .reduce((sum: number, revenue: number) => sum + revenue, 0)}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderHeatmap = () => {
    if (!analyticsData) return null;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = ['Morning', 'Afternoon', 'Evening'];
    
    const data = {
      labels: days,
      datasets: timeSlots.map((slot, index) => ({
        label: slot,
        data: days.map((_, dayIndex) => analyticsData.heatmap[dayIndex]?.[slot] || 0),
        backgroundColor: `rgba(236, 72, 153, ${0.2 + index * 0.1})`,
        borderColor: `rgb(236, 72, 153)`,
        borderWidth: 2,
        borderRadius: 8
      }))
    };

    return (
      <Card className="bg-gradient-to-br from-white to-pink-50 backdrop-blur-sm border-2 border-pink-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-pink-900">Daily Sales Heatmap</CardTitle>
          <CardDescription className="text-pink-600">Sales intensity across days and time slots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={data} options={chartOptions} />
          </div>
          <div className="mt-4 p-4 bg-white/50 rounded-lg border border-pink-100">
            <p className="text-sm font-medium text-pink-900 mb-2">Key Insights:</p>
            <ul className="space-y-1 text-sm text-pink-700">
              <li>• Peak sales day: {days.reduce((max, day, index) => 
                Object.values(analyticsData.heatmap[index] || {}).reduce((sum: number, revenue: number) => sum + revenue, 0) >
                Object.values(analyticsData.heatmap[days.indexOf(max)] || {}).reduce((sum: number, revenue: number) => sum + revenue, 0)
                  ? day : max
              )}</li>
              <li>• Peak time slot: {timeSlots.reduce((max, slot) => 
                Object.values(analyticsData.heatmap).reduce((sum: number, day: any) => 
                  sum + (day[slot] || 0), 0) >
                Object.values(analyticsData.heatmap).reduce((sum: number, day: any) => 
                  sum + (day[max] || 0), 0)
                  ? slot : max
              )}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

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
      <div className="flex-1 overflow-auto">
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
              
              {/* Add New Item Form */}
              <Card className="p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      id="itemName"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <Button 
                  onClick={addItem} 
                  className="mt-4 w-full"
                  disabled={!newItem.name || newItem.price <= 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </Card>

              {/* Current Bill Items */}
              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">Current Bill</h2>
                
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No items added to the bill yet</p>
                ) : (
                  <>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-2 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                            <p className="w-24 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-between items-center border-t pt-4">
                      <p className="text-lg font-semibold">Total Amount:</p>
                      <p className="text-2xl font-bold">₹{calculateTotal().toFixed(2)}</p>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setItems([])}
                      >
                        Clear Bill
                      </Button>
                      <Button>
                        Generate Bill
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </div>
          )}

          {activeTab === "analytics" && renderAnalytics()}
        </div>
      </div>
    </div>
  );
}