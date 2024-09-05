import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Image from "next/image";

export default function Home() {
  return (
    <DefaultLayout>
      <div className="grid grid-cols-2 grid-flow-col gap-20">
        <div className="flex flex-col">
          <div className="text-center py-5">
            Transcription
          </div>
          <div className="border border-gray-500 rounded-xl h-content overflow-auto custom-scrollbar">
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
