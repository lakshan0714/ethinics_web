"use server";

import { currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function placeOrder(formData: FormData) {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const foodId = formData.get("foodId") as string;
    const price = parseFloat(formData.get("price") as string);

    if (!foodId || !price) {
        throw new Error("Invalid order data");
    }

    // Fetch the food item to get the sellerId (chefId)
    const food = await prisma.foodItem.findUnique({
        where: { id: foodId },
        select: { chefId: true }
    });

    if (!food) {
        throw new Error("Food item not found");
    }

    // Ensure Buyer exists with unique email
    const buyer = await prisma.user.upsert({
        where: { clerkId: user.id },
        update: {},
        create: {
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress || `${user.id}@placeholder.com`,
            name: user.firstName || user.fullName || "Buyer",
        }
    });

    await prisma.order.create({
        data: {
            foodId,
            buyerId: buyer.id,
            sellerId: food.chefId,
            quantity: 1,
            address: "Default Address",
            payment: "CASH",
            amount: price,
            status: "COMPLETED",
        }
    });

    revalidatePath("/dashboard");
    redirect("/dashboard");
}