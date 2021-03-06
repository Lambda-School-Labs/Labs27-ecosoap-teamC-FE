import React, { useState } from 'react';
import 'antd/dist/antd.css';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

import '../../styles/StripeCheckout/StripeOrder.css';
import '../../styles/OrderForm/OrderForm.css';
import '../../styles/EcoSoapLogo/EcoSoapLogo.css';

import ecosoapLogo from '../../assets/ecosoapLogo.png';

import OrderReceipt from './OrderReceipt';

import DashboardHeader from '../Dashboard/Header/DashboardHeader';

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

  const qID = props.values.priceInfo.qid;

  const handleSubmit = async event => {
    event.preventDefault();

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
          {
            qID,
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
              name: contactName,
              email: contactEmail,
              address: address,
              phone: contactPhone,
            },
          },
        });
        props.success(true);

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
      <CardElement options={CARD_OPTIONS} className="stripeCard" />
      <button type="submit" disabled={!stripe} className="btn">
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
      // fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      ':-webkit-autofill': { color: '#2F559C' },
      '::placeholder': { color: '#b0c4e8' },
    },
    invalid: {
      iconColor: '#ffc7ee',
      color: '#ffc7ee',
    },
  },
};

function Stripe(props) {
  const [orderSuccess, setOrderSuccess] = useState(false);

  return (
    <>
      <DashboardHeader />
      <div className="App" style={{ maxWidth: '400px', margin: '2% auto' }}>
        <img src={ecosoapLogo} />
        <h1>Eco-Soap Bank Checkout</h1>
        <h3>Price: ${props.location.state.values.priceInfo.price / 100}</h3>
        <Elements stripe={stripePromise}>
          <CheckoutForm
            values={props.location.state.values}
            success={setOrderSuccess}
          />
        </Elements>
        {orderSuccess == true ? (
          <OrderReceipt
            details={props.location.state.values}
            price={props.location.state.values.priceInfo.price}
          />
        ) : null}
      </div>
    </>
  );
}

export default Stripe;
