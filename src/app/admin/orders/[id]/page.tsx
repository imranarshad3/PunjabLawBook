import { Suspense } from "react";
import AdminLoading from "../../loading";
import { AdminOrderDetail } from "./order-detail";

async function OrderContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminOrderDetail orderId={id} />;
}

export default function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<AdminLoading />}><OrderContent params={params} /></Suspense>;
}
