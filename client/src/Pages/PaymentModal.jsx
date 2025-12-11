import { useState } from "react";
import { CreditCard, X, Mail, CheckCircle } from "lucide-react";
import { apiRequest } from "../config/api";

export const PaymentModal = ({ isOpen, onClose, onOnline, onCOD, amount, selectedCourseId, courseTitle, userEmail }) => {
  const [tab, setTab] = useState("online");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'error', null

  if (!isOpen) return null;

  // Helper function to verify payment with retry logic
  const verifyPaymentWithRetry = async (paymentData, maxRetries = 2) => {
    let lastError = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 [Payment] Retry attempt ${attempt}/${maxRetries}...`);
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
        
        const verifyRes = await apiRequest("payments/verify", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(paymentData),
        });
        
        // If successful, return the response
        if (verifyRes && verifyRes.data) {
          return verifyRes;
        }
      } catch (error) {
        lastError = error;
        console.error(`❌ [Payment] Attempt ${attempt + 1} failed:`, error.message);
        
        // Don't retry on 4xx errors (client errors)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw error;
        }
      }
    }
    
    // All retries failed
    throw lastError || new Error('Verification failed after retries');
  };

  // Function to send enrollment email
  const sendEnrollmentEmail = async (paymentMethod) => {
    try {
      const emailResponse = await apiRequest("email/send-enrollment", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          userEmail: userEmail,
          courseId: selectedCourseId,
          courseTitle: courseTitle,
          amount: amount,
          paymentMethod: paymentMethod,
          paymentDate: new Date().toISOString(),
        }),
      });

      const emailData = emailResponse.data;

      if (emailResponse.ok) {
        console.log("Enrollment email sent successfully");
        return true;
      } else {
        console.error("Failed to send enrollment email:", emailData);
        return false;
      }
    } catch (error) {
      console.error("Error sending enrollment email:", error);
      return false;
    }
  };

  // Function to handle Razorpay payment
  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      setPaymentStatus(null);

      // 1️⃣ Create Razorpay order on backend
      const response = await apiRequest("payments/create-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          courseId: selectedCourseId,
          amount: amount,
          billingInfo: {
            email: userEmail || "user@example.com",
            phone: "+911234567890",
            address: "123 Test Street",
          },
        }),
      });

      const data = response.data;

      if (!data.orderId) {
        alert("Failed to create order. Try again.");
        setLoading(false);
        return;
      }

      // 2️⃣ Configure Razorpay checkout options
      const options = {
        key: data.key,
        amount: data.amount * 100, // paise
        currency: data.currency,
        order_id: data.orderId,
        name: "Ryma Academy",
        description: `Course: ${courseTitle}`,
        image: "/logo.png",
        handler: async function (response) {
          console.log('🟢 [Payment] Razorpay payment successful, starting verification...');
          console.log('🟢 [Payment] Response:', response);
          
          // Create timeout for verification (30 seconds)
          const verificationTimeout = setTimeout(() => {
            console.error('🔴 [Payment] Verification timeout!');
            setPaymentStatus('error');
            alert('Payment verification is taking too long. Please check your enrollment status or contact support.');
            setLoading(false);
          }, 30000);
          
          try {
            // Verify payment on backend with retry logic
            console.log('🔵 [Payment] Sending verification request to backend...');
            const verifyRes = await verifyPaymentWithRetry({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: selectedCourseId,
            });
            
            // Clear timeout on successful response
            clearTimeout(verificationTimeout);

            console.log('🟢 [Payment] Verification response received:', verifyRes);
            
            // Check if response is valid
            if (!verifyRes || !verifyRes.data) {
              console.error('🔴 [Payment] Invalid verification response:', verifyRes);
              throw new Error('Invalid verification response from server');
            }

            const verifyData = verifyRes.data;
            console.log('🟢 [Payment] Verification data:', verifyData);

            if (verifyData.status === "success" || verifyRes.ok) {
              console.log('✅ [Payment] Payment verified successfully!');
              setPaymentStatus('success');
              setLoading(false);
              
              // Send enrollment email (non-blocking)
              sendEnrollmentEmail("online").then(emailSent => {
                if (emailSent) {
                  console.log("Payment successful and email sent!");
                } else {
                  console.log("Payment successful but email failed to send");
                }
              }).catch(err => {
                console.error('Email sending error:', err);
              });

              // Call the success callback
              onOnline();
              
              // Auto close after 3 seconds
              setTimeout(() => {
                onClose();
                setPaymentStatus(null);
              }, 3000);
              
            } else {
              console.error('🔴 [Payment] Payment verification failed:', verifyData);
              setPaymentStatus('error');
              alert(`Payment verification failed: ${verifyData.message || 'Unknown error'}`);
              setLoading(false);
            }
          } catch (error) {
            clearTimeout(verificationTimeout);
            console.error('🔴 [Payment] Payment verification error:', error);
            console.error('🔴 [Payment] Error details:', {
              message: error.message,
              stack: error.stack,
              response: error.response
            });
            setPaymentStatus('error');
            
            // Show user-friendly error message
            const errorMsg = error.message || 'Payment verification failed. Please contact support with your payment ID.';
            alert(`Verification Error: ${errorMsg}`);
            setLoading(false);
          }
        },
        prefill: {
          name: "Student",
          email: userEmail || "student@example.com",
          contact: "+911234567890",
        },
        notes: {
          course: courseTitle,
          courseId: selectedCourseId,
        },
        theme: {
          color: "#4f46e5",
        },
      };

      // 3️⃣ Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error('🔴 [Payment] Payment failed:', response.error);
        setPaymentStatus('error');
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      
      // Handle modal dismiss (user closes without paying)
      options.modal = {
        ondismiss: function() {
          console.log('⚠️ [Payment] Payment modal dismissed by user');
          setLoading(false);
          setPaymentStatus(null);
        }
      };
      
      rzp.open();

    } catch (error) {
      console.error("Razorpay payment error:", error);
      setPaymentStatus('error');
      alert("Something went wrong with payment. Try again.");
      setLoading(false);
    }
  };

  // Function to handle COD confirmation
  const handleCODConfirmation = async () => {
    try {
      setLoading(true);
      
      // Send COD enrollment email
      const emailSent = await sendEnrollmentEmail("cash_on_delivery");
      
      if (emailSent) {
        console.log("COD confirmed and enrollment email sent!");
      } else {
        console.log("COD confirmed but email failed to send");
      }

      // Call the COD callback
      onCOD();
      
      setPaymentStatus('success');
      
      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
        setPaymentStatus(null);
        setLoading(false);
      }, 3000);
      
    } catch (error) {
      console.error("COD confirmation error:", error);
      setPaymentStatus('error');
      setLoading(false);
    }
  };

  // Success message component
  const SuccessMessage = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg w-96 p-6 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">
          You have been enrolled in <strong>{courseTitle}</strong>
        </p>
        <div className="flex items-center justify-center text-green-600 mb-4">
          <Mail className="h-5 w-5 mr-2" />
          <span className="text-sm">Enrollment confirmation sent to your email</span>
        </div>
        <button
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          onClick={() => {
            onClose();
            setPaymentStatus(null);
          }}
        >
          Continue Learning
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Success Message Overlay */}
      {paymentStatus === 'success' && <SuccessMessage />}

      {/* Payment Modal */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative bg-white rounded-lg w-96 max-w-[95vw]">
          {/* Header */}
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Complete Your Enrollment</h3>
            <p className="text-sm text-gray-600 mt-1">Course: {courseTitle}</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 text-center transition-colors ${
                tab === "online" 
                  ? "font-semibold border-b-2 border-indigo-600 text-indigo-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setTab("online")}
            >
              Pay Online
            </button>
            <button
              className={`flex-1 py-3 text-center transition-colors ${
                tab === "cod" 
                  ? "font-semibold border-b-2 border-indigo-600 text-indigo-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setTab("cod")}
            >
              Cash on Delivery
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Amount Display */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-2xl font-bold text-gray-900">₹{amount}</span>
              </div>
            </div>

            {tab === "online" ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Secure payment via Razorpay
                  </div>
                  
                  <button
                    className="flex items-center justify-center w-full py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleRazorpayPayment}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Pay ₹{amount}
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Cash on Delivery:</strong> You'll pay ₹{amount} when you receive course access. Enrollment confirmation will be sent to your email.
                    </p>
                  </div>
                  
                  <button
                    className="w-full py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleCODConfirmation}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      "Confirm Cash on Delivery"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
};