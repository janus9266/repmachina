"use client"
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [starting, setStarting] = useState<boolean>(false);

  useEffect(() => {
    if (starting === false) return;

    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events`);

    eventSource.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, newMessage.time]);
    };

    return () => {
      eventSource.close();
    }

  }, [starting]);

  const handleStart = () => {
    setStarting(true)
  }

  return (
    <DefaultLayout onStart={handleStart}>
      <div className="grid grid-cols-2 grid-flow-col gap-20">
        <div className="flex flex-col">
          <div className="text-center py-5">
            Transcription
          </div>
          <div className="border border-gray-500 rounded-xl h-content overflow-auto custom-scrollbar">
            <ul>
              {messages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-center py-5">
            Responses
          </div>
          <div className="border border-gray-500 rounded-xl h-content overflow-auto custom-scrollbar">

          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};
