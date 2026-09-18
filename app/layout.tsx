import { Fraunces, Work_Sans } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MetaPixel from "../components/MetaPixel";
import { AuthProvider } from "../lib/authContext";
import { CartProvider } from "../lib/cartContext";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Cosmetics Store",
  description: "Shop skincare, makeup, and haircare online.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${workSans.variable}`}>
      <body className="font-sans flex min-h-screen flex-col">
        <MetaPixel />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
