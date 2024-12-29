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
          <a
            href="https://ko-fi.com/danielvnz"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full p-2 shadow-md transition hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            💗
          </a>
        </div>
      </div>

      {/* Content Container */}
      <div
        className="flex-grow w-full max-w-screen-md overflow-y-auto px-5 sm:px-0 py-4 space-y-4"
        style={{ paddingTop: "96px", paddingBottom: "96px" }}
      >
        {/* Changelog Section */}
        <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Recent Changelog
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li><strong>v1.0.2</strong> - Improved chat interface and added markdown support. (2024-12-28)</li>
            <li><strong>v1.0.1</strong> - Fixed dark mode toggle bug. (2024-12-27)</li>
            <li><strong>v1.0.0</strong> - Initial release of the chat application. (2024-12-25)</li>
          </ul>
        </section>

        {/* Known Issues Section */}
        <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Known Issues
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Rate limit error messages occasionally persist longer than expected.</li>
            <li>Scroll to bottom feature sometimes fails on slow connections.</li>
            <li>Dark mode toggle may reset on certain browsers after page refresh.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
