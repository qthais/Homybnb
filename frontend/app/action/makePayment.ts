import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const initiateCheckout = async (sessionId: string) => {
  try {
    const stripe = await stripePromise;

    if (!stripe) {
      console.error('Stripe failed to load');
      return;
    }

    // Redirect to Stripe Checkout with session ID
    const result = await stripe.redirectToCheckout({
      sessionId: sessionId,
    });

    if (result.error) {
      console.error(result.error.message);
    }
    return "Process done!"
  } catch (error) {
    console.error('Error during checkout initiation:', error);
  }
};
