// "use client";

// import { useState } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { School } from "lucide-react";
// import Link from "next/link";
// import { db } from "../firebase"; // Adjust the path to your Firebase config
// import { collection, addDoc } from "firebase/firestore";

// export default function RegisterPage() {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     confirmPassword: "",
    
//     userType: "",
//     studentId: "",
//     vendorName: "",
//     vendorPhone: "",
//     vendorBusiness: "",
//     parentName: "",
//     studentName: "",
//     studentRollNo: "",
//     parentPhone: "",
//     upiId: "",
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleUserTypeChange = (value: string) => {
//     setFormData((prev) => ({ ...prev, userType: value }));
//   };

//   const handleVendorBusinessChange = (value: string) => {
//     setFormData((prev) => ({ ...prev, vendorBusiness: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Check if passwords match
//     if (formData.password !== formData.confirmPassword) {
//       alert("Passwords do not match!");
//       return;
//     }

//     try {
//       // Prepare data to be stored in Firestore
//       const userData = {
//         email: formData.email,
//         password: formData.password, // Always hash passwords in production
//         // fullName: formData.fullName,
//         userType: formData.userType,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       // Add additional fields based on user type
//       if (formData.userType === "vendor") {
//         await addDoc(collection(db, "vendors"), {
//           ...userData,
//           vendorName: formData.vendorName,
//           vendorPhone: formData.vendorPhone,
//           vendorBusiness: formData.vendorBusiness,
//           upiId: formData.upiId,
//         });
//       } else if (formData.userType === "parent") {
//         await addDoc(collection(db, "parents"), {
//           ...userData,
//           parentName: formData.parentName,
//           parentPhone: formData.parentPhone,
//           studentName: formData.studentName,
//           studentId: formData.studentId,
//           studentRollNo: formData.studentRollNo,
//         });
//       }

//       console.log("Registration successful!");
//       alert("Registration successful!");
//     } catch (error) {
//       console.error("Error registering user: ", error);
//       alert("Registration failed. Please try again.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4 py-8">
//       <Card className="w-full max-w-md p-8">
//         <div className="flex flex-col items-center space-y-2 mb-8">
//           <School className="h-12 w-12 text-primary" />
//           <h1 className="text-2xl font-bold text-center">Create Account</h1>
//           <p className="text-muted-foreground text-center">
//             Join Smart Campus Pay to get started
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Common Fields */}
         
//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               name="email"
//               type="email"
//               placeholder="example@example.com"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="userType">I am a</Label>
//             <Select
//               value={formData.userType}
//               onValueChange={handleUserTypeChange}
//               required
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select user type" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="parent">Parent</SelectItem>
//                 <SelectItem value="vendor">Vendor</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Vendor-Specific Fields */}
//           {formData.userType === "vendor" && (
//             <>
//               <div className="space-y-2">
//                 <Label htmlFor="vendorName">Vendor Name</Label>
//                 <Input
//                   id="vendorName"
//                   name="vendorName"
//                   type="text"
//                   placeholder="Enter vendor name"
//                   value={formData.vendorName}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="vendorPhone">Phone Number</Label>
//                 <Input
//                   id="vendorPhone"
//                   name="vendorPhone"
//                   type="text"
//                   placeholder="Enter phone number"
//                   value={formData.vendorPhone}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="vendorBusiness">Business Type</Label>
//                 <Select
//                   value={formData.vendorBusiness}
//                   onValueChange={handleVendorBusinessChange}
//                   required
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select business type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Bookstore">Bookstore</SelectItem>
//                     <SelectItem value="Canteen">Canteen</SelectItem>
//                     <SelectItem value="Fare">Fare</SelectItem>
//                     <SelectItem value="Xerox">Xerox</SelectItem>
//                     <SelectItem value="Stationary">Stationary</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="upiId">UPI ID</Label>
//                 <Input
//                   id="upiId"
//                   name="upiId"
//                   type="text"
//                   placeholder="Enter UPI ID"
//                   value={formData.upiId}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//             </>
//           )}

//           {/* Parent-Specific Fields */}
//           {formData.userType === "parent" && (
//             <>
//               <div className="space-y-2">
//                 <Label htmlFor="parentName">Parent Name</Label>
//                 <Input
//                   id="parentName"
//                   name="parentName"
//                   type="text"
//                   placeholder="Enter parent name"
//                   value={formData.parentName}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="studentName">Student Name</Label>
//                 <Input
//                   id="studentName"
//                   name="studentName"
//                   type="text"
//                   placeholder="Enter student name"
//                   value={formData.studentName}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="studentId">Student ID</Label>
//                 <Input
//                   id="studentId"
//                   name="studentId"
//                   type="text"
//                   placeholder="Enter student ID"
//                   value={formData.studentId}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="studentRollNo">Student Roll Number</Label>
//                 <Input
//                   id="studentRollNo"
//                   name="studentRollNo"
//                   type="text"
//                   placeholder="Enter student roll number"
//                   value={formData.studentRollNo}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="parentPhone">Parent Phone</Label>
//                 <Input
//                   id="parentPhone"
//                   name="parentPhone"
//                   type="text"
//                   placeholder="Enter parent phone number"
//                   value={formData.parentPhone}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//             </>
//           )}

