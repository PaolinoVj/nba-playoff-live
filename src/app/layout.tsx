"use client";
import "./globals.css";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <html lang="en">
      <body>
        {/* NBA Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* NBA Logo + Title */}
              <div className="flex items-center space-x-4">
                <img
                  src="https://logoeps.com/wp-content/uploads/2013/03/nba-vector-logo.png"
                  alt="NBA Logo"
                  className="h-10 w-auto"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    NBA 2024-25
                  </h1>
                  <p className="text-sm text-gray-500">Live Stats & Scores</p>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                {theme === "light" ? "🌙 Dark" : "☀️ Light"}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>{children}</main>
      </body>
    </html>
  );
}
