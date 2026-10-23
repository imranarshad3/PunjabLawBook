import { Suspense } from "react";
import Link from "next/link";
import { AccountOrderDetail } from "@/components/account-order-detail";
import "../../account.css";

async function OrderContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AccountOrderDetail orderId={id} />;
}

export default function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<main id="main" className="inner-page account-page"><div className="container account-empty-note">Loading your order… <Link href="/account">Back to account</Link></div></main>}><OrderContent params={params} /></Suspense>;
}
