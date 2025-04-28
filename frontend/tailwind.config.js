import {defineConfig} from 'tailwindcss'

export default defineConfig({
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        colors: {
            dark: "#0d0d0d",
            primary: "#06b6d4",
            secondary: "#8b5cf6",
            white: "#ffffff",
            gray: {
                900: '#111827',
                800: '#1f2937',
                700: '#374151',
                400: '#9ca3af',
            },
            transparent: "transparent",
            current: "currentColor",
        },
        extend: {
            fontFamily: {
                sans: ["Poppins", "Inter", "sans-serif"],
            },
            backgroundImage: {
                "orbital-gradient": "radial-gradient(circle at center, #06b6d4 0%, #8b5cf6 100%)",
            },
            boxShadow: {
                "orbital": "0 0 15px #06b6d4, 0 0 25px #8b5cf6",
            },
            keyframes: {
                spinSlow: {
                    '0%': {transform: 'rotate(0deg)'},
                    '100%': {transform: 'rotate(360deg)'},
                },
            },
            animation: {
                spinSlow: 'spinSlow 40s linear infinite',
            },
        },
    },
    plugins: [],
})
