"use client";

import { useEffect, useState } from "react";

export default function ChangelogAndIssues() {
  // State for Dark/Light mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
        ? true
        : false;
    }
    return false;
  });

  const [showDonateModal, setShowDonateModal] = useState(false);

  // Apply the Dark/Light mode to the html element
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      htmlElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  return (
    <main className="flex flex-col items-center justify-between min-h-screen bg-gray-200 dark:bg-gray-900 text-black dark:text-white">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-50">
        <div className="flex justify-between items-center px-4 py-3 max-w-screen-md mx-auto">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full p-2 shadow-md transition hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>

          {/* Page Title */}
          <h1 className="text-green-500 text-lg font-bold">
            Changelog & Known Issues
          </h1>

          {/* Donate Button */}
          <button
            onClick={() => setShowDonateModal(true)}
            className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full p-2 shadow-md transition hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            💗
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div
        className="flex-grow w-full max-w-screen-md overflow-y-auto px-5 sm:px-0 py-4 space-y-4"
        style={{ paddingTop: "96px", paddingBottom: "96px" }}
      >
        {/* About Section */}
        <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            About
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome to <strong>Star Trader</strong>, your companion for navigating the trading universe of Star Citizen. Explore features, contribute, and stay updated through our GitHub repository. Take a look  
            <a
              href="https://github.com/DanielVNZ/startrader"
              className="text-green-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              &nbsp;
               Here
            </a>
          </p>
        </section>

        {/* Changelog Section */}
        <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Recent Changelog
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li><strong>v1.0.3</strong> - Dialed up the "fun" level, added API caching for up to 60 minutes to reduce API calls while retaining data accuracy(30-12-2024 - 2)</li>
            <li><strong>v1.0.2</strong> - Added more UI buttons/Donation Information (30-12-2024)</li>
            <li><strong>v1.0.1</strong> - Fixed dark mode toggle bug. (29-12-2024 - 2)</li>
            <li><strong>v1.0.0</strong> - Initial release of the chat application (29-12-2024)</li>
          </ul>
        </section>

        {/* Known Issues Section */}
        <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Known Issues
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Users are unable to search for a list of commodities at a specific location.</li>
            <li>Users are unable to ask for the most profitable commodity to trade.</li>
            <li>Dark mode toggle may reset on certain browsers after page refresh.</li>
            <li>Dark mode may flicker white when reloading the page.</li>
          </ul>
        </section>
      </div>

      {/* Donation Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
            <button
              onClick={() => setShowDonateModal(false)}
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              ✖
            </button>
            <iframe
              id="kofiframe"
              src="https://ko-fi.com/danielvnz/?hidefeed=true&widget=true&embed=true&preview=true"
              style={{ border: "none", width: "100%", padding: "4px", background: "#f9f9f9" }}
              height="712"
              title="danielvnz"
            ></iframe>
          </div>
        </div>
      )}
    </main>
  );
}
