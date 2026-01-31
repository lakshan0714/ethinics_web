import { createFoodItem } from "@/app/actions/food";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = 'force-dynamic';
export default function SellPage() {
    return (
        <div className="container mx-auto max-w-2xl py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Sell Your Cultural Dish</CardTitle>
                    <CardDescription>
                        Share your unique recipe and story with the world.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createFoodItem} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Dish Name</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g. Grandma's Spicy Lamprais"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Story & Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Tell us about the history, ingredients, and why this dish is special..."
                                className="min-h-[120px]"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (Rs)</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="15.00"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image">Dish Image</Label>
                                <Input
                                    id="image"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full">
                            List Item
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
