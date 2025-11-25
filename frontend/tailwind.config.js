module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#6ebd20',
          500: '#487a14',
          600: '#37a06f',
          700: '#236849',
        },
      },
    },
  },
  plugins: [],
}
