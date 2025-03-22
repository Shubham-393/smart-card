// // "use client";

// // import Link from "next/link";
// // import { usePathname, useRouter } from "next/navigation";
// // import { cn } from "@/lib/utils";
// // import { Button } from "@/components/ui/button";
// // import { School, CreditCard, History, Home, LogOut, LogIn, UserPlus } from "lucide-react";
// // import { useEffect, useState } from "react";
// // import { auth } from "@/app/firebase";
// // import { onAuthStateChanged, signOut } from "firebase/auth";

// // const defaultRoutes = [
// //   {
// //     label: "Home",
// //     icon: Home,
// //     href: "/",
// //     color: "text-sky-500",
// //   },
// // ];

// // const studentRoutes = [
// //   {
// //     label: "Dashboard",
// //     icon: School,
// //     href: "/dashboard/student",
// //     color: "text-sky-500",
// //   },
// //   {
// //     label: "Wallet",
// //     icon: CreditCard,
// //     href: "/wallet",
// //     color: "text-violet-500",
// //   },
// //   {
// //     label: "Transactions",
// //     icon: History,
// //     href: "/transactions",
// //     color: "text-pink-700",
// //   },
// // ];

// // export function Navbar() {
// //   const pathname = usePathname();
// //   const router = useRouter();
// //   const [isAuthenticated, setIsAuthenticated] = useState(false);
// //   const currentRoutes = isAuthenticated ? studentRoutes : defaultRoutes;

// //   useEffect(() => {
// //     const unsubscribe = onAuthStateChanged(auth, (user) => {
// //       setIsAuthenticated(!!user);
// //     });

// //     return () => unsubscribe();
// //   }, []);

// //   const handleLogout = async () => {
// //     try {
// //       await signOut(auth);
// //       router.push('/login');
// //     } catch (error) {
// //       console.error("Error signing out:", error);
// //     }
// //   };

// //   return (
// //     <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary h-16">
// //       <div className="flex items-center">
// //         <Link href="/" className="flex items-center">
// //           <School className="h-8 w-8 text-primary mr-2" />
// //           <h1 className="text-xl font-bold text-primary">Smart Campus Pay</h1>
// //         </Link>
// //       </div>
// //       <div className="flex items-center gap-x-3">
// //         {currentRoutes.map((route) => (
// //           <Link
// //             key={route.href}
// //             href={route.href}
// //             className={cn(
// //               "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
// //               pathname === route.href ? "text-primary bg-primary/10" : "text-muted-foreground"
// //             )}
// //           >
// //             <div className="flex items-center flex-1">
// //               <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
// //               {route.label}
// //             </div>
// //           </Link>
// //         ))}
        
// //         {!isAuthenticated ? (
// //           <>
// //             <Link href="/login">
// //               <Button variant="ghost" className="flex items-center gap-2">
// //                 <LogIn className="h-4 w-4" />
// //                 Login
// //               </Button>
// //             </Link>
// //             <Link href="/register">
// //               <Button className="flex items-center gap-2">
// //                 <UserPlus className="h-4 w-4" />
// //                 Sign Up
// //               </Button>
// //             </Link>
// //           </>
// //         ) : (
// //           <Button 
// //             variant="ghost" 
// //             className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
// //             onClick={handleLogout}
// //           >
// //             <LogOut className="h-4 w-4" />
// //             Logout
// //           </Button>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { School, CreditCard, History, Home, LogOut, LogIn, UserPlus } from "lucide-react";
// import { useEffect, useState } from "react";
// import { auth } from "@/app/firebase";
// import { onAuthStateChanged, signOut } from "firebase/auth";

// const defaultRoutes = [
//   {
//     label: "Home",
//     icon: Home,
//     href: "/",
//     color: "text-sky-500",
//   },
// ];

// const studentRoutes = [
//   {
//     label: "Dashboard",
//     icon: School,
//     href: "/dashboard/student",
//     color: "text-sky-500",
//   },
//   {
//     label: "Wallet",
//     icon: CreditCard,
//     href: "/wallet",
//     color: "text-violet-500",
//   },
//   {
//     label: "Transactions",
//     icon: History,
//     href: "/transactions",
//     color: "text-pink-700",
//   },
// ];

// export function Navbar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const currentRoutes = isAuthenticated ? studentRoutes : defaultRoutes;

//   // Track authentication state
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setIsAuthenticated(!!user);
//     });

//     return () => unsubscribe();
//   }, []);

//   // Handle logout
//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       router.push('/login');
//     } catch (error) {
//       console.error("Error signing out:", error);
//     }
//   };

//   return (
//     <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary h-16">
//       {/* Logo and Branding */}
//       <div className="flex items-center">
//         <Link href="/" className="flex items-center">
//           <School className="h-8 w-8 text-primary mr-2" />
//           <h1 className="text-xl font-bold text-primary">Smart Campus Pay</h1>
//         </Link>
//       </div>

//       {/* Navigation Links */}
//       <div className="flex items-center gap-x-3">
//         {currentRoutes.map((route) => (
//           <Link
//             key={route.href}
//             href={route.href}
//             className={cn(
//               "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
//               pathname === route.href ? "text-primary bg-primary/10" : "text-muted-foreground"
//             )}
//           >
//             <div className="flex items-center flex-1">
//               <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
//               {route.label}
//             </div>
//           </Link>
//         ))}

//         {/* Conditional Rendering for Login/Sign Up or Logout */}
//         {!isAuthenticated ? (
//           <>
//             <Link href="/login">
//               <Button variant="ghost" className="flex items-center gap-2">
//                 <LogIn className="h-4 w-4" />
//                 Login
//               </Button>
//             </Link>
//             <Link href="/register">
//               <Button className="flex items-center gap-2">
//                 <UserPlus className="h-4 w-4" />
//                 Sign Up
//               </Button>
//             </Link>
//           </>
//         ) : (
//           <Button
//             variant="ghost"
//             className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
//             onClick={handleLogout}
//           >
//             <LogOut className="h-4 w-4" />
//             Logout
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { School, CreditCard, History, Home, LogOut, LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { auth } from "@/app/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const defaultRoutes = [
  {
    label: "Home",
    icon: Home,
    href: "/",
    color: "text-sky-500",
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
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const currentRoutes = isAuthenticated ? studentRoutes : defaultRoutes;

  // Track authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("User:", user); // Debugging: Check if user is logged in
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary h-16">
      {/* Logo and Branding */}
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <School className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-xl font-bold text-primary">Smart Campus Pay</h1>
        </Link>
      </div>

      {/* Navigation Links */}
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

        {/* Conditional Rendering for Login/Sign Up or Logout */}
        {!isAuthenticated ? (
          <>
            <Link href="/login">
              <Button variant="ghost" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Button>
            </Link>
          </>
        ) : (
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}