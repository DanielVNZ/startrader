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
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Replace with your API key securely
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
    <main
      className="flex flex-col items-center justify-between min-h-screen text-black dark:text-white"
      style={{
        backgroundImage: `url(${isDarkMode
          ? "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' width='3840' height='2160' preserveAspectRatio='none' viewBox='0 0 3840 2160'%3e%3cg mask='url(%26quot%3b%23SvgjsMask1101%26quot%3b)' fill='none'%3e%3crect width='3840' height='2160' x='0' y='0' fill='rgba(2%2c 28%2c 57%2c 1)'%3e%3c/rect%3e%3cpath d='M0%2c1340.797C345.725%2c1359.256%2c670.902%2c1668.946%2c995.939%2c1549.711C1323.171%2c1429.671%2c1559.58%2c1085.29%2c1628.133%2c743.543C1693.621%2c417.076%2c1404.411%2c134.268%2c1345.613%2c-193.47C1289.805%2c-504.547%2c1490.44%2c-873.654%2c1293.636%2c-1120.942C1097.569%2c-1367.303%2c705.415%2c-1284.891%2c404.155%2c-1376.426C99.157%2c-1469.096%2c-187.775%2c-1769.161%2c-488.096%2c-1662.302C-790.91%2c-1554.556%2c-818.652%2c-1133.212%2c-1008.426%2c-873.806C-1177.682%2c-642.445%2c-1449.71%2c-493.108%2c-1541.992%2c-221.705C-1643.579%2c77.065%2c-1654.211%2c409.557%2c-1545.526%2c705.818C-1432.632%2c1013.552%2c-1233.056%2c1322.322%2c-929.86%2c1446.89C-635.336%2c1567.895%2c-317.96%2c1323.821%2c0%2c1340.797' fill='%23011429'%3e%3c/path%3e%3cpath d='M3840 3631.398C4123.724 3629.7780000000002 4411.474 3573.699 4644.5380000000005 3411.886 4873.439 3252.9629999999997 5004.36 2998.084 5118.396 2743.824 5231.772 2491.036 5296.7919999999995 2227.087 5300.171 1950.059 5304.03 1633.71 5304.642 1303.893 5139.25 1034.194 4960.669 742.9870000000001 4694.361 441.96399999999994 4354.459 407.91499999999996 4014.274 373.83799999999997 3782.595 752.6400000000001 3460.042 865.983 3162.46 970.5509999999999 2766.0969999999998 812.4570000000001 2549.821 1042.053 2334.487 1270.6480000000001 2479.295 1647.0990000000002 2431.815 1957.534 2383.7650000000003 2271.7 2148.951 2583.172 2269.1130000000003 2877.4 2389.359 3171.835 2742.809 3283.486 3029.534 3421.109 3286.3540000000003 3544.3779999999997 3555.134 3633.025 3840 3631.398' fill='%23032449'%3e%3c/path%3e%3c/g%3e%3cdefs%3e%3cmask id='SvgjsMask1101'%3e%3crect width='3840' height='2160' fill='white'%3e%3c/rect%3e%3c/mask%3e%3c/defs%3e%3c/svg%3e"
          : "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' width='3840' height='2160' preserveAspectRatio='none' viewBox='0 0 3840 2160'%3e%3cg mask='url(%26quot%3b%23SvgjsMask1099%26quot%3b)' fill='none'%3e%3crect width='3840' height='2160' x='0' y='0' fill='rgba(104%2c 148%2c 197%2c 1)'%3e%3c/rect%3e%3cpath d='M0%2c1340.797C345.725%2c1359.256%2c670.902%2c1668.946%2c995.939%2c1549.711C1323.171%2c1429.671%2c1559.58%2c1085.29%2c1628.133%2c743.543C1693.621%2c417.076%2c1404.411%2c134.268%2c1345.613%2c-193.47C1289.805%2c-504.547%2c1490.44%2c-873.654%2c1293.636%2c-1120.942C1097.569%2c-1367.303%2c705.415%2c-1284.891%2c404.155%2c-1376.426C99.157%2c-1469.096%2c-187.775%2c-1769.161%2c-488.096%2c-1662.302C-790.91%2c-1554.556%2c-818.652%2c-1133.212%2c-1008.426%2c-873.806C-1177.682%2c-642.445%2c-1449.71%2c-493.108%2c-1541.992%2c-221.705C-1643.579%2c77.065%2c-1654.211%2c409.557%2c-1545.526%2c705.818C-1432.632%2c1013.552%2c-1233.056%2c1322.322%2c-929.86%2c1446.89C-635.336%2c1567.895%2c-317.96%2c1323.821%2c0%2c1340.797' fill='%233c6a9d'%3e%3c/path%3e%3cpath d='M3840 3631.398C4123.724 3629.7780000000002 4411.474 3573.699 4644.5380000000005 3411.886 4873.439 3252.9629999999997 5004.36 2998.084 5118.396 2743.824 5231.772 2491.036 5296.7919999999995 2227.087 5300.171 1950.059 5304.03 1633.71 5304.642 1303.893 5139.25 1034.194 4960.669 742.9870000000001 4694.361 441.96399999999994 4354.459 407.91499999999996 4014.274 373.83799999999997 3782.595 752.6400000000001 3460.042 865.983 3162.46 970.5509999999999 2766.0969999999998 812.4570000000001 2549.821 1042.053 2334.487 1270.6480000000001 2479.295 1647.0990000000002 2431.815 1957.534 2383.7650000000003 2271.7 2148.951 2583.172 2269.1130000000003 2877.4 2389.359 3171.835 2742.809 3283.486 3029.534 3421.109 3286.3540000000003 3544.3779999999997 3555.134 3633.025 3840 3631.398' fill='%23a5bfdc'%3e%3c/path%3e%3c/g%3e%3cdefs%3e%3cmask id='SvgjsMask1099'%3e%3crect width='3840' height='2160' fill='white'%3e%3c/rect%3e%3c/mask%3e%3c/defs%3e%3c/svg%3e"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
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
          <div className="text-right">
            {usageCost !== null && (
              <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full px-3 py-1 shadow-md">
                Usage: <span className="font-bold">${usageCost.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Buttons Container */}
          <div className="flex items-center space-x-2">
            {/* Change Log and Known Issues Button */}
            <a
              href="/changelogandissues"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full p-2 shadow-md transition hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              ⚠️
            </a>

            {/* Donate Button */}
            <button
              onClick={() => setShowDonateModal(true)}
              className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full p-2 shadow-md transition hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              💗
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        className="flex-grow w-full max-w-screen-md overflow-y-auto px-5 sm:px-0 py-4 space-y-4"
        style={{ paddingTop: "96px", paddingBottom: "96px" }}
      >
        {messages.length > 0 ? (
          messages.map((message, i) => (
            <div
              key={i}
              className={clsx(
                "flex w-full items-center justify-start border-b border-gray-200 dark:border-gray-700 py-4 pl-4 animate-fadeInSlideUp",
                message.role === "user"
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <div className="flex w-full items-start space-x-4">
                <div
                  className={clsx(
                    "flex items-center justify-center w-10 h-10 rounded-full p-1.5 text-white",
                    message.role === "assistant"
                      ? "bg-green-500"
                      : "bg-blue-500"
                  )}
                >
                  {message.role === "user" ? (
                    <Image
                      src="https://www.svgrepo.com/show/186683/astronaut.svg"
                      alt="User Icon"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  ) : (
                    <Image
                      src="https://www.svgrepo.com/show/339963/chat-bot.svg"
                      alt="Chat Bot Icon"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  )}
                </div>
                <ReactMarkdown
                  className="prose w-full break-words prose-p:leading-relaxed dark:prose-invert"
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: (props) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md max-w-screen-md mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Welcome to <span className="text-green-500">Star Trader</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Your go-to assistant for planning trade routes and accessing
              accurate commodity prices for specific locations.
            </p>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  Help improve data:
                </span>{" "}
                <a
                  href="https://uexcorp.space/data/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline hover:text-blue-700 dark:hover:text-blue-400"
                >
                  https://uexcorp.space/data/signup
                </a>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  Donate to UEXCORP:
                </span>{" "}
                <a
                  href="https://ko-fi.com/uexcorp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline hover:text-blue-700 dark:hover:text-blue-400"
                >
                  Ko-fi
                </a>{" "}
                |{" "}
                <a
                  href="https://www.patreon.com/uexcorp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline hover:text-blue-700 dark:hover:text-blue-400"
                >
                  Patreon
                </a>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  Donate to DanielVNZ (Bot Creator):
                </span>{" "}
                <a
                  href="https://ko-fi.com/danielvnz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline hover:text-blue-700 dark:hover:text-blue-400"
                >
                  Ko-fi
                </a>
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
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
              style={{
                border: "none",
                width: "100%",
                padding: "4px",
                background: "#f9f9f9",
              }}
              height="712"
              title="danielvnz"
            ></iframe>
          </div>
        </div>
      )}

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
