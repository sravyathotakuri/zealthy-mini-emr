
import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {

  title: "Zealthy Mini-EMR",

  description: "Mini EMR and patient portal"

};
export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (

    <html lang="en">

      <body>{children}</body>

    </html>

  );

}
