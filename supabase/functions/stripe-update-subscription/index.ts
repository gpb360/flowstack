import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }

    const stripe = new Stripe(stripeSecretKey);

    const { subscriptionId, newPriceId, prorationBehavior } = await req.json();

    // Validation
    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ error: 'subscriptionId is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!newPriceId) {
      return new Response(
        JSON.stringify({ error: 'newPriceId is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Retrieve existing subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription.items.data || subscription.items.data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No items found in subscription' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: prorationBehavior || 'create_prorations',
    });

    return new Response(
      JSON.stringify({
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        items: updatedSubscription.items.data.map((item) => ({
          id: item.id,
          price: item.price.id,
          quantity: item.quantity,
        })),
        current_period_end: updatedSubscription.current_period_end,
        cancel_at_period_end: updatedSubscription.cancel_at_period_end,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in stripe-update-subscription:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.code,
        type: error.type,
      }),
      {
        status: error.code ? 400 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
