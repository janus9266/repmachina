import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useState } from "react";
import SettingModal from "./SettingModal";

interface HeaderProps {
  signout: () => void;
}

const Header = ({ signout }: HeaderProps) => {
  const handleStart = async () => {
    const res = await fetch('/api/supervision/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <header className="sticky top-0 z-999 flex w-full px-10 py-5">
      <div className="flex flex-grow items-center">
        <Link className="flex-shrink-0" href="/">
          <Image
            src="/logo.png"
            alt="Logo"
            className="dark:invert"
            width={160}
            height={13}
            priority
          />
        </Link>
      </div>
      <div className="flex items-center justify-normal gap-6">
        <button onClick={handleStart} className="border rounded-xl bg-white text-black px-10">
          START
        </button>
        <button onClick={() => setIsModalOpen(true)}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.25001 22L8.85001 18.8C8.63335 18.7167 8.42918 18.6167 8.23751 18.5C8.04585 18.3833 7.85835 18.2583 7.67501 18.125L4.70001 19.375L1.95001 14.625L4.52501 12.675C4.50835 12.5583 4.50001 12.4458 4.50001 12.3375V11.6625C4.50001 11.5542 4.50835 11.4417 4.52501 11.325L1.95001 9.375L4.70001 4.625L7.67501 5.875C7.85835 5.74167 8.05001 5.61667 8.25001 5.5C8.45001 5.38333 8.65001 5.28333 8.85001 5.2L9.25001 2H14.75L15.15 5.2C15.3667 5.28333 15.5708 5.38333 15.7625 5.5C15.9542 5.61667 16.1417 5.74167 16.325 5.875L19.3 4.625L22.05 9.375L19.475 11.325C19.4917 11.4417 19.5 11.5542 19.5 11.6625V12.3375C19.5 12.4458 19.4833 12.5583 19.45 12.675L22.025 14.625L19.275 19.375L16.325 18.125C16.1417 18.2583 15.95 18.3833 15.75 18.5C15.55 18.6167 15.35 18.7167 15.15 18.8L14.75 22H9.25001ZM12.05 15.5C13.0167 15.5 13.8417 15.1583 14.525 14.475C15.2083 13.7917 15.55 12.9667 15.55 12C15.55 11.0333 15.2083 10.2083 14.525 9.525C13.8417 8.84167 13.0167 8.5 12.05 8.5C11.0667 8.5 10.2375 8.84167 9.56251 9.525C8.88751 10.2083 8.55001 11.0333 8.55001 12C8.55001 12.9667 8.88751 13.7917 9.56251 14.475C10.2375 15.1583 11.0667 15.5 12.05 15.5Z"
              fill="#E2E2E2"
            />
          </svg>
        </button>
        <button className="text-white px-10" onClick={signout}>
          Logout
        </button>
      </div>
      <SettingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
};

export default Header;