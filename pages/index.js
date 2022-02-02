import { loadStripe } from '@stripe/stripe-js';
import { Product } from '../components/Product';
import { Subscription } from '../components/Subscription';

// This is Fronted mostly (but still this is going to be rendered on the server)
export default function Home(
  /* this are the props that come from gSSP */ props,
) {
  const stripeLoader = loadStripe(props.publicKey);

  async function handleClick(mode, priceId, quantity) {
    // Use the fronted stripe library to create the redirection
    const stripeClient = await stripeLoader;

    // do a POST request to our API
    const response = await fetch('api/stripe-session', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      // this transform JS into JSON
      body: JSON.stringify({
        quantity: quantity,
        mode: mode,
        priceID: priceId,
      }),
    });

    // This transform JSON into JS
    const data = await response.json();

    console.log('The setion created is', data);
    // pass the session id to perform the redirection
    stripeClient.redirectToCheckout({
      sessionId: data.sessionId,
    });
  }

  return (
    <div>
      <Product clickHandler={handleClick} productPrice={props.tablet} />
      <Subscription clickHandler={handleClick} productPrice={props.magazine} />
    </div>
  );
}

// This is backend node.js
export async function getServerSideProps() {
  const stripe = await import('stripe');
  // I authenticate with my SecretKey
  const stripeServer = stripe.default(process.env.STRIPE_SECRET_KEY);

  const publicKey = process.env.STRIPE_PUBLISHABLE_KEY;

  const price1 = await stripeServer.prices.retrieve(process.env.PRICE);
  // price1 = {
  //   currency: 'eur',
  //   unit_amount: 1000,
  // }

  const price2 = await stripeServer.prices.retrieve(process.env.PRICE2);

  // console.log(price1); // comment out the console.log to see the full price object from stripe

  return {
    props: {
      publicKey,
      magazine: {
        priceId: 'PRICE',
        mode: 'subscription',
        currency: price1.currency,
        unitAmount: price1.unit_amount,
      },
      tablet: {
        priceId: 'PRICE2',
        mode: 'payment',
        currency: price2.currency,
        unitAmount: price2.unit_amount,
      },
    },
  };
}
