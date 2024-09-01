'use client'
import React, { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "../Footer";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
}

const DefaultLayout = (props: Props) => {
  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden text-white">
        <div className="relative flex flex-1 flex-col">
          <Header />
          <main>
            <div className="mx-auto max-w-screen px-10 py-5">
              {props.children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SessionProvider>
  );
};

export default DefaultLayout;