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
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}