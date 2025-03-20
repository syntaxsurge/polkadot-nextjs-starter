import { Montserrat, Geist_Mono } from "next/font/google";

export const fontSans = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});
