import React, { useEffect, useState, useRef } from "react";
import DefaultLayout from "../../components/Layouts/DefaultLayout";
import { KeyWord, Transcript } from "../../types";

function HomePage() {
  const [messages, setMessages] = useState<Transcript[] | []>([]);
  const [starting, setStarting] = useState<boolean>(false);
  const [phoneStatus, setPhoneStatus] = useState<string>("Not Ready");
  const [keyMessages, setKeyMessages] = useState<KeyWord[] | []>([]);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (starting === false) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();        
      }      
    } else {
      const eventSource = new EventSource(
        `${process.env.REACT_APP_BACKEND_URL}/events`
      );

      eventSourceRef.current = eventSource;
  
      eventSource.addEventListener("transcriptUpdate", (e) =>
        updateTranscript(JSON.parse(e.data))
      );
      eventSource.addEventListener("phoneEvent", (e) => 
        updatePhoneState(e.data)
      );
      eventSource.addEventListener('keyEvent', (e) => 
        updateKeyMessageState(JSON.parse(e.data))
      )
  
      return () => {
        eventSource.close();
      };
    }
  }, [starting]);

  const updateTranscript = (data: Transcript) => {
    setMessages((prevMessages: any) => [...prevMessages, data]);
  };

  const updatePhoneState = (phoneStatus: string) => {
    setPhoneStatus(phoneStatus);
  };

  const updateKeyMessageState = (data: string) => {
    setKeyMessages((prev: any) => [...prev, data]);
  }

  const handleStart = () => {
    setStarting((prev: boolean) => !prev);
  };

  return (
    <DefaultLayout onStart={handleStart} processing={starting}>
      <div className="grid grid-cols-2 grid-flow-col gap-20">
        <div className="flex flex-col">
          <div className="text-center py-5">Transcription ({phoneStatus})</div>
          <div className="border border-gray-500 rounded-xl h-content overflow-auto custom-scrollbar p-5">            
            {messages.map((msg: Transcript, key: any) => (msg.id === 0 ?
              <div className="w-full max-w-[540px] mb-4" key={key}>
                <p className="mb-2 text-body-sm font-medium">{msg.name}</p>
                <div className="rounded-2xl rounded-tl-none rounded-br-none bg-[#FFFFFF] px-5 py-3 bg-opacity-30">
                  <p className="font-medium">{msg.text}</p>
                </div>
              </div> :
              <div className="ml-auto max-w-[360px] mb-4" key={key}>
                <p className="mb-2 text-body-sm font-medium">{msg.name}</p>
                <div className="rounded-2xl rounded-tl-none rounded-br-none px-5 py-3 bg-[#FFFFFF] bg-opacity-10">
                  <p className="font-medium">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-center py-5">Responses</div>
          <div className="border border-gray-500 rounded-xl h-content overflow-auto custom-scrollbar p-5">
            {keyMessages.map((msg: KeyWord, key: any) => (
              <div className="max-w-[740px]" key={key}>
                <p className="mb-2 text-body-sm font-medium">{msg.keyword}</p>
                <div className="rounded-2xl rounded-br-none px-5 py-3 bg-[#FFFFFF] bg-opacity-10 ">
                  <p className="font-medium">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

export default HomePage;
