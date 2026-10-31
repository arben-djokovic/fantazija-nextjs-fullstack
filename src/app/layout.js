import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/cart-context";
import FloatingCart from "@/components/FloatingCart";


export const metadata = {
  title: "Poslastičarnica",
  description: "Poslastičarnica",
};

export default function RootLayout({ children }) {
  return (
    <html lang="me">
      <body className="min-h-full w-full flex flex-col bg-white">
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <FloatingCart />
        </CartProvider>
      </body>
    </html>
  );
}
