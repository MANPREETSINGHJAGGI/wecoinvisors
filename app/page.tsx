// app/page.tsx
"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-24 px-6 text-center bg-gradient-to-r from-blue-100 to-purple-100">
        <h1 className="text-5xl font-bold mb-4 text-blue-900">
          <span className="text-purple-700">WeCoinvisors</span> 🚀
        </h1>
        <p className="text-xl max-w-2xl mb-8">
          WeCoinVisors Leads Cohort of People With Stock & Education 🚀
        </p>
        <a
          href="/dashboard/stocks"
          className="px-6 py-3 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition"
        >
          Explore Dashboard
        </a>
      </section>

      {/* 📦 Features Grid */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl font-semibold mb-12 text-gray-800">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-gray-100 rounded-lg shadow">
            <h3 className="text-xl font-bold text-purple-600 mb-2">Live Stock Data</h3>
            <p className="text-gray-700">Track real-time stock movements from the NSE market.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg shadow">
            <h3 className="text-xl font-bold text-purple-600 mb-2">Educational Resources</h3>
            <p className="text-gray-700">Learn stock market concepts through interactive lessons and guides.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg shadow">
            <h3 className="text-xl font-bold text-purple-600 mb-2">AI-Powered Insights</h3>
            <p className="text-gray-700">Get personalized investment insights using machine learning tools.</p>
          </div>
        </div>
      </section>
{/* 🗣 Testimonials */}
<section className="py-16 px-6 bg-gradient-to-r from-gray-50 to-gray-100 text-center">
  <h2 className="text-3xl font-semibold mb-12 text-gray-800">What Our Users Say</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
    <div className="bg-white p-6 rounded-lg shadow text-left">
      <p className="text-gray-700 italic">"WeCoinvisors helped me understand the stock market with ease!"</p>
      <div className="mt-4 font-bold text-purple-700">— Priya, Student</div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow text-left">
      <p className="text-gray-700 italic">"Live stock dashboard is fast and accurate. I love it."</p>
      <div className="mt-4 font-bold text-purple-700">— Rajesh, Retail Investor</div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow text-left">
      <p className="text-gray-700 italic">"The educational content is perfect for beginners like me."</p>
      <div className="mt-4 font-bold text-purple-700">— Aisha, Aspiring Analyst</div>
    </div>
  </div>
</section>

      {/* 🧾 Footer */}
      <footer className="bg-gray-800 text-white text-center py-8">
        <div className="mb-2 text-sm">© {new Date().getFullYear()} WeCoinvisors Pvt Ltd. All rights reserved.</div>
        <div className="space-x-4 text-sm">
          <a href="/about" className="hover:underline">About</a>
          <a href="/contact" className="hover:underline">Contact</a>
          <a href="/terms" className="hover:underline">Terms</a>
        </div>
      </footer>
    </main>
  );
}
