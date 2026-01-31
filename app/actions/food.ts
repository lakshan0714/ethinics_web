"use server";

import { currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { mkdir, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { join } from "path";

const prisma = new PrismaClient();

export async function createFoodItem(formData: FormData) {
    const user = await currentUser();

    if (!user) {
        throw new Error("You must be signed in to list a food item.");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);

    // Handle File Upload
    const file = formData.get("image") as File;
    if (!file || file.size === 0) {
        throw new Error("No image uploaded");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    // Save to public/uploads
    const uploadDir = join(process.cwd(), "public", "uploads");
    const path = join(uploadDir, filename);

    try {
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path, buffer);
    } catch (error) {
        console.error("Upload error:", error);
    }

    const imageUrl = `/uploads/${filename}`;

    // Ensure User exists with unique email
    await prisma.user.upsert({
        where: { clerkId: user.id },
        update: {},
        create: {
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress || `${user.id}@placeholder.com`,
            name: user.firstName || user.fullName || "Seller",
            role: "BUYER", // or "SELLER" if appropriate
        }
    });

    await prisma.foodItem.create({
        data: {
            title,
            description,
            price,
            imageUrl,
            chef: {
                connect: { clerkId: user.id }
            }
        },
    });

    revalidatePath("/");
    redirect("/");
}