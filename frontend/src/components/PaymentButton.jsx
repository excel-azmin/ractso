// PaymentButton.js
import axios from 'axios';
import { useState } from 'react';

const PaymentButton = ({
  amount,
  customer,
  products,
  onSuccess,
  onError,
  buttonText = 'Pay Now',
  buttonClass = 'sslcz-btn',
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Prepare payment data
      const paymentData = {
        total_amount: amount,
        cus_name: customer.name,
        cus_email: customer.email,
        cus_phone: customer.phone,
        cus_add1: customer.address || 'N/A',
        cus_city: customer.city || 'N/A',
        cus_country: customer.country || 'Bangladesh',
        success_url: `${import.meta.env.VITE_API_URL}/payments/success`,
        fail_url: `${import.meta.env.VITE_API_URL}/payments/fail`,
        cancel_url: `${import.meta.env.VITE_API_URL}/payments/cancel`,
        product_name: products[0]?.name || 'Product',
        cart: products.map((product) => ({
          product: product.name,
          amount: product.price.toString(),
        })),
      };

      // Call backend to initialize payment
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments/init-popup`,
        paymentData,
      );

      if (response.data.status === 'success') {
        // Set up the payment button attributes for SSLCommerz
        const button = document.getElementById('sslczPayBtn');
        if (button) {
          button.setAttribute('token', 'token');
          button.setAttribute('order', response.data.transactionId);
          button.setAttribute(
            'endpoint',
            `${process.env.REACT_APP_API_URL}/payments/init-popup`,
          );

          // Trigger the payment popup
          setTimeout(() => {
            button.click();
          }, 100);
        }

        if (onSuccess) onSuccess(response.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      if (onError) onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className={buttonClass}
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? 'Processing...' : buttonText}
      </button>

      {/* Hidden SSLCommerz button */}
      <button
        id="sslczPayBtn"
        style={{ display: 'none' }}
        className={buttonClass}
        token="token"
        endpoint={`${import.meta.env.VITE_API_URL}/payments/init`}
      >
        Pay Now
      </button>
    </>
  );
};

export default PaymentButton;
