"use client";

import { AlertTriangleIcon, HomeIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { BaseLayout } from "@/components/custom/BaseLayout";
import { Button } from "@/components/ui/button";

type ErrorType = { error: Error & { digest?: string }; reset: () => void };

export default function ErrorGlobal({ error: _, reset }: ErrorType) {
  return (
    <BaseLayout>
      <div className='flex min-h-full items-center justify-center'>
        <div className='w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md'>
          <AlertTriangleIcon className='mx-auto mb-4 h-12 w-12 text-red-500' />
          <h1 className='mb-4 font-bold text-2xl text-gray-800'>Error</h1>
          <p className='mb-6 text-gray-600'>An unexpected error occurred.</p>
          <div className='mb-6 rounded-md bg-gray-100 p-4'>
            <p className='text-gray-600 text-sm'>Please try again later.</p>
          </div>
          <div className='flex flex-col space-y-3'>
            <Button className='w-full' onClick={() => reset()}>
              <RefreshCwIcon className='mr-2 h-4 w-4' />
              Try Again
            </Button>
            <Link href='/' passHref>
              <Button className='w-full' variant='outline'>
                <HomeIcon className='mr-2 h-4 w-4' />
                Go back to home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
