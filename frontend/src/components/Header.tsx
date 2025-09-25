import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { FaGlobe } from "react-icons/fa";
import { useTranslation } from "react-i18next";

type HeaderProps = {};

const Header = ({}: HeaderProps) => {
  const { user } = useAuth(); // pulls from context
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const handleLanguageClick = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 rounded-pill px-4 sm:px-8 py-3 bg-gradient-to-r from-[#f8fafc] to-[#f3e8ff] border-b shadow-md rounded-b-xl">
      <h1 className="text-xl sm:text-2xl font-bold text-[#39092c] tracking-tight flex items-center gap-2">
        {t("hello")} {user?.name || t("user")}
        <span className="inline-block">👋🏽</span>
      </h1>

      <div className="flex items-center gap-2">
        <FaGlobe className="w-5 h-5 text-[#39092c]" />
        <div className="flex gap-2">
          <button
            type="button"
            className={`px-4 py-2 rounded-lg font-semibold border transition shadow-sm focus:outline-none focus:ring-2 focus:ring-[#39092c] ${language === "en" ? "bg-[#39092c] text-white border-[#39092c]" : "bg-white text-[#39092c] border-gray-200"}`}
            onClick={() => handleLanguageClick("en")}
          >
            En
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg font-semibold border transition shadow-sm focus:outline-none focus:ring-2 focus:ring-[#39092c] ${language === "fi" ? "bg-[#39092c] text-white border-[#39092c]" : "bg-white text-[#39092c] border-gray-200"}`}
            onClick={() => handleLanguageClick("fi")}
          >
            Fi
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
