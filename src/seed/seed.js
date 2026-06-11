import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import User from "../models/User.js";
import Category from "../models/Category.js";
import Service from "../models/Service.js";
import Provider from "../models/Provider.js";
import Location from "../models/Location.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";

const IMG = {
  plumber: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80",
  electrician: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
  carpenter: "https://images.unsplash.com/photo-1504147738894-6d0b1465e228?w=800&q=80",
  ac: "https://images.unsplash.com/photo-1631545806609-40b900b2d5c3?w=800&q=80",
  painting: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80",
  cleaning: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
  pipeRepair: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
  wiring: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
  furniture: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  acInstall: "https://images.unsplash.com/photo-1585771724684-a382f172d549?w=800&q=80",
  wallPaint: "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=800&q=80",
  deepClean: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80",
};

const AVATARS = [
  "https://i.pravatar.cc/300?img=12",
  "https://i.pravatar.cc/300?img=32",
  "https://i.pravatar.cc/300?img=45",
  "https://i.pravatar.cc/300?img=68",
  "https://i.pravatar.cc/300?img=15",
  "https://i.pravatar.cc/300?img=27",
];

const hash = (pw) => bcrypt.hash(pw, 10);

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  await Promise.all([
    Review.deleteMany({}),
    Payment.deleteMany({}),
    Booking.deleteMany({}),
    Service.deleteMany({}),
    Provider.deleteMany({}),
    User.deleteMany({}),
    Category.deleteMany({}),
    Location.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  const locations = await Location.insertMany([
    { division: "Dhaka", district: "Dhaka", upazila: "Dhanmondi" },
    { division: "Dhaka", district: "Dhaka", upazila: "Gulshan" },
    { division: "Dhaka", district: "Dhaka", upazila: "Mirpur" },
    { division: "Dhaka", district: "Gazipur", upazila: "Tongi" },
    { division: "Chittagong", district: "Chittagong", upazila: "Panchlaish" },
    { division: "Sylhet", district: "Sylhet", upazila: "Zindabazar" },
  ]);

  const categories = await Category.insertMany([
    { name: "প্লাম্বার", icon: IMG.plumber },
    { name: "ইলেকট্রিশিয়ান", icon: IMG.electrician },
    { name: "কার্পেন্টার", icon: IMG.carpenter },
    { name: "এসি সার্ভিস", icon: IMG.ac },
    { name: "পেইন্টিং", icon: IMG.painting },
    { name: "হাউজ ক্লিনিং", icon: IMG.cleaning },
  ]);

  const [adminPw, userPw, providerPw] = await Promise.all([
    hash("Admin@123"),
    hash("User@123"),
    hash("Provider@123"),
  ]);

  const admin = await User.create({
    name: "অ্যাডমিন",
    email: "admin@localservice.com",
    phone: "01700000000",
    password: adminPw,
    photo: "https://i.pravatar.cc/300?img=1",
    role: "admin",
  });

  const demoUsers = await User.insertMany([
    {
      name: "রাহিম আহমেদ",
      email: "user@demo.com",
      phone: "01711111111",
      password: userPw,
      photo: AVATARS[0],
      role: "user",
    },
    {
      name: "ফাতেমা খাতুন",
      email: "fatema@demo.com",
      phone: "01722222222",
      password: userPw,
      photo: AVATARS[1],
      role: "user",
    },
    {
      name: "করিম হোসেন",
      email: "karim@demo.com",
      phone: "01733333333",
      password: userPw,
      photo: AVATARS[2],
      role: "user",
    },
  ]);

  const providerUsers = await User.insertMany([
    {
      name: "মো. সালাম উদ্দিন",
      email: "salam@provider.com",
      phone: "01811111111",
      password: providerPw,
      photo: AVATARS[3],
      role: "provider",
    },
    {
      name: "আবুল কালাম",
      email: "kalam@provider.com",
      phone: "01822222222",
      password: providerPw,
      photo: AVATARS[4],
      role: "provider",
    },
    {
      name: "রফিকুল ইসলাম",
      email: "rafik@provider.com",
      phone: "01833333333",
      password: providerPw,
      photo: AVATARS[5],
      role: "provider",
    },
    {
      name: "জাহিদ হাসান",
      email: "jahid@provider.com",
      phone: "01844444444",
      password: providerPw,
      photo: AVATARS[0],
      role: "provider",
    },
    {
      name: "নাসির উদ্দিন",
      email: "nasir@provider.com",
      phone: "01855555555",
      password: providerPw,
      photo: AVATARS[1],
      role: "provider",
    },
    {
      name: "ইমরান হোসেন",
      email: "imran@provider.com",
      phone: "01866666666",
      password: providerPw,
      photo: AVATARS[2],
      role: "provider",
    },
  ]);

  const providerData = [
    {
      userId: providerUsers[0]._id,
      nid: "1990123456789",
      bio: "১০ বছরের অভিজ্ঞতাসম্পন্ন প্লাম্বার। পাইপ লিক, ট্যাপ ও ওয়াশরুম সমস্যার দ্রুত সমাধান।",
      category: "Plumber",
      services: ["পাইপ মেরামত", "লিক ঠিক করা", "ওয়াশরুম ফিটিং"],
      location: { division: "Dhaka", district: "Dhaka", upazila: "Dhanmondi", area: "লেক সার্কেল" },
      priceRange: { min: 300, max: 2500 },
      rating: 4.8,
      totalReviews: 24,
    },
    {
      userId: providerUsers[1]._id,
      nid: "1985123456789",
      bio: "সার্টিফাইড ইলেকট্রিশিয়ান। বাড়ি ও অফিসের সব ধরনের বৈদ্যুতিক কাজ করি।",
      category: "Electrician",
      services: ["ওয়্যারিং", "ফ্যান ও লাইট ফিটিং", "শর্ট সার্কিট ঠিক"],
      location: { division: "Dhaka", district: "Dhaka", upazila: "Gulshan", area: "রোড ১১" },
      priceRange: { min: 400, max: 3500 },
      rating: 4.9,
      totalReviews: 31,
    },
    {
      userId: providerUsers[2]._id,
      nid: "1992123456789",
      bio: "আধুনিক ফার্নিচার ও কাঠের কাজের বিশেষজ্ঞ কার্পেন্টার।",
      category: "Carpenter",
      services: ["আলমারি তৈরি", "দরজা মেরামত", "কিচেন ক্যাবিনেট"],
      location: { division: "Dhaka", district: "Dhaka", upazila: "Mirpur", area: "সেকশন ১০" },
      priceRange: { min: 500, max: 5000 },
      rating: 4.6,
      totalReviews: 18,
    },
    {
      userId: providerUsers[3]._id,
      nid: "1988123456789",
      bio: "সব ব্র্যান্ডের এসি ইনস্টল, সার্ভিস ও গ্যাস রিফিল করি।",
      category: "AC Service",
      services: ["এসি ইনস্টলেশন", "এসি সার্ভিসিং", "গ্যাস রিফিল"],
      location: { division: "Dhaka", district: "Gazipur", upazila: "Tongi", area: "বাইপাইল" },
      priceRange: { min: 800, max: 4500 },
      rating: 4.7,
      totalReviews: 22,
    },
    {
      userId: providerUsers[4]._id,
      nid: "1995123456789",
      bio: "ইন্টেরিয়র ও এক্সটেরিয়র পেইন্টিং — প্রিমিয়াম ফিনিশ গ্যারান্টি।",
      category: "Painting",
      services: ["বাড়ি পেইন্ট", "ওয়াল পেইন্ট", "টেক্সচার পেইন্ট"],
      location: { division: "Chittagong", district: "Chittagong", upazila: "Panchlaish", area: "সিডিএ" },
      priceRange: { min: 1000, max: 8000 },
      rating: 4.5,
      totalReviews: 15,
    },
    {
      userId: providerUsers[5]._id,
      nid: "1993123456789",
      bio: "পেশাদার হাউজ ক্লিনিং টিম। ডিপ ক্লিন ও রেগুলার ক্লিনিং সার্ভিস।",
      category: "Cleaning",
      services: ["ডিপ ক্লিনিং", "সোফা ক্লিন", "বাথরুম ক্লিন"],
      location: { division: "Sylhet", district: "Sylhet", upazila: "Zindabazar", area: "আম্বরখানা" },
      priceRange: { min: 600, max: 3000 },
      rating: 4.8,
      totalReviews: 27,
    },
  ];

  const providers = await Provider.insertMany(
    providerData.map((p) => ({
      ...p,
      isAvailable: true,
      isVerified: true,
      verifiedAt: new Date(),
      status: "approved",
    }))
  );

  await Promise.all(
    providers.map((p, i) =>
      User.findByIdAndUpdate(providerUsers[i]._id, { providerProfile: p._id })
    )
  );

  const [plumber, electrician, carpenter, ac, painting, cleaning] = categories;

  const services = await Service.insertMany([
    {
      title: "পাইপ লিক মেরামত",
      description: "রান্নাঘর, বাথরুম বা ট্যাপের লিক দ্রুত ও স্থায়ীভাবে ঠিক করা হবে।",
      price: 800,
      image: IMG.pipeRepair,
      category: plumber._id,
      provider: providers[0]._id,
      rating: 4.8,
      totalReviews: 12,
    },
    {
      title: "ওয়াশরুম প্লাম্বিং সার্ভিস",
      description: "ফ্লাশ, বেসিন, শাওয়ার ফিটিং ও মেরামত — সব ধরনের ওয়াশরুম কাজ।",
      price: 1500,
      image: IMG.plumber,
      category: plumber._id,
      provider: providers[0]._id,
      rating: 4.7,
      totalReviews: 8,
    },
    {
      title: "হাউস ওয়্যারিং",
      description: "নতুন বাড়ি বা অফিসের সম্পূর্ণ বৈদ্যুতিক ওয়্যারিং ও সেফটি চেক।",
      price: 2500,
      image: IMG.wiring,
      category: electrician._id,
      provider: providers[1]._id,
      rating: 4.9,
      totalReviews: 15,
    },
    {
      title: "ফ্যান ও লাইট ইনস্টলেশন",
      description: "সিলিং ফ্যান, এলইডি লাইট ও সুইচ বোর্ড ইনস্টল ও মেরামত।",
      price: 600,
      image: IMG.electrician,
      category: electrician._id,
      provider: providers[1]._id,
      rating: 4.8,
      totalReviews: 20,
    },
    {
      title: "কাস্টম আলমারি তৈরি",
      description: "আপনার রুম অনুযায়ী ডিজাইন করে উন্নত মানের কাঠের আলমারি তৈরি।",
      price: 4500,
      image: IMG.furniture,
      category: carpenter._id,
      provider: providers[2]._id,
      rating: 4.6,
      totalReviews: 9,
    },
    {
      title: "দরজা ও জানালা মেরামত",
      description: "কাঠের দরজা, হিংজ ও লক মেরামত বা রিপ্লেসমেন্ট সার্ভিস।",
      price: 1200,
      image: IMG.carpenter,
      category: carpenter._id,
      provider: providers[2]._id,
      rating: 4.5,
      totalReviews: 7,
    },
    {
      title: "এসি ইনস্টলেশন",
      description: "স্প্লিট এসি ইনস্টল, পাইপ ফিটিং ও টেস্টিং — সব ব্র্যান্ড সাপোর্ট।",
      price: 2000,
      image: IMG.acInstall,
      category: ac._id,
      provider: providers[3]._id,
      rating: 4.7,
      totalReviews: 14,
    },
    {
      title: "এসি সার্ভিসিং ও গ্যাস রিফিল",
      description: "এসি ডিপ ক্লিন, কুলিং চেক ও গ্যাস রিফিল — একই দিনে সার্ভিস।",
      price: 1800,
      image: IMG.ac,
      category: ac._id,
      provider: providers[3]._id,
      rating: 4.8,
      totalReviews: 18,
    },
    {
      title: "৩ বেডরুম বাড়ি পেইন্ট",
      description: "প্রিমিয়াম পেইন্ট দিয়ে পুরো বাড়ির ইন্টেরিয়র পেইন্টিং।",
      price: 12000,
      image: IMG.wallPaint,
      category: painting._id,
      provider: providers[4]._id,
      rating: 4.5,
      totalReviews: 6,
    },
    {
      title: "এক রুম ওয়াল পেইন্ট",
      description: "একটি রুমের ওয়াল প্রাইমার সহ পেইন্ট — দ্রুত ও পরিষ্কার কাজ।",
      price: 3500,
      image: IMG.painting,
      category: painting._id,
      provider: providers[4]._id,
      rating: 4.6,
      totalReviews: 10,
    },
    {
      title: "ফুল হাউজ ডিপ ক্লিনিং",
      description: "বাড়ির সব রুম, রান্নাঘর ও বাথরুম পেশাদারভাবে পরিষ্কার করা হবে।",
      price: 2500,
      image: IMG.deepClean,
      category: cleaning._id,
      provider: providers[5]._id,
      rating: 4.9,
      totalReviews: 22,
    },
    {
      title: "সোফা ও কার্পেট ক্লিনিং",
      description: "সোফা, ম্যাট্রেস ও কার্পেট ডিপ ক্লিন — স্টিম ও ভ্যাকুয়াম সার্ভিস।",
      price: 1500,
      image: IMG.cleaning,
      category: cleaning._id,
      provider: providers[5]._id,
      rating: 4.8,
      totalReviews: 16,
    },
  ]);

  const booking1 = await Booking.create({
    user: demoUsers[0]._id,
    provider: providers[0]._id,
    service: services[0]._id,
    address: "হাউস ১২, রোড ৫, ধানমন্ডি, ঢাকা",
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    notes: "রান্নাঘরের ট্যাপ থেকে পানি পড়ছে",
    price: 800,
    status: "completed",
    paymentMethod: "bkash",
    paymentStatus: "paid",
  });

  const payment1 = await Payment.create({
    booking: booking1._id,
    user: demoUsers[0]._id,
    amount: 800,
    method: "bkash",
    bkashPaymentID: "DEMO001",
    bkashTrxID: "TRX8X7Y6Z",
    status: "completed",
  });
  booking1.payment = payment1._id;
  await booking1.save();

  const booking2 = await Booking.create({
    user: demoUsers[1]._id,
    provider: providers[1]._id,
    service: services[2]._id,
    address: "ফ্ল্যাট ৪বি, গুলশান ২, ঢাকা",
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    notes: "নতুন ফ্ল্যাটে ওয়্যারিং দরকার",
    price: 2500,
    status: "accepted",
    paymentMethod: "cash",
    paymentStatus: "unpaid",
  });

  await Booking.create({
    user: demoUsers[2]._id,
    provider: providers[5]._id,
    service: services[10]._id,
    address: "বাড়ি ৭, জিন্দাবাজার, সিলেট",
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    notes: "৩ বেডরুম বাড়ি ডিপ ক্লিন",
    price: 2500,
    status: "pending",
    paymentMethod: "cash",
    paymentStatus: "unpaid",
  });

  await Review.create({
    booking: booking1._id,
    user: demoUsers[0]._id,
    provider: providers[0]._id,
    service: services[0]._id,
    rating: 5,
    comment: "খুব দ্রুত এসে কাজ শেষ করেছেন। অত্যন্ত সন্তুষ্ট!",
  });

  console.log("\n✅ Demo data seeded successfully!\n");
  console.log("── Login Credentials ──");
  console.log("Admin:    admin@localservice.com  /  Admin@123");
  console.log("User:     user@demo.com          /  User@123");
  console.log("Provider: salam@provider.com     /  Provider@123");
  console.log("\n── Summary ──");
  console.log(`Categories:  ${categories.length}`);
  console.log(`Services:    ${services.length} (with images)`);
  console.log(`Providers:   ${providers.length} (approved)`);
  console.log(`Users:       ${demoUsers.length + providerUsers.length + 1}`);
  console.log(`Locations:   ${locations.length}`);
  console.log(`Bookings:    3`);
  console.log(`Reviews:     1`);

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
