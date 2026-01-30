
// Buyer places order

import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import OrderForm from "@/components/OrderForm";

const prisma = new PrismaClient();

export default async function OrderPage({
  searchParams,
}: {
  searchParams: { foodId?: string };
}) {
  const { userId } = auth();

  if (!userId) {
    notFound();
  }

  if (!searchParams.foodId) {
    notFound();
  }

  const food = await prisma.foodItem.findUnique({
    where: { id: searchParams.foodId },
  });

  if (!food) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Place Your Order</h1>

      <OrderForm food={food} userId={userId} />
    </div>
  );
}
