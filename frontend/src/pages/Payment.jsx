import { useInitPaymentMutation } from '../services/paymentApi';

export default function Payment() {
  const [initPayment] = useInitPaymentMutation();

  const handlePayment = async () => {
    // Implement payment logic here
    try {
      const result = await initPayment().unwrap();
      console.log('Payment initialization response:', result?.response);
      if (result?.response?.redirectUrl) {
        window.location.href = result.response.redirectUrl;
      } else if (result?.response?.GatewayPageURL) {
        // Fallback for different response structure
        window.location.href = result.response.GatewayPageURL;
      } else {
        throw new Error('No redirect URL received');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Page</h1>
      <p>This is where the payment processing will take place.</p>
      <div className="mb-4">
        <button className="btn" onClick={() => handlePayment()}>
          Pay Now
        </button>
      </div>
    </div>
  );
}
