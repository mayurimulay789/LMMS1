import { useState } from "react";
import { CreditCard, X } from "lucide-react";

export const PaymentModal = ({ isOpen, onClose, onOnline, onCOD, amount, selectedCourseId }) => {
  const [tab, setTab] = useState("online");
  if (!isOpen) return null;

  // Function to handle Razorpay payment
  const handleRazorpayPayment = async () => {
    try {
      // 1️⃣ Create Razorpay order on backend
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // adjust if using auth
        },
        body: JSON.stringify({
          courseId: "68d21e01273d441a9b20e9ce",
          amount: amount,
          billingInfo: {
            email: "john@example.com",
            phone: "+911234567890",
            address: "123 Test Street",
          },
        }),
      });

      const data = await response.json();

      if (!data.orderId) {
        alert("Failed to create order. Try again.");
        return;
      }

      // 2️⃣ Configure Razorpay checkout options
      const options = {
        key: data.key,
        amount: data.amount * 100, // paise
        currency: data.currency,
        order_id: data.orderId,
        name: "Your App Name",
        description: "Course Payment",
        image: "/logo.png",
        handler: async function (response) {
          // Verify payment on backend
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.status === "success") {
            alert("Payment successful!");
            onOnline(); // callback
            onClose();
          } else {
            alert("Payment verification failed!");
          }
        },
        prefill: {
          name: "John Doe",
          email: "john@example.com",
          contact: "+911234567890",
        },
        theme: {
          color: "#f50057",
        },
      };

      

      // 3️⃣ Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay payment error:", error);
      alert("Something went wrong with payment. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg w-96">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-2 text-center ${tab === "online" ? "font-bold border-b-2 border-pink-600" : ""}`}
            onClick={() => setTab("online")}
          >
            Pay Online
          </button>
          <button
            className={`flex-1 py-2 text-center ${tab === "cod" ? "font-bold border-b-2 border-pink-600" : ""}`}
            onClick={() => setTab("cod")}
          >
            Cash on Delivery
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {tab === "online" ? (
            <>
              <p className="mb-4">Amount: ₹{amount}</p>
              <button
  className="flex items-center justify-center w-full py-2 text-white bg-pink-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
  onClick={handleRazorpayPayment}
  disabled={false} // <-- make sure it's always enabled
>
  <CreditCard className="mr-2" /> Pay ₹{amount}
</button>

            </>
          ) : (
            <>
              <p className="mb-4">You’ll pay ₹{amount} on delivery.</p>
              <button
                className="w-full py-2 text-white bg-green-600 rounded"
                onClick={() => {
                  onCOD();
                  onClose();
                }}
              >
                Confirm COD
              </button>
            </>
          )}
        </div>

        {/* Close button */}
        <button
          className="absolute text-gray-500 top-2 right-2 hover:text-gray-900"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
    </div>
  );
};
