import QRCodeStyling from "qr-code-styling";
import React from "react";

// import Logo from "@/assets/images/logo.png";

interface QRcodeProps {
  value: string;
}

const qrCode = new QRCodeStyling({
  width: 250,
  height: 250,
  //   image: Logo,
  dotsOptions: {
    type: "dots",
  },
  cornersDotOptions: {
    type: "dot",
  },
  cornersSquareOptions: {
    type: "dot",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 20,
    imageSize: 0.9,
    hideBackgroundDots: true,
  },
  backgroundOptions: {
    color: "transparent",
  },
});

export const QRcode: React.FC<QRcodeProps> = ({ value }) => {
  const QRcodeRef = React.useRef(null);

  React.useEffect(() => {
    if (QRcodeRef.current) qrCode.append(QRcodeRef.current);
  }, [QRcodeRef]);

  React.useEffect(() => {
    qrCode.update({
      data: value,
      dotsOptions: {
        color:
          document.getElementsByClassName("light").length > 0 ? "#000" : "#fff",
      },
    });
  }, [value]);

  return <div ref={QRcodeRef} />;
};
