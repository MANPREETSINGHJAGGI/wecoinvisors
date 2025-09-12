// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // ✅ Use this instead of tailwindcss directly
    autoprefixer: {},
  },
};
