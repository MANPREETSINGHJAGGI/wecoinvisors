// tailwind.config.ts
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "#0a0a0a",        // Deep black background
        gold: "#FFD700",        // Gold accent
        grayText: "#b0b0b0",    // Muted text
      },
      boxShadow: {
        gold: "0 0 10px #FFD700",
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        fadeInUp: "fadeInUp 0.6s ease-out",
      },
      keyframes: {
        fadeInUp: {
          "0%": {
            opacity: 0,
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

// 💡 Ownership Prompt to be shown near dashboard explore + login/signup
// <p className="text-center text-sm text-grayText mt-2">
//   🎁 You’re using it free… But remember: you can own it in just ₹1 / $1 / CHF1 🎉
// </p>

// ✅ Add to login page below form
// Example usage in app/login/page.tsx:
// <div className="mt-4">
//   <p className="text-center text-sm text-grayText">
//     🎁 You’re using it free… But remember: you can own it in just ₹1 / $1 / CHF1 🎉
//   </p>
// </div>
