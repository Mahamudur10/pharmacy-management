import "./globals.css";
import AuthProvider from "./context/AuthContext";
import ThemeProvider from "./context/ThemeContext";

export const metadata = {
  title: "Pharmacy Management System",
  description: "Complete pharmacy management solution",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}