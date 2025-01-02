"use client";

import React from "react";
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
import debounce from "lodash/debounce";
import './globals.css'; 

export default function Chat() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const { input, setInput, handleSubmit, isLoading } = useChat({
    onResponse: async (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day");
        va.track("Rate limited");
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let aggregatedMessage = ""; // Aggregate chunks for a single message

      if (reader) {
        while (!done) {
          const { value, done: isDone } = await reader.read();
          done = isDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            console.log("Streamed chunk:", chunk);
            aggregatedMessage += chunk; // Combine chunks
          }
        }

        // Append the complete message once streaming is done
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: aggregatedMessage.trim() },
        ]);
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

  const handleUserSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: input.trim() },
      ]);
      handleSubmit();
      setInput("");
    }
  };

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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const debounceScroll = debounce(scrollToBottom, 100);
    debounceScroll();
    return () => debounceScroll.cancel();
  }, [messages]);

  return (
    <main
      className="flex flex-col items-center justify-between min-h-screen text-black dark:text-white"
      style={{
        backgroundImage: `url(${isDarkMode ? '/darkmode.svg' : '/lightmode.svg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        overflow: "auto",
      }}
    >
      {/* Top Bar */}
      <div
        className="fixed top-0 left-0 w-full z-50 top-bar"
        style={{
          height: "96px",
          background: "linear-gradient(to bottom, hsla(236, 93.80%, 38.20%), rgba(0, 0, 0, 0))",
        }}
      >
        <div className="flex justify-between items-center px-4 py-3 max-w-screen-md mx-auto">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full p-2 shadow-md transition hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>

            <button
              onClick={() => window.location.reload()}
              className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full p-2 shadow-md transition hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              🔄
            </button>
          </div>

          <h1 className="text-black-500 dark:text-white-500 text-lg font-bold">
            Star Trader - Powered By{" "}
            <a
              href="https://uexcorp.space"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-700 text-blue-500"
            >
              UEXCorp.Space
            </a>
          </h1>

          <div className="flex items-center space-x-2">
            <a
              href="/changelogandissues"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full p-2 shadow-md transition hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              ⚠️
            </a>

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
        className="flex-grow w-full max-w-screen-md overflow-y-auto px-5 sm:px-0 space-y-4 chat-container"
        style={{
          paddingTop: "120px", // Adjust for top bar
          paddingBottom: "120px", // Adjust for bottom bar
        }}
      >
        {messages.length > 0 ? (
          messages.map((message, i) => (
            <div
              key={i}
              className={clsx(
                "flex w-full items-center justify-centre py-3 pl-4 animate-fadeInSlideUp rounded-md",
                message.role === "user"
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <div className="flex w-full items-start space-x-4">
                <div
                  className={clsx(
                    "flex items-center justify-center w-10 h-10 rounded-full p-1.5 text-white rounded-md",
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
              Welcome to <span className="text-blue-500">Star Trader</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Click the ⚠️ icon to view the recent change log and known issues.
            </p>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  Help improve the data:
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
                <p>
                  This service is not cheap to run. Please consider donating if you use this tool often.
                  <p>
                  Thank you!
                  </p>
                </p>
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
            <button
              onClick={() => setShowDonateModal(false)}
              className="absolute top-2 right-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              ✖ Close
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

    <div
      className="fixed bottom-0 left-0 w-full z-50 bottom-bar"
      style={{
        height: "96px",
        background: "linear-gradient(to bottom, rgba(0, 0, 0, 0), hsla(236, 93.80%, 38.20%, 0.81))"
      }}
    >
        <div className="relative flex items-center justify-center max-w-screen-md mx-auto">
          <form
            ref={formRef}
            onSubmit={handleUserSubmit}
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
