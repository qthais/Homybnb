// app/api/checkout-sessions/create/route.ts
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: NextRequest) {
  try {
    const { listing, totalPrice, startDate, endDate,accessToken } = await req.json();
    if (!listing || !totalPrice || !startDate || !endDate) {
      return new NextResponse(
        JSON.stringify({
          error: "listing, totalPrice, startDate, and endDate are required",
        }),
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Reservation for ${listing.title}`,
            },
            unit_amount: totalPrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/trips?status=success`,
      cancel_url: `${origin}/listings/${listing.id}`,
      metadata: {
        listingId: listing.id, 
        startDate,
        endDate,
        totalPrice,
        accessToken,
      },
    });

    return NextResponse.json({ id: session.id });
  } catch (err: any) {
    console.log(err);
    return new NextResponse(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
