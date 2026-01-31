import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PrismaClient } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

// Add this line
export const dynamic = 'force-dynamic';

export default async function Home() {
    const foodItems = await prisma.foodItem.findMany({
        orderBy: { createdAt: 'desc' },
    });

    // Serialize dates
    const serializedFoodItems = foodItems.map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
    }));

    return (
        <main className="flex min-h-screen flex-col">
            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/50 py-24 text-center md:py-32">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                                Taste the World, <span className="text-primary">Authentically</span>
                            </h1>
                            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                                Discover unique, homemade traditional foods from cultures around you. Connect directly with home chefs and preserve the taste of tradition.
                            </p>
                        </div>
                        <div className="space-x-4">
                            <Link href="/sign-up">
                                <Button size="lg" className="rounded-full">
                                    Start Exploring <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/sell">
                                <Button variant="outline" size="lg" className="rounded-full">
                                    Become a Seller
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <section className="container py-12 md:py-16">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Trending Dishes</h2>
                    <Button variant="ghost">View all</Button>
                </div>

                <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {serializedFoodItems.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            <p>No dishes listed yet. Be the first to share your culture!</p>
                        </div>
                    ) : (
                        serializedFoodItems.map((item) => (
                            <Card key={item.id} className="overflow-hidden">
                                <div className="aspect-video w-full overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.imageUrl || "/placeholder.jpg"}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition-transform hover:scale-105"
                                    />
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-1">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                                    <p className="mt-4 text-lg font-bold text-primary">Rs.{item.price.toFixed(2)}</p>
                                </CardContent>
                                <CardFooter>
                                    <Link href={`/food/${item.id}`} className="w-full">
                                        <Button className="w-full">View Details</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
}