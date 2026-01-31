import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getFoodItem(id: string) {
    const item = await prisma.foodItem.findUnique({
        where: { id },
        include: { chef: true }
    });
    return item;
}

export default async function FoodDetailsPage({ params }: { params: { id: string } }) {
    const item = await getFoodItem(params.id);
    const { userId } = auth();

    if (!item) {
        notFound();
    }

    // Serialize the item to convert dates to strings
    const serializedItem = {
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        chef: {
            ...item.chef,
            createdAt: item.chef.createdAt.toISOString(),
            updatedAt: item.chef.updatedAt.toISOString(),
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4" /> Back to Menu
            </Link>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Image Section */}
                <div className="overflow-hidden rounded-lg border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={serializedItem.imageUrl || "/placeholder.jpg"}
                        alt={serializedItem.title}
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold">{serializedItem.title}</h1>
                        <p className="mt-2 text-xl font-semibold text-primary">Rs.{serializedItem.price.toFixed(2)}</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">Description / Story</h3>
                        <p className="whitespace-pre-wrap text-muted-foreground">{serializedItem.description}</p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <div className="mb-2 text-sm font-medium text-muted-foreground">Prepared by</div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10"></div>
                            <div>
                                <p className="font-medium">{serializedItem.chef.name || "Home Chef"}</p>
                                <p className="text-xs text-muted-foreground">Certified Seller</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        {serializedItem.chef.clerkId === userId ? (
                            <Button variant="secondary" className="w-full" disabled>
                                You are the seller
                            </Button>
                        ) : (
                            <Link href={`/order_page?foodId=${serializedItem.id}`}>
                                <Button size="lg" className="w-full">
                                    <ShoppingCart className="mr-2 h-5 w-5" /> Order Now
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}