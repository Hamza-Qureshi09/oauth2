import { useTranslation } from "react-i18next";
import HurufLogo from "@/assets/huruf-logo.png";

function PoweredBy() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center">
      <p className="dark:text-white text-xs">{t("Powered by")}</p>
      <img src={HurufLogo} className="w-14" alt="Huruf tech" />
    </div>
  );
}

export default PoweredBy;