//           {/* Common Fields */}
//           <div className="space-y-2">
//             <Label htmlFor="password">Password</Label>
//             <Input
//               id="password"
//               name="password"
//               type="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="confirmPassword">Confirm Password</Label>
//             <Input
//               id="confirmPassword"
//               name="confirmPassword"
//               type="password"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <Button type="submit" className="w-full">
//             Create Account
//           </Button>
//         </form>

//         <div className="mt-8 pt-6 border-t text-center text-sm">
//           <p className="text-muted-foreground">
//             Already have an account?{" "}
//             <Link href="/login" className="text-primary hover:underline">
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </Card>
//     </div>
//   );
// }




"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School } from "lucide-react";
import Link from "next/link";
import { db } from "../firebase"; // Adjust the path to your Firebase config
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
    studentId: "",
    vendorName: "",
    vendorPhone: "",
    vendorBusiness: "",
    parentName: "",
    studentName: "",
    studentRollNo: "",
    parentPhone: "",
    upiId: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, userType: value }));
  };

  const handleVendorBusinessChange = (value: string) => {
    setFormData((prev) => ({ ...prev, vendorBusiness: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      // Check if the email already exists in the database
      const usersRef = collection(db, formData.userType === "vendor" ? "vendors" : "parents");
      const q = query(usersRef, where("email", "==", formData.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError("Email already exists. Please use a different email.");
        return;
      }

      // Prepare data to be stored in Firestore
      const userData = {
        email: formData.email,
        password: formData.password, // Always hash passwords in production
        userType: formData.userType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add additional fields based on user type
      if (formData.userType === "vendor") {
        await addDoc(collection(db, "vendors"), {
          ...userData,
          vendorName: formData.vendorName,
          vendorPhone: formData.vendorPhone,
          vendorBusiness: formData.vendorBusiness,
          upiId: formData.upiId,
        });
      } else if (formData.userType === "parent") {
        await addDoc(collection(db, "parents"), {
          ...userData,
          parentName: formData.parentName,
          parentPhone: formData.parentPhone,
          studentName: formData.studentName,
          studentId: formData.studentId,
          studentRollNo: formData.studentRollNo,
        });
      }

      console.log("Registration successful!");
      alert("Registration successful!");
      setError(""); // Clear any previous errors
    } catch (error) {
      console.error("Error registering user: ", error);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4 py-8">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center space-y-2 mb-8">
          <School className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold text-center">Create Account</h1>
          <p className="text-muted-foreground text-center">
            Join Smart Campus Pay to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common Fields */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userType">I am a</Label>
            <Select
              value={formData.userType}
              onValueChange={handleUserTypeChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vendor-Specific Fields */}
          {formData.userType === "vendor" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="vendorName">Vendor Name</Label>
                <Input
                  id="vendorName"
                  name="vendorName"
                  type="text"
                  placeholder="Enter vendor name"
                  value={formData.vendorName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendorPhone">Phone Number</Label>
                <Input
                  id="vendorPhone"
                  name="vendorPhone"
                  type="text"
                  placeholder="Enter phone number"
                  value={formData.vendorPhone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendorBusiness">Business Type</Label>
                <Select
                  value={formData.vendorBusiness}
                  onValueChange={handleVendorBusinessChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bookstore">Bookstore</SelectItem>
                    <SelectItem value="Canteen">Canteen</SelectItem>
                    <SelectItem value="Fare">Fare</SelectItem>
                    <SelectItem value="Xerox">Xerox</SelectItem>
                    <SelectItem value="Stationary">Stationary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  name="upiId"
                  type="text"
                  placeholder="Enter UPI ID"
                  value={formData.upiId}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {/* Parent-Specific Fields */}
          {formData.userType === "parent" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="parentName">Parent Name</Label>
                <Input
                  id="parentName"
                  name="parentName"
                  type="text"
                  placeholder="Enter parent name"
                  value={formData.parentName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  name="studentName"
                  type="text"
                  placeholder="Enter student name"
                  value={formData.studentName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  type="text"
                  placeholder="Enter student ID"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentRollNo">Student Roll Number</Label>
                <Input
                  id="studentRollNo"
                  name="studentRollNo"
                  type="text"
                  placeholder="Enter student roll number"
                  value={formData.studentRollNo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Parent Phone</Label>
                <Input
                  id="parentPhone"
                  name="parentPhone"
                  type="text"
                  placeholder="Enter parent phone number"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {/* Common Fields */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}