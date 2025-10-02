import { AuthClient } from "./auth.client";

export default function Page() {
  return (
    <section className='flex h-full items-center justify-center'>
      <AuthClient />
    </section>
  );
}
