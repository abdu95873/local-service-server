import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Provider from "../models/Provider.js";
import Service from "../models/Service.js";

export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.user.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Access denied" });

    if (booking.status !== "completed")
      return res.status(400).json({ success: false, message: "Can only review completed bookings" });

    const existing = await Review.findOne({ booking: bookingId });
    if (existing)
      return res.status(400).json({ success: false, message: "Already reviewed this booking" });

    const review = await Review.create({
      booking: bookingId,
      user: req.user.id,
      provider: booking.provider,
      service: booking.service,
      rating,
      comment,
    });

    // Update provider rating
    if (booking.provider) {
      const reviews = await Review.find({ provider: booking.provider });
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Provider.findByIdAndUpdate(booking.provider, {
        rating: Math.round(avg * 10) / 10,
        totalReviews: reviews.length,
      });
    }

    // Update service rating
    const serviceReviews = await Review.find({ service: booking.service });
    const svcAvg = serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length;
    await Service.findByIdAndUpdate(booking.service, {
      rating: Math.round(svcAvg * 10) / 10,
      totalReviews: serviceReviews.length,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate("user", "name photo")
      .populate("service", "title")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getServiceReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate("user", "name photo")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
