"use client";

import { useRef, useState, useEffect } from "react";
import { useChat } from "ai/react";
import va from "@vercel/analytics";
import clsx from "clsx";
import { VercelIcon, GithubIcon, LoadingCircle, SendIcon } from "./icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Textarea from "react-textarea-autosize";
import { toast } from "sonner";

export default function Chat() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        va.track("Rate limited");
        return;
      } else {
        va.track("Chat initiated");
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

  // Dark mode state
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

  // Apply the dark mode class
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
    <main className="flex flex-col items-center justify-between pb-40 bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
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

      {/* Messages */}
      {messages.length > 0 ? (
        messages.map((message, i) => (
          <div
            key={i}
            className={clsx(
              "flex w-full items-center justify-center border-b border-gray-200 dark:border-gray-700 py-8",
              message.role === "user"
                ? "bg-white dark:bg-gray-800"
                : "bg-gray-100 dark:bg-gray-700"
            )}
          >
            <div className="flex w-full max-w-screen-md items-start space-x-4 px-5 sm:px-0">
              <div
                className={clsx(
                  "p-1.5 text-white",
                  message.role === "assistant" ? "bg-green-500" : "bg-blue-500"
                )}
              >
                {message.role === "user" ? (
                  <img
                    src="https://www.svgrepo.com/show/186683/astronaut.svg"
                    alt="User Icon"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                ) : (
                  <img
                    src="https://www.svgrepo.com/show/339963/chat-bot.svg"
                    alt="Chat Bot"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                )}
              </div>
              <ReactMarkdown
                className="prose mt-1 w-full break-words prose-p:leading-relaxed dark:prose-invert"
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
        <div className="border-gray-200 dark:border-gray-700 sm:mx-0 mx-5 mt-20 max-w-screen-md rounded-md border sm:w-full bg-white dark:bg-gray-900">
          <div className="flex flex-col space-y-4 p-7 sm:p-10">
            <h1 className="text-lg font-semibold text-black dark:text-white">
              Welcome to Star Trader!
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Your home of all trading needs!
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Want to become a Data Runner? Join here:{" "}
              <a
                href="https://uexcorp.space/data/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4 transition-colors hover:text-black dark:hover:text-white"
              >
                https://uexcorp.space/data/signup
              </a>
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              If you would like to support me to keep this bot alive:{" "}
              <a
                href="https://ko-fi.com/danielvnz"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4 transition-colors hover:text-black dark:hover:text-white"
              >
                https://ko-fi.com/danielvnz
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="fixed bottom-0 flex w-full flex-col items-center space-y-3 bg-gradient-to-b from-transparent via-gray-100 to-gray-100 dark:via-gray-800 dark:to-gray-900 p-5 pb-3 sm:px-0">
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
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute left-5 bottom-5 rounded-full bg-gray-200 dark:bg-gray-700 p-2 transition hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          Built with{" "}
          <a
            href="https://platform.openai.com/docs/guides/gpt/function-calling"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black dark:hover:text-white"
          >
            OpenAI Functions
          </a>{" "}
          and{" "}
          <a
            href="https://sdk.vercel.ai/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black dark:hover:text-white"
          >
            Vercel AI SDK
          </a>
          .
        </p>
      </div>
    </main>
  );
}
