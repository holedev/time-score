import "@/app/globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BaseLayout } from "@/components/custom/BaseLayout";
import { PageLayout } from "@/components/custom/PageLayout";
import { _APP_NAME_ABBR, _APP_NAME_FULL } from "@/constants";

export const metadata: Metadata = {
  title: {
    template: `%s | ${_APP_NAME_ABBR}`,
    default: _APP_NAME_ABBR
  },
  description: _APP_NAME_FULL
};

type Props = {
  children: ReactNode;
};

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({ children }: Props) {
  return (
    <BaseLayout>
      <PageLayout>{children}</PageLayout>
    </BaseLayout>
  );
}
