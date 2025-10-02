import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Suspense } from "react";
import { LoadingComponent } from "@/components/custom/Loading";
import { getProfile } from "./actions";
import { Profile } from "./dynamic";
import { FormClient } from "./form.client";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { data, error } = await getProfile();

  if (error) {
    throw new Error(error.message);
  }
  const user = data?.payload as SupabaseUser;

  return (
    <section className='flex w-[400px] flex-col space-y-2'>
      <Suspense fallback={<LoadingComponent />}>
        <FormClient nickname={user?.email || ""} />
      </Suspense>
      <Suspense fallback={<LoadingComponent />}>
        <Profile user={user} />
      </Suspense>
    </section>
  );
}
