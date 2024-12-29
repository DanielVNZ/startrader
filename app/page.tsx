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
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full p-2 shadow-md transition hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>

          {/* Page Title */}
          <h1 className="text-green-500 text-lg font-bold">Star Trader</h1>

          {/* Donate Button */}
          <a
            href="https://ko-fi.com/danielvnz"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full p-2 shadow-md transition hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            💗 Donate Here 💗
          </a>
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
              placeholder="Send a message"
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
