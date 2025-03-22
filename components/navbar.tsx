"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { School, CreditCard, History, Home, LogIn } from "lucide-react";

const defaultRoutes = [
  {
    label: "Home",
    icon: Home,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Login",
    icon: LogIn,
    href: "/login",
    color: "text-violet-500",
  },
];

const studentRoutes = [
  {
    label: "Dashboard",
    icon: School,
    href: "/dashboard/student",
    color: "text-sky-500",
  },
  {
    label: "Wallet",
    icon: CreditCard,
    href: "/wallet",
    color: "text-violet-500",
  },
  {
    label: "Transactions",
    icon: History,
    href: "/transactions",
    color: "text-pink-700",
  },
];

export function Navbar() {
  const pathname = usePathname();
  // TODO: Replace with actual auth check
  const isAuthenticated = false;
  const currentRoutes = isAuthenticated ? studentRoutes : defaultRoutes;

  return (
    <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary h-16">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <School className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-xl font-bold text-primary">Smart Campus Pay</h1>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        {currentRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
              pathname === route.href ? "text-primary bg-primary/10" : "text-muted-foreground"
            )}
          >
            <div className="flex items-center flex-1">
              <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
              {route.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}