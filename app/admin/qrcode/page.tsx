/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const QrCode = (): JSX.Element => {
  return (
    <div className="flex flex-row justify-center w-full h-screen">
      <div className="w-full max-w-[375px] h-[812px] flex items-center justify-center relative">
        <Card className="relative w-[315px] h-[416px] bg-white rounded-lg shadow-[0px_10px_20px_#30303026] z-10">
          <CardContent className="p-0">
            <div className="flex flex-col items-center pt-8 px-10">
              <div className="flex flex-col items-center">
                <p className="mt-2 font-sub-title-semibold-14 font-[number:var(--sub-title-semibold-14-font-weight)] text-[#2f2f2f] text-[length:var(--sub-title-semibold-14-font-size)] text-center tracking-[var(--sub-title-semibold-14-letter-spacing)] leading-[var(--sub-title-semibold-14-line-height)] [font-style:var(--sub-title-semibold-14-font-style)]">
                  2406 504 886
                </p>
              </div>

              <Separator className="w-[244px] my-6" />

              <p className="font-sub-title-semibold-14 font-[number:var(--sub-title-semibold-14-font-weight)] text-[#2f2f2f] text-[length:var(--sub-title-semibold-14-font-size)] text-center tracking-[var(--sub-title-semibold-14-letter-spacing)] leading-[var(--sub-title-semibold-14-line-height)] [font-style:var(--sub-title-semibold-14-font-style)]">
                QR code for Recipient
              </p>
              <img
                className="absolute inset-0 w-full h-full object-cover"
                alt="QR Code Background"
                src="/qrcode.png"
              />

              <p className="mt-3 font-['Poppins',Helvetica] font-normal text-[#2f2f2f] text-sm text-center tracking-[0] leading-[normal]">
                This Code will expire at 12:00 PM
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QrCode;
