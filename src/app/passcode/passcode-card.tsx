"use client";

import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export function PasscodeCard() {
  const code = useMemo(makeCode, []);
  const qrUrl = typeof window === "undefined" ? "" : `${window.location.origin}/login?device_code=${code}`;

  return (
    <div className="mt-8 grid gap-5 rounded-[1.5rem] border border-white/10 bg-black/30 p-5 sm:grid-cols-[180px_1fr]">
      <div className="rounded-2xl bg-white p-4">
        <QRCodeSVG value={qrUrl || code} size={148} />
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-sm font-bold text-slate-400">Your temporary code</p>
        <p className="mt-2 font-mono text-4xl font-black tracking-widest">{code}</p>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          Planned flow: create a login_passcodes row, let the user scan/sign in on phone, approve the code, then issue a session to this device using a secure server exchange.
        </p>
      </div>
    </div>
  );
}
