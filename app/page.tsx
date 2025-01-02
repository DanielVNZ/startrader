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
import * as THREE from "three";

declare global {
  interface Window {
    THREE: typeof THREE;
  }
}

export default function Chat() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const vantaRef = useRef<HTMLDivElement | null>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
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

  useEffect(() => {
    async function fetchUsage() {
      try {
        const today = new Date().toISOString().split("T")[0];
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
          setUsageCost(totalUsage / 100);
        } else {
          console.error("Failed to fetch usage:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching usage:", error);
      }
    }

    fetchUsage();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).THREE = THREE;
    }
    if (!vantaEffect && vantaRef.current) {
      import("vanta/dist/vanta.waves.min").then((module) => {
        setVantaEffect(
          module.default({
            el: vantaRef.current as HTMLElement,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: isDarkMode ? 0x2450 : 0x959af,
            THREE: THREE,
          })
        );
      });
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [isDarkMode, vantaEffect]);

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
      ref={vantaRef}
      style={{ height: "100vh", width: "100%" }}
      className="flex flex-col items-center justify-between min-h-screen text-black dark:text-white"
    >
      <div className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-50">
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

          <h1 className="text-green-500 text-lg font-bold">
            Star Trader - Powered By {" "}
            <a
              href="https://uexcorp.space"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-700"
            >
              UEXCorp.Space
            </a>
          </h1>

          <div className="text-right">
            {usageCost !== null && (
              <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full px-3 py-1 shadow-md">
                Usage: <span className="font-bold">${usageCost.toFixed(2)}</span>
              </div>
            )}
          </div>

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

      <div className="flex-grow w-full max-w-screen-md overflow-y-auto px-5 sm:px-0 py-4 space-y-4" style={{ paddingTop: "96px", paddingBottom: "96px" }}>
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
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </main>
  );
}

export {};
