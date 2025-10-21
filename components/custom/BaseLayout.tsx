import "@/app/globals.css";
import { Roboto } from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "../theme-provider";
import { Toaster } from "../ui/toaster";
import { TooltipProvider } from "../ui/tooltip";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["italic", "normal"]
});

type BaseLayoutType = { children: ReactNode };

export function BaseLayout({ children }: BaseLayoutType) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={cn(roboto.className, "flex h-screen w-full flex-col")}>
        <ThemeProvider attribute='class' defaultTheme='system' disableTransitionOnChange enableSystem>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
