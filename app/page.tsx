import type { Metadata } from "next";
import { HomepageClient } from "./Homepage.client";

export function generateMetadata(): Metadata {
  return {
    title: "Homepage"
  };
}

export default function Page() {
  return (
    <section className='h-full space-y-4 p-4'>
      <HomepageClient />
    </section>
  );
}
