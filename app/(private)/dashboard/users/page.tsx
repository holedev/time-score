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
import { TableDynamic } from "./dynamic";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Người dùng"
};

export default function Page() {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/dashboard'>Trang quản trị</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Người dùng</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Suspense fallback={<LoadingComponent />}>
        <TableDynamic />
      </Suspense>
    </>
  );
}
