// Seller view orders
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function SellerOrdersPage() {
  const { userId: clerkId } = auth();
  if (!clerkId) notFound();
  
  const seller = await prisma.user.findUnique({ where: { clerkId } });
  if (!seller) notFound();
  
  const orders = await prisma.order.findMany({
    where: { sellerId: seller.id },
    include: { food: true },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates to strings
  const serializedOrders = orders.map(order => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    food: {
      ...order.food,
      createdAt: order.food.createdAt.toISOString(),
      updatedAt: order.food.updatedAt.toISOString(),
    }
  }));

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Orders Received</h1>

      {serializedOrders.length === 0 && <p>No orders yet</p>}

      <div className="space-y-4">
        {serializedOrders.map((order) => (
          <div key={order.id} className="border p-4 rounded-lg">
            <p className="font-semibold">{order.food.title}</p>
            <p>Quantity: {order.quantity}</p>
            <p>Address: {order.address}</p>
            <p>Total: Rs. {order.amount.toFixed(2)}</p>
            <p className="text-yellow-600">{order.status}</p>
          </div>
        ))}
        
      </div>
    </div>
  );
}