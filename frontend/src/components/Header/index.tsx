import Link from "next/link";
import Image from "next/image";
import SettingButton from "./SettingButton";

const Header = () => {
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
        <button className="border rounded-xl bg-white text-black px-10">
          START
        </button>
        <SettingButton />
        <button className="text-white">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;