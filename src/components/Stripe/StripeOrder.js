import React, { useState } from 'react';
import 'antd/dist/antd.css';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from 'antd';
import axios from 'axios';

const CheckoutForm = props => {
  const stripe = useStripe();
  const elements = useElements();

  const {
    organizationName,
    organizationWebsite,
    contactName,
    soapBarNum,
    contactPhone,
    contactEmail,
    address,
    country,
    beneficiariesNum,
    hygieneSituation,
    hygieneInitiative,
    comments,
  } = props.values.order_details;

  const handleSubmit = async event => {
    event.preventDefault();
    console.log(props);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (!error) {
      console.log(paymentMethod);
      const { id } = paymentMethod;

      try {
        const res = await axios.post(
          'https://labs27-ecosoap-teamc-api.herokuapp.com/orders/pay',
          // 'http://98.242.245.160:8000/orders/pay',
          {
            id,
            organizationName,
            organizationWebsite,
            contactName,
            soapBarNum,
            contactPhone,
            contactEmail,
            address,
            country,
            beneficiariesNum,
            hygieneSituation,
            hygieneInitiative,
            comments,
          }
        );
        const clientSecret = res.data['client_secret'];
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: props.location.state.contactName,
              email: { contactEmail },
            },
          },
        });

        if (result.error) {
          console.log(result.error.message);
        } else {
          if (result.paymentIntent.status === 'succeeded') {
            console.log(result.paymentIntent);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement options={CARD_OPTIONS} />
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
    </form>
  );
};

const stripePromise = loadStripe(
  'pk_test_51HbTxLIV3JLVItGFEFvVyPjR9WIuHmtin99dZxtDL2BnMcXgeB4GZKCDenDMMxlR9miCaEs5bewVOnRMDgsyIZ1f003SnAbSoV'
);

const CARD_OPTIONS = {
  iconStyle: 'solid',
  style: {
    base: {
      iconColor: '#c4f0ff',
      color: '#000',
      fontWeight: 500,
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      ':-webkit-autofill': { color: '#fce883' },
      '::placeholder': { color: '#87bbfd' },
    },
    invalid: {
      iconColor: '#ffc7ee',
      color: '#ffc7ee',
    },
  },
};

// const CardField = ( { onChange } ) => (
//   <fieldset className="FormGroup">
//     <div className="FormRow">
//       <CardElement options={ CARD_OPTIONS } onChange={ onChange } />
//     </div>
//   </fieldset>
// );

function Stripe(props) {
  console.log(props.location.state.values);
  return (
    <div className="App" style={{ maxWidth: '400px', margin: '2% auto' }}>
      <h3>Price: ${props.location.state.values.price}</h3>
      <Elements stripe={stripePromise}>
        <CheckoutForm values={props.location.state.values} />
      </Elements>
    </div>
  );
}

export default Stripe;
