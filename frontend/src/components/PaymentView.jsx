// src/components/PaymentTable.jsx
import { useState } from 'react';
import { useSelector } from 'react-redux';

function PaymentView({ payments }) {
  const { user } = useSelector((state) => state.auth);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Format status with appropriate colors
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    let badgeClass = 'badge badge-ghost badge-sm';

    if (
      statusLower.includes('success') ||
      statusLower.includes('complete') ||
      statusLower.includes('approved')
    ) {
      badgeClass = 'badge badge-success badge-sm';
    } else if (
      statusLower.includes('fail') ||
      statusLower.includes('reject') ||
      statusLower.includes('error')
    ) {
      badgeClass = 'badge badge-error badge-sm';
    } else if (
      statusLower.includes('pending') ||
      statusLower.includes('processing')
    ) {
      badgeClass = 'badge badge-warning badge-sm';
    }

    return <span className={badgeClass}>{status}</span>;
  };

  // Format date if available
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const openModal = (payment) => {
    setSelectedPayment(payment);
    document.getElementById('payment_modal').showModal();
  };

  return (
    <div className="overflow-x-auto">
      {/* Payment Details Modal */}
      <dialog id="payment_modal" className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
          <h3 className="font-bold text-2xl mb-6 text-center">
            Payment Details
          </h3>

          {selectedPayment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - User and Payment Info */}
              <div className="space-y-4">
                <div className="bg-base-200 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-2">User Information</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        <img
                          src={
                            user?.avatar ||
                            'https://img.daisyui.com/images/profile/demo/2@94.webp'
                          }
                          alt="User Avatar"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{user?.fullName || 'N/A'}</div>
                      <div className="text-sm opacity-50">
                        {user?.email || 'No email'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-base-200 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-2">
                    Payment Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Payment Type:</span>
                      <span>{selectedPayment.paymentType || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold">Amount:</span>
                      <span className="font-bold text-lg text-primary">
                        ${selectedPayment.amount || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Transaction Details */}
              <div className="space-y-4">
                <div className="bg-base-200 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-2">
                    Transaction Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Transaction ID:</span>
                      <span className="font-mono">
                        {selectedPayment.tran_id || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Status:</span>
                      {getStatusBadge(selectedPayment.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Date:</span>
                      <span>{formatDate(selectedPayment.createdAt)}</span>
                    </div>
                    {selectedPayment.updatedAt && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Last Updated:</span>
                        <span>{formatDate(selectedPayment.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedPayment.additionalInfo && (
                  <div className="bg-base-200 p-4 rounded-lg">
                    <h4 className="font-bold text-lg mb-2">
                      Additional Information
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(selectedPayment.additionalInfo).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-semibold capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span>{value || 'N/A'}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="modal-action">
            <button
              className="btn"
              onClick={() => document.getElementById('payment_modal').close()}
            >
              Close
            </button>
          </div>
        </div>

        {/* Modal backdrop */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Payments Table */}
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            {/* <th>
              <label>
                <input type="checkbox" className="checkbox" />
              </label>
            </th> */}
            <th>User</th>
            <th>Payment Details</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Transaction ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Map through all payments */}
          {payments.map((payment) => (
            <tr key={payment.id || payment.tran_id}>
              {/* <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th> */}
              <td onClick={() => openModal(payment)}>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="mask mask-squircle h-12 w-12">
                      <img
                        src={
                          user?.avatar ||
                          'https://img.daisyui.com/images/profile/demo/2@94.webp'
                        }
                        alt="Avatar Tailwind CSS Component"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{user?.fullName || 'N/A'}</div>
                    <div className="text-sm opacity-50">
                      {user?.email || 'No email'}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <span className="badge badge-ghost badge-sm">
                  {payment.paymentType || 'N/A'}
                </span>
                <br />
                <span className="text-xs">{payment.paymentMethod}</span>
              </td>
              <td>
                <span className="font-bold text-lg">
                  ${payment.amount || '0.00'}
                </span>
              </td>
              <td>{getStatusBadge(payment.status)}</td>
              <td>{formatDate(payment.createdAt)}</td>
              <td>
                <span className="font-mono text-sm">
                  {payment.tran_id
                    ? `${payment.tran_id.slice(0, 8)}...`
                    : 'N/A'}
                </span>
              </td>
              <th>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => openModal(payment)}
                >
                  details
                </button>
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PaymentView;
