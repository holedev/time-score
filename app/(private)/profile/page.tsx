import { Suspense } from "react";
import { LoadingComponent } from "@/components/custom/Loading";
import { UserWithRole } from "@/types/global";
import { getProfile } from "./actions";
import { Profile } from "./dynamic";
import { FormClient } from "./form.client";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { data, error } = await getProfile();

  if (error) {
    throw new Error(error.message);
  }
  const dataUser = data?.payload as { user: UserWithRole };

  return (
    <section className='flex w-[400px] flex-col space-y-2'>
      <Suspense fallback={<LoadingComponent />}>
        <FormClient nickname={dataUser.user?.user_metadata?.display_name || ""} />
      </Suspense>
      <Suspense fallback={<LoadingComponent />}>
        <Profile user={dataUser.user} />
      </Suspense>
    </section>
  );
}
