import PaymentButton from '../components/PaymentButton';

export default function Payment() {
  const handlePaymentSuccess = (response) => {
    console.log('Payment successful:', response);
    alert('Payment was successful!');
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Page</h1>
      <p>This is where the payment processing will take place.</p>

      <PaymentButton
        amount={100} // Example amount
        customer={{
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          address: '123 Main St',
          city: 'Dhaka',
          country: 'Bangladesh',
        }}
        products={[
          {
            name: 'Product 1',
            price: 100,
          },
        ]}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        buttonText="Pay Now"
        buttonClass="pay-button"
      />
    </div>
  );
}
