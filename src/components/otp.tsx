interface IOTP {
  language?: "pt" | "en";
}

export default function OTP({ language }: IOTP) {
  return (
    <>
      AUTH
      <form className="max-w-sm mx-auto">
        <div className="flex mb-2 space-x-2 rtl:space-x-reverse">
          {Array.from({ length: 6 }).map((_, i) => (
            <BoxCode key={i} codeIndex={i + 1} setDarkMode />
          ))}
        </div>
        <p id="helper-text-explanation" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {language && (language == "en" ? "Please introduce the 6 digit code we sent via email." : "Por favor introduza o código de 6 dígitos que lhe enviamos por e-mail.")}
        </p>
      </form>
    </>
  );
}

function BoxCode({ codeIndex, setDarkMode }: { codeIndex: number; setDarkMode?: boolean }) {
  //   const [code, setCode] = useState<string>('');
  //   useEffect(() => {
  // setCode(String(codeIndex));
  //   }, [codeIndex]);

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
        className="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 data-[isDark=true]:bg-gray-700 data-[isDark=true]:border-gray-600 data-[isDark=true]:placeholder-gray-400 data-[isDark=true]:text-white data-[isDark=true]:focus:ring-primary-500 data-[isDark=true]:focus:border-primary-500"
        required
      />
    </div>
  );
}

// className="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
