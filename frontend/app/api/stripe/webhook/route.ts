import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { authenticatedAxios } from "@/utils/authenticatedAxiosServer";
import axiosClient from "@/utils/axiosClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text(); // must use .text() for raw body
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err: any) {
    console.error("❌ Error verifying Stripe signature:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle event types
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { listingId, startDate, endDate, totalPrice, accessToken } =
        session.metadata!;

      console.log("✅ Payment complete for session:", session.id);

      try {
        const response = await axiosClient.post(
          "/api/reservations",
          {
            listingId,
            startDate,
            endDate,
            totalPrice,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log("✅ Reservation created:", response.data.data);
      } catch (error: any) {
        console.error(
          "❌ Failed to create reservation:",
          error.response.data.message
        );
      }
      break;
    }

    case "invoice.payment_succeeded":
      console.log("✅ Subscription payment succeeded.");
      break;
    case "charge.updated":
      // No action needed
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}
