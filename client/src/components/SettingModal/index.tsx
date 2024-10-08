import { useEffect, useState } from "react";
import { Setting } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

interface SettingModalProps {
  setting: Setting | null,
  isOpen: boolean,
  onClose: () => void;
  onSave: (setting: Setting) => void;
}

const SettingModal = ({
  setting,
  isOpen,
  onClose,
  onSave,
}: SettingModalProps) => {
  const { user } = useAuth()

  const [ clientId, setClientId ] = useState<string>("");
  const [ clientSecret, setClientSecret ] = useState<string>("");
  const [ jwtToken, setJwtToken ] = useState<string>(""); 
  const [ clientName, setClientName ] = useState<string>("");
  const [ clientPassword, setClientPassword ] = useState<string>("");
  const [ deviceId, setDeviceId ] = useState<string>("");

  useEffect(() => {
    if (setting === null) {
      setClientId("");
      setClientSecret("");
      setJwtToken("");
      setClientName("");
      setClientPassword("");
      setDeviceId("");
    } else {
      setClientId(setting.client_id);
      setClientSecret(setting.client_secret);
      setJwtToken(setting.jwt_token);
      setClientName(setting.user_name);
      setClientPassword(setting.password);
      setDeviceId(setting.device_id);
    }

  }, [setting])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose])

  const handleSave = () => {
    if (user === null) return;
    
    onSave({
      _id: setting?._id,
      user_id: user.id,
      client_id: clientId,
      client_secret: clientSecret,
      jwt_token: jwtToken,
      user_name: clientName,
      password: clientPassword,
      device_id: deviceId
    });

    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50 transition-opacity duration-300 ease-in-out">
      <div className="relative bg-gray-900 p-6 rounded-lg shadow-lg w-[540px]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-300 hover:text-white"
        >
          X
        </button>
        <h2 className="text-2xl font-bold mb-4">Setting</h2>
        <div className="mb-4 border-t border-b px-5 py-4">
          <div className="flex flex-row mb-3">
            <label className="w-[30%] block text-body-sm font-medium text-gray-500">
              Client ID:
            </label>
            <input
              type="text"
              name="clientId"
              placeholder="Input your Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-[7px] border-[1.5px] border-gray-500 bg-transparent px-5 py-1 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
            />
          </div>
          <div className="flex flex-row mb-3">
            <label className="w-[30%] block text-body-sm font-medium text-gray-500">
              Client Secret:
            </label>
            <input
              type="password"
              placeholder="Input your Client Secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full rounded-[7px] border-[1.5px] border-gray-500 bg-transparent px-5 py-1 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
            />
          </div>
          <div className="flex flex-row mb-3">
            <label className="w-[30%] block text-body-sm font-medium text-gray-500">
              JWT Token:
            </label>
            <textarea
              rows={6}
              placeholder="Input JWT Token"
              value={jwtToken}
              onChange={(e) => setJwtToken(e.target.value)}
              className="w-full rounded-[7px] border-[1.5px] border-gray-500 bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            ></textarea>
          </div>
          <div className="flex flex-row mb-3">
            <label className="w-[30%] block text-body-sm font-medium text-gray-500">
              User Name:
            </label>
            <input
              type="text"
              placeholder="Input your Client Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-[7px] border-[1.5px] border-gray-500 bg-transparent px-5 py-1 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
            />
          </div>
          <div className="flex flex-row mb-3">
            <label className="w-[30%] block text-body-sm font-medium text-gray-500">
              Password:
            </label>
            <input
              type="password"
              placeholder="Input your Password"
              value={clientPassword}
              onChange={(e) => setClientPassword(e.target.value)}
              className="w-full rounded-[7px] border-[1.5px] border-gray-500 bg-transparent px-5 py-1 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
            />
          </div>
          <div className="flex flex-row mb-3">
            <label className="w-[30%] block text-body-sm font-medium text-gray-500">
              Device Number:
            </label>
            <input
              type="text"
              placeholder="Input your Extension Number"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full rounded-[7px] border-[1.5px] border-gray-500 bg-transparent px-5 py-1 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
            />
          </div>
        </div>
        <div className="flex justify-end align-center">
          <button className="border rounded-xl bg-white text-black px-10" onClick={handleSave}>
            SAVE
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingModal;