'use client'
import React, { ReactNode, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "../Footer";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";

interface Props {
  children: ReactNode;
  onStart: () => void;
}

const DefaultLayout = ({
  children,
  onStart
}: Props) => {
  // const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
  }

  const handleStart = () => {
    onStart()
  }

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden text-white">
        <div className="relative flex flex-1 flex-col">
          <Header signout={handleSignOut} start={handleStart} />
          <main>
            <div className="mx-auto max-w-screen px-10 py-5">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </AuthProvider>
  );
};

export default DefaultLayout;