"use client";

import React, { ReactNode } from "react";
import NotificationProvider from "./NotificationProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>;
}
