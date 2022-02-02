import Stripe from 'stripe';

// this is the authentication secure by our server so we pass our secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // if the method is not POST send an ERROR
  if (req.method !== 'POST') {
    res.send({
      error: 'method need to be POST',
    });
  }

  const domainURL = 'http://localhost:3000';

  const { quantity, mode, priceID } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: mode,
    locale: 'en',
    line_items: [
      {
        price: process.env[priceID],
        quantity: quantity,
      },
    ],
    // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
    success_url: `${domainURL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domainURL}/canceled`,
  });

  res.send({
    sessionId: session.id,
  });
}
