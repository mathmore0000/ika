/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        colors: {
            primary: {
              DEFAULT: "#23527c",
              light: "#23527c",
              dark: "#2f3454",
            },
        }
      },
    },
    plugins: [],
}