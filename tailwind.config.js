/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ayur: {
                    green: "#2D5A27", // Deep Forest Green
                    gold: "#D4AF37",  // Earthy Gold
                    cream: "#F9F7F2", // Premium Off-white/Cream
                    charcoal: "#333333",
                    accent: "#6B8E23", // Olive Green Accent
                },
            },
            fontFamily: {
                serif: ["Crimson Pro", "serif"],
                sans: ["Outfit", "sans-serif"],
            },
        },
    },
    plugins: [],
}
