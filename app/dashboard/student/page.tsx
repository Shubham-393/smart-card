"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  QrCode,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const [showQR, setShowQR] = useState(false);
  const [balance] = useState(1250.00);
  const [dailyLimit] = useState(200);
  const [spentToday] = useState(120);

  const remainingDaily = dailyLimit - spentToday;
  const dailyProgress = (spentToday / dailyLimit) * 100;

  return (
    <div className="pt-20 p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <Button variant="outline" onClick={() => setShowQR(!showQR)}>
          <QrCode className="h-4 w-4 mr-2" />
          {showQR ? "Hide QR Code" : "Show QR Code"}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Wallet Balance</h3>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold mb-2">₹{balance.toFixed(2)}</p>
          <Progress value={dailyProgress} className="mb-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily Limit: ₹{dailyLimit}</span>
            <span className={remainingDaily < 50 ? "text-destructive" : "text-muted-foreground"}>
              ₹{remainingDaily} remaining
            </span>
          </div>
          {remainingDaily < 50 && (
            <div className="mt-4 flex items-center text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>Low daily balance warning</span>
            </div>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Recent Activity</h3>
            <History className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-2" />
                <div>
                  <p className="font-medium">Wallet Recharge</p>
                  <p className="text-sm text-muted-foreground">Today, 10:30 AM</p>
                </div>
              </div>
              <p className="text-green-500">+₹500</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-2" />
                <div>
                  <p className="font-medium">Cafeteria Payment</p>
                  <p className="text-sm text-muted-foreground">Today, 9:15 AM</p>
                </div>
              </div>
              <p className="text-red-500">-₹150</p>
            </div>
          </div>
          <Button className="w-full mt-4" variant="outline" asChild>
            <Link href="/transactions">View All Transactions</Link>
          </Button>
        </Card>

        {/* QR Code Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Your QR Code</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowQR(!showQR)}
            >
              {showQR ? "Hide" : "Show"}
            </Button>
          </div>
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            {showQR ? (
              <div className="w-full h-full p-4">
                {/* Replace with actual QR code generation */}
                <div className="w-full h-full border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">QR Code</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Click Show to display QR</p>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Show this QR code to make payments
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button className="w-full" asChild>
          <Link href="/transactions">View All Transactions</Link>
        </Button>
        <Button className="w-full" variant="outline" asChild>
          <Link href="/settings">Account Settings</Link>
        </Button>
        <Button className="w-full" variant="outline" asChild>
          <Link href="/help">Get Help</Link>
        </Button>
        <Button className="w-full" variant="outline" asChild>
          <Link href="/limits">Manage Limits</Link>
        </Button>
      </div>
    </div>
  );
}