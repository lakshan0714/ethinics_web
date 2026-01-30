"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createOrder({
  foodId,
  quantity,
  address,
}: {
  foodId: string;
  quantity: number;
  address: string;
}) {
  const { userId: clerkId } = auth();
  if (!clerkId) throw new Error("Unauthorized");

  // 1) Get or create buyer in DB
  let buyer = await prisma.user.findUnique({ where: { clerkId } });

  if (!buyer) {
    const cu = await currentUser();
    if (!cu) throw new Error("No Clerk user");

    const email =
      cu.emailAddresses.find(e => e.id === cu.primaryEmailAddressId)?.emailAddress ||
      cu.emailAddresses[0]?.emailAddress;

    if (!email) throw new Error("No email found in Clerk");

    const name =
      [cu.firstName, cu.lastName].filter(Boolean).join(" ") ||
      cu.username ||
      "Buyer";

    buyer = await prisma.user.create({
      data: { clerkId, email, name, role: "BUYER" },
    });
  }

  // 2) Food must exist
  const food = await prisma.foodItem.findUnique({
    where: { id: foodId },
    include: { chef: true },
  });
  if (!food) throw new Error("Food not found");

  // 3) Prevent ordering own food
  if (food.chef.clerkId === clerkId) {
    throw new Error("You cannot order your own food");
  }

  const amount = food.price * quantity;

  // 4) Create order using DB ids (UUIDs)
  await prisma.order.create({
    data: {
      foodId: food.id,        
      buyerId: buyer.id,      
      sellerId: food.chefId, 
      quantity,
      address,
      payment: "CASH",
      amount,
      status: "PENDING",
    },
  });

  return { success: true };
}
