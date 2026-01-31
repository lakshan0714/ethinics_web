import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function DashboardPage() {
    const { userId: clerkId } = auth();

    if (!clerkId) {
        return <div className="p-10">Please sign in to view dashboard</div>;
    }

    // Get the user's DB record first
    const user = await prisma.user.findUnique({
        where: { clerkId }
    });

    if (!user) {
        return <div className="p-10">User not found. Please sign in again.</div>;
    }

    // 1. Fetch foods I'm selling
    const myFoods = await prisma.foodItem.findMany({
        where: { chefId: user.id }, // ✅ Use DB user id
        orderBy: { createdAt: 'desc' }
    });

    // 2. Fetch orders placed (I am the buyer)
    const myOrders = await prisma.order.findMany({
        where: { buyerId: user.id }, // ✅ Use DB user id instead of clerkId
        include: { food: true },
        orderBy: { createdAt: 'desc' }
    });

    // 3. Fetch incoming orders (People buying my food)
    const incomingOrders = await prisma.order.findMany({
        where: { sellerId: user.id }, // ✅ Use DB user id
        include: { food: true, buyer: true },
        orderBy: { createdAt: 'desc' }
    });

    // Calculate Seller Stats
    const totalListings = myFoods.length;
    const totalSalesCount = incomingOrders.length;
    const totalRevenue = incomingOrders.reduce((acc, order) => acc + order.amount, 0);

    return (
        <div className="container py-10">
            <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

            <Tabs defaultValue="kitchen" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="kitchen">My Kitchen (Selling)</TabsTrigger>
                    <TabsTrigger value="orders">My Orders (Buying)</TabsTrigger>
                </TabsList>

                {/* --- SELLER VIEW --- */}
                <TabsContent value="kitchen" className="space-y-8">
                    {/* Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Rs.{totalRevenue.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalListings}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Orders Received</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalSalesCount}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Incoming Orders Table */}
                    <div>
                        <h2 className="mb-4 text-xl font-semibold">Incoming Orders</h2>
                        {incomingOrders.length === 0 ? (
                            <p className="text-muted-foreground">No orders received yet.</p>
                        ) : (
                            <div className="grid gap-4">
                                {incomingOrders.map(order => (
                                    <Card key={order.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold">{order.food.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Ordered by: {order.buyer.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Quantity: {order.quantity}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Address: {order.address}
                                                </p>
                                                <p className="text-xs font-medium text-yellow-600">
                                                    Status: {order.status}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">+Rs.{order.amount.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Listings */}
                    <div>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">My Listings</h2>
                            <Link href="/sell">
                                <Button>Add New Dish</Button>
                            </Link>
                        </div>
                        <div className="mt-4 grid gap-4">
                            {myFoods.length === 0 ? (
                                <p className="text-muted-foreground">You haven't listed any dishes yet.</p>
                            ) : (
                                myFoods.map(item => (
                                    <Card key={item.id} className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 overflow-hidden rounded-md border bg-muted">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={item.imageUrl || ""} alt={item.title} className="h-full w-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold">{item.title}</h3>
                                                <p className="text-sm text-muted-foreground">Rs.{item.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* --- BUYER VIEW --- */}
                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Food Orders</CardTitle>
                            <CardDescription>Delicious food coming your way.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {myOrders.length === 0 ? (
                                <div className="text-center">
                                    <p className="mb-4 text-muted-foreground">No orders yet. Go explore amazing food!</p>
                                    <Link href="/">
                                        <Button variant="secondary">Browse Food</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {myOrders.map(order => (
                                        <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={order.food.imageUrl || ""} alt={order.food.title} className="h-full w-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{order.food.title}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="font-bold">
                                                Rs.{order.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}