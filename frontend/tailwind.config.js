import {withMT} from '@material-tailwind/react/utils/withMT'

export default withMT({
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#06b6d4",
                secondary: "#8b5cf6",
                dark: "#0d0d0d",
                surface: "#111827",
                white: "#ffffff",
                muted: "#9ca3af",
                gray: {
                    900: '#111827',
                    800: '#1f2937',
                    700: '#374151',
                    400: '#9ca3af',
                },
            },
            fontFamily: {
                sans: ["Poppins", "Inter", "sans-serif"],
            },
            backgroundImage: {
                "orbital-gradient": "radial-gradient(circle at center, #06b6d4 0%, #8b5cf6 100%)",
                "cosmic-gradient": "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 40%, #22d3ee 100%)",
            },
            boxShadow: {
                "orbital": "0 0 20px #06b6d4, 0 0 40px #8b5cf6",
                "glow-primary": "0 0 10px #06b6d4",
                "glow-secondary": "0 0 10px #8b5cf6",
            },
            keyframes: {
                spinSlow: {
                    '0%': {transform: 'rotate(0deg)'},
                    '100%': {transform: 'rotate(360deg)'},
                },
                glowPulse: {
                    '0%, 100%': {boxShadow: '0 0 15px #06b6d4, 0 0 30px #8b5cf6'},
                    '50%': {boxShadow: '0 0 30px #8b5cf6, 0 0 60px #06b6d4'},
                },
            },
            animation: {
                spinSlow: 'spinSlow 40s linear infinite',
                glowPulse: 'glowPulse 4s ease-in-out infinite',
            },
        },
    },
    plugins: [],
})
