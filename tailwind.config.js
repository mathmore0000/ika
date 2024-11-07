/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        colors: {
            primary: {
              DEFAULT: "#001F3F",
              light: "#6c7295",
              dark: "#2f3454",
            },
        }
      },
    },
    plugins: [],
}