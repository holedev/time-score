import { getTranslations, setRequestLocale } from "next-intl/server";
import type { locale } from "@/types/global";
import { LoginClient } from "./auth.client";

type PageType = { params: Promise<{ locale: locale }> };

export async function generateMetadata() {
  const t = await getTranslations("auth");
  return {
    title: t("title")
  };
}

export default async function Page({ params }: PageType) {
  const locale = (await params).locale;
  setRequestLocale(locale);

  return (
    <section className='flex h-full items-center justify-center'>
      <LoginClient />
    </section>
  );
}
