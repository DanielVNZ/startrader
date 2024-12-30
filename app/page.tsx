"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "ai/react";
import va from "@vercel/analytics";
import clsx from "clsx";
import { LoadingCircle, SendIcon } from "./icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Textarea from "react-textarea-autosize";
import { toast } from "sonner";
import Image from "next/image";

export default function Chat() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [usageCost, setUsageCost] = useState<number | null>(null);

  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day");
        va.track("Rate limited");
        return;
      } else {
        va.track("Chat initiated");
        scrollToBottom();
      }
    },
    onError: (error) => {
      va.track("Chat errored", {
        input,
        error: error.message,
      });
    },
  });

  const disabled = isLoading || input.length === 0;

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

  // Fetch daily usage cost
  useEffect(() => {
    async function fetchUsage() {
      try {
        const today = new Date().toISOString().split("T")[0]; // Get today's date
        const response = await fetch(
          `https://api.openai.com/v1/dashboard/billing/usage?start_date=${today}&end_date=${today}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const totalUsage = data.total_usage || 0;
          setUsageCost(totalUsage / 100); // Convert from cents to dollars
        } else {
          console.error("Failed to fetch usage:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching usage:", error);
      }
    }

    fetchUsage();
  }, []);

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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <main className="flex flex-col items-center justify-between min-h-screen bg-gray-200 dark:bg-gray-900 text-black dark:text-white">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-50">
        <div className="flex justify-between items-center px-4 py-3 max-w-screen-md mx-auto">
          {/* Buttons Container */}
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full p-2 shadow-md transition hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full p-2 shadow-md transition hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              🔄
            </button>
          </div>

          {/* Page Title */}
          <h1 className="text-green-500 text-lg font-bold">
            Star Trader - Powered By{" "}
            <a
              href="https://uexcorp.space"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-700"
            >
              UEXCorp.Space
            </a>
          </h1>

          {/* Usage Counter */}
          <div className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full px-3 py-1 shadow-md">
            {usageCost !== null ? (
              <span>
                Usage: <span className="font-bold">${usageCost.toFixed(2)}</span>
              </span>
            ) : (
              <span>Loading Usage...</span>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        className="flex-grow w-full max-w-screen-md overflow-y-auto px-5 sm:px-0 py-4 space-y-4"
        style={{ paddingTop: "96px", paddingBottom: "96px" }}
      >
        {/* Messages rendering logic here */}
      </div>

      {/* Footer Section */}
      <div className="fixed bottom-0 w-full bg-gradient-to-b from-transparent via-gray-100 to-gray-100 dark:via-gray-800 dark:to-gray-900 px-4 py-5 sm:px-6">
        {/* Input Form */}
        <div className="relative flex items-center justify-center max-w-screen-md mx-auto">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 pb-2 pt-3 shadow-lg sm:pb-3 sm:pt-4"
          >
            <Textarea
              ref={inputRef}
              tabIndex={0}
              required
              rows={1}
              autoFocus
              placeholder="How can Star Trader help you today?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  formRef.current?.requestSubmit();
                  e.preventDefault();
                }
              }}
              spellCheck={false}
              className="w-full pr-10 focus:outline-none dark:bg-gray-800 dark:text-white"
            />
            <button
              className={clsx(
                "absolute inset-y-0 right-3 my-auto flex h-8 w-8 items-center justify-center rounded-md transition-all",
                disabled
                  ? "cursor-not-allowed bg-white dark:bg-gray-800"
                  : "bg-green-500 hover:bg-green-600"
              )}
              disabled={disabled}
            >
              {isLoading ? (
                <LoadingCircle />
              ) : (
                <SendIcon
                  className={clsx(
                    "h-4 w-4",
                    input.length === 0 ? "text-gray-300" : "text-white"
                  )}
                />
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
