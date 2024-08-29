import React from "react";
import Header from "@/components/Header";
import Footer from "../Footer";

const DefaultLayout = (props: {
  children: React.ReactNode
}) => {
  return (
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
  );
};

export default DefaultLayout;