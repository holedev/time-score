import { Suspense } from "react";
import { LoadingComponent } from "@/components/custom/Loading";
import { TableDynamic } from "./dynamic";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <TableDynamic />
    </Suspense>
  );
}
