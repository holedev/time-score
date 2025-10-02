import { AlertTriangleIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BaseLayout } from "@/components/custom/BaseLayout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <BaseLayout>
      <div className='flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-gray-50 to-gray-100 px-4 text-center dark:from-gray-900 dark:to-gray-800'>
        <AlertTriangleIcon className='mx-auto mb-4 h-12 w-12 text-red-500' />
        <p className='mb-6 font-semibold text-2xl text-gray-600 md:text-3xl dark:text-gray-300'>{"Page Not Found"}</p>
        <p className='mb-8 max-w-md text-gray-500 text-lg md:text-xl dark:text-gray-400'>
          {"Sorry, we couldn't find the page you're looking for."}
        </p>
        <Link href='/' passHref prefetch={true}>
          <Button className='flex items-center gap-2' size='lg' variant='outline'>
            <ArrowLeft className='h-4 w-4' />
            {"Go back to home"}
          </Button>
        </Link>
      </div>
    </BaseLayout>
  );
}
