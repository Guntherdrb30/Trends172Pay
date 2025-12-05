import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default function PayPage() {
  return (
    <div className="flex w-full items-center justify-center">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Resumen del pago</CardTitle>
              <CardDescription>
                Preparando tu sesión de pago...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        }
      >
        <CheckoutClient />
      </Suspense>
    </div>
  );
}

