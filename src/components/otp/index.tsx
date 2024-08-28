"use client";
import { useEffect, useState } from "react";

interface IOTP {
  language?: "pt" | "en";
  setDarkMode?: boolean;
  otpLength?: number;
}

export default function OTP({ language, otpLength, setDarkMode }: IOTP) {
  const boxLength = otpLength || 6;

  const [otpCode, setOtpCode] = useState<string[]>(Array(boxLength).fill(""));

  const handleChange = (value: string, index: number) => {
    if(isNaN(Number(value))) return;
    // if (!/^\d*$/.test(value)) return; // Permitir apenas números

    if (value.length > 1) return;

    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);

    if (value && index < boxLength - 1) {
      const nextInput = document.getElementById(`code-${index + 2}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleBackspace = (index: number) => {
    if (index > 0 && otpCode[index] === "") {
      const prevInput = document.getElementById(`code-${index}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  useEffect(() => {
     //TODO: Remove this console.log
    console.log("2FA Code:", otpCode.join(""));
  }, [otpCode]);

  return (
    <form className="max-w-sm mx-auto">
      <div className="flex mb-2 space-x-2 rtl:space-x-reverse">
        {otpCode.map((_, i) => (
          <BoxCode key={i} codeIndex={i + 1} setDarkMode={setDarkMode} handleChange={handleChange} handleBackspace={handleBackspace} value={otpCode[i]} />
        ))}
      </div>
      <p id="helper-text-explanation" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {language && (language == "en" ? "Please introduce the 6 digit code we sent via email." : "Por favor introduza o código de 6 dígitos que lhe enviamos por e-mail.")}
      </p>
    </form>
  );
}

interface IBoxCode {
  codeIndex: number;
  setDarkMode?: boolean;
  handleChange: (value: string, index: number) => void;
  handleBackspace: (index: number) => void;
  value: string;
}
function BoxCode({ codeIndex, setDarkMode, handleChange, handleBackspace, value }: IBoxCode) {
  return (
    <div>
      <label htmlFor={`code-${codeIndex}`} className="sr-only">
        {codeIndex}º code
      </label>
      <input
        type="text"
        maxLength={1}
        data-isDark={setDarkMode}
        data-focus-input-init
        data-focus-input-prev={codeIndex > 0 && `code-${codeIndex - 1}`}
        data-focus-input-next={`code-${codeIndex + 1}`}
        id={`code-${codeIndex}`}
        value={value}
        onChange={(e) => handleChange(e.target.value, codeIndex - 1)}
        onKeyDown={(e) => e.key === "Backspace" && handleBackspace(codeIndex - 1)}
        className="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 data-[isDark=true]:bg-gray-700 data-[isDark=true]:border-gray-600 data-[isDark=true]:placeholder-gray-400 data-[isDark=true]:text-white data-[isDark=true]:focus:ring-primary-500 data-[isDark=true]:focus:border-primary-500"
        required
      />
    </div>
  );
}

// className="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
