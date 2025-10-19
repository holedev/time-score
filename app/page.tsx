import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingComponent } from "@/components/custom/Loading";
import { Separator } from "@/components/ui/separator";
import { UserList } from "./dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Homepage"
  };
}

export default function Page() {
  return (
    <section className='h-full space-y-4 p-4'>
      <div className='flex flex-wrap items-center justify-center gap-2'>MPC TimeScore</div>
      <Separator />
      <Suspense fallback={<LoadingComponent />}>
        <UserList />
      </Suspense>
    </section>
  );
}
