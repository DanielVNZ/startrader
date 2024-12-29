"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "ai/react";
import va from "@vercel/analytics";
import clsx from "clsx";
import { VercelIcon, GithubIcon, LoadingCircle, SendIcon } from "./icons";
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
        toast.error("You have reached your request limit for the day.");
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
      {/* Header */}
      <div className="absolute top-5 hidden w-full justify-between px-5 sm:flex">
        <a
          href="/deploy"
          target="_blank"
          className="rounded-lg p-2 transition-colors duration-200 hover:bg-stone-100 dark:hover:bg-gray-800 sm:bottom-auto"
        >
          <VercelIcon />
        </a>
        <a
          href="/github"
          target="_blank"
          className="rounded-lg p-2 transition-colors duration-200 hover:bg-stone-100 dark:hover:bg-gray-800 sm:bottom-auto"
        >
          <GithubIcon />
        </a>
      </div>

      {/* Messages Container */}
      <div
        className="flex-grow w-full max-w-screen-md overflow-y-auto px-5 sm:px-0 py-4 space-y-4"
        style={{ paddingBottom: "96px" }} // Reserve space for the input section (80px height + 16px buffer)
      >
        {messages.length > 0 ? (
          messages.map((message, i) => (
            <div
              key={i}
              className={clsx(
                "flex w-full items-center justify-start border-b border-gray-200 dark:border-gray-700 py-4 pl-4",
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
              Welcome to <span className="text-green-500">Star Trader!</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Your go-to assistant for planning trade routes and accessing
              accurate commodity prices for specific locations.
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="fixed bottom-0 flex w-full flex-col items-center bg-gradient-to-b from-transparent via-gray-100 to-gray-100 dark:via-gray-800 dark:to-gray-900 p-5 sm:px-0">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative w-full max-w-screen-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 pb-2 pt-3 shadow-lg sm:pb-3 sm:pt-4"
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

        {/* Toggle Button */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute bottom-5 left-5 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full p-2 shadow-md transition hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </main>
  );
}
