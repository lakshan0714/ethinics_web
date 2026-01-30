"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrder } from "@/app/actions/createOrder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderForm({
  food,
  userId,
}: {
  food: any;
  userId: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");

  const totalPrice = food.price * quantity;

  const handleSubmit = async () => {
  if (!address) {
    alert("Please enter your address");
    return;
  }

  try {
    await createOrder({
      foodId: food.id,
      quantity,
      address,
    });

    alert("Order placed successfully!");
  } catch (e: any) {
    alert(e.message || "Something went wrong");
  }
};


  return (
    <Card>
      <CardHeader>
        <CardTitle>{food.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Address */}
        <div>
          <label className="text-sm font-medium">Delivery Address</label>
          <Input
            placeholder="Enter your full address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="text-sm font-medium">Quantity</label>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        {/* Payment */}
        <div>
          <label className="text-sm font-medium">Payment Method</label>
          <Input value="Cash on Delivery" disabled />
        </div>

        {/* Total */}
        <div className="font-semibold">
          Total: ${totalPrice.toFixed(2)}
        </div>

        <Button className="w-full" onClick={handleSubmit}>
          Done
        </Button>
      </CardContent>
    </Card>
  );
}
