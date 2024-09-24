import { ReactNode } from "react";
import Header from "../Header";
import Footer from "../Footer";
import { useAuth } from "../../contexts/AuthContext";

interface Props {
  children: ReactNode;
  onStart: () => void;
  processing: boolean;
}

const DefaultLayout = ({ children, onStart, processing }: Props) => {
  const { logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
  };

  const handleStart = () => {
    onStart();
  };

  return (
    <div className="flex h-screen overflow-hidden text-white">
      <div className="relative flex flex-1 flex-col">
        <Header signout={handleSignOut} start={handleStart} processing={processing} />
        <main>
          <div className="mx-auto max-w-screen px-10 py-5">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default DefaultLayout;
