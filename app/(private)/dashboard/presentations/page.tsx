import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoadingComponent } from "@/components/custom/Loading";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { PresentationTableDynamic } from "./dynamic";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thuyết trình"
};

export default function PresentationPage() {
  return (
    <div className='space-y-6'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/dashboard'>Trang quản trị</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Thuyết trình</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className='font-bold text-3xl'>Quản lý thuyết trình</h1>
        <p className='mt-2 text-muted-foreground'>Quản lý thời gian trình bày và theo dõi các đội thi đấu</p>
      </div>

      <Suspense fallback={<LoadingComponent />}>
        <PresentationTableDynamic />
      </Suspense>
    </div>
  );
}
