'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Stripe } from '@stripe/stripe-js';
import ClientOnly from '../components/ClientOnly';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Checkout() {
  const handleCheckout = async () => {
    const stripe: Stripe | null = await stripePromise;

    if (!stripe) {
      console.error('Stripe failed to load');
      return;
    }

    const response = await fetch('/api/checkout-sessions/create', {
      method: 'POST',
    });

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error(result.error);
    }
  };

  return (
    <ClientOnly>
    <div>
      <h1>Stripe Checkout Example</h1>
      <button onClick={handleCheckout}>Checkout</button>
    </div>
    </ClientOnly>
  );
}
