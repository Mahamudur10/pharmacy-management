import "./globals.css";
import AuthProvider from "./context/AuthContext";

export const metadata = {
  title: "Pharmacy Management System",
  description: "Complete pharmacy management solution",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className="bg-gray-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}