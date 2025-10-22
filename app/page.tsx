import { Metadata } from "next";
import { _APP_NAME_ABBR } from "@/constants";
import { HomepageClient } from "./Homepage.client";

export const metadata: Metadata = {
  title: `Trang chủ | ${_APP_NAME_ABBR}`
};

export default function Page() {
  return (
    <section className='h-full space-y-4 p-4'>
      <HomepageClient />
    </section>
  );
}
