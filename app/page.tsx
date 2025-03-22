import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { School, CreditCard, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 text-center bg-gradient-to-b from-secondary to-background">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-primary mb-6">
            Smart Campus Payment Solution
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Secure, fast, and convenient payments for your educational institution
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6">
              <School className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Student Smart Card</h3>
              <p className="text-muted-foreground">
                QR-based digital ID and payment solution for students
              </p>
            </Card>
            <Card className="p-6">
              <CreditCard className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Digital Wallet</h3>
              <p className="text-muted-foreground">
                Secure digital wallet with instant recharge options
              </p>
            </Card>
            <Card className="p-6">
              <ShieldCheck className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-muted-foreground">
                End-to-end encrypted transactions with fraud protection
              </p>
            </Card>
            <Card className="p-6">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-user Access</h3>
              <p className="text-muted-foreground">
                Dedicated dashboards for students, parents, and vendors
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}