'use client'
import React, { ReactNode, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "../Footer";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";

interface Props {
  children: ReactNode;
}

const DefaultLayout = (props: Props) => {
  // const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
  }

  // useEffect(() => {
  //   if (status === "loading") return; // Don't redirect until session status is loaded

  //   if (!session) {
  //     router.push('/auth/signin'); // Redirect to sign-in page
  //   }
  // }, [session, status, router]);

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden text-white">
        <div className="relative flex flex-1 flex-col">
          <Header signout={handleSignOut} />
          <main>
            <div className="mx-auto max-w-screen px-10 py-5">
              {props.children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </AuthProvider>
  );
};

export default DefaultLayout;