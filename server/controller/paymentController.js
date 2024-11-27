//const crypto = require('crypto');
const Razorpay = require('razorpay');
const Registration = require('../models/registercustomer');

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    const customerId = req.params.customerid;
    const customer = await Registration.findById(customerId);

    if (!event || !customer) {
      return res.status(404).json({ message: "Event or Customer not found" });
    }

    const instance = new Razorpay({
      key_id: event.KEY_ID,
      key_secret: event.KEY_SECRET,
    });

    const options = {
      amount: req.body.amount * 100, // Amount in paise
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"), // Random receipt ID
      payment_capture: 1,
    };

    const order = await instance.orders.create(options);
    return res.status(200).json({ data: order });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency } = req.body;

    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    const customerId = req.params.customerid;
    const customer = await Registration.findById(customerId);

    if (!event || !customer) {
      return res.status(404).json({ message: "Event or Customer not found" });
    }
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign === razorpay_signature) {
      // Update registration
      await Registration.findByIdAndUpdate(customerId, { paymentStatus: "Success" }, { new: true });

      const paymentVerification = new Payment({
        eventId: eventId,
        paymentStatus: "Success",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: amount,
        currency: currency,
      });

      await paymentVerification.save();

      const instance = new Razorpay({
        key_id: event.KEY_ID,
        key_secret: event.KEY_SECRET,
      });

      const captureOptions = { amount: amount * 100, currency: currency };
      const paymentCaptureResponse = await instance.payments.capture(razorpay_payment_id, captureOptions.amount);

      return res.status(200).json({ message: "Payment verified and captured successfully", paymentCaptureResponse });
    } else {
      // Delete registration if payment verification failed
      await Registration.findByIdAndDelete(customerId);
      return res.status(400).json({ message: "Payment verification failed", expectedSign, razorpay_signature });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


exports.createOrderWithTransfer = async (req, res) => {
  try {
    const { amount, linkedAccountId, parentAmount } = req.body; // Include dynamic parentAmount

    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    const customerId = req.params.customerid;
    const customer = await Registration.findById(customerId);

    if (!event || !customer) {
      return res.status(404).json({ message: "Event or Customer not found" });
    }

    // Ensure parentAmount is valid and less than total amount
    const parentAmountInPaise = parentAmount ? parentAmount * 100 : 2500 * 100; // Default to 2500 if not provided
    if (parentAmountInPaise >= amount * 100) {
      return res.status(400).json({ message: "Parent amount should be less than total amount" });
    }

    // Razorpay order options with dynamic parentAmount
    const options = {
      amount: amount * 100, // Convert total amount from INR to paise
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
      payment_capture: 1, // Automatically capture the payment
      partial_payment: 0, // No partial payments allowed
      transfers: [
        {
          account: linkedAccountId, // Transfer to the linked account
          amount: (amount * 100) - parentAmountInPaise, // Transfer the remaining amount to the linked account
          currency: "INR",
          on_hold: 0,
        },
      ],
    };

    // Create Razorpay order
    const instance = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });

    const order = await instance.orders.create(options);

    return res.status(200).json({ data: order });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



exports.verifyPaymentTransfer = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, linkedAccountId, amount, currency } = req.body;
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    const customerId = req.params.customerid;
    const customer = await Registration.findById(customerId);

    if (!event || !customer) {
      return res.status(404).json({ message: "Event or Customer not found" });
    }
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign === razorpay_signature) {
      // Update registration
      await Registration.findByIdAndUpdate(customerId, { paymentStatus: "Success" }, { new: true });

      const paymentVerification = new Payment({
        eventId: req.params.id,
        paymentStatus: "Success",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: amount,
        currency: currency,
        linkedAccountId: linkedAccountId,
      });

      await paymentVerification.save();
      const instance = new Razorpay({
        key_id: event.KEY_ID,
        key_secret: event.KEY_SECRET,
      });

      const captureOptions = { amount: amount * 100, currency: currency };
      const paymentCaptureResponse = await instance.payments.capture(razorpay_payment_id, captureOptions.amount);

      return res.status(200).json({ message: "Payment verified and captured successfully", paymentCaptureResponse });
    } else {
      await Registration.findByIdAndDelete(customerId);
      return res.status(400).json({ message: "Payment verification failed", expectedSign, razorpay_signature });
    }
  } catch (error) {
    console.error("Error verifying payment transfer:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
