import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                platinum: '#F9FAFB', // Light Background
                charcoal: '#1A1A1A', // Dark Text
                gold: '#B89146',     // Contrast Gold
                border: 'rgba(184, 145, 70, 0.2)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'border-beam': 'border-beam 2s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'fade-in': 'fade-in 0.8s ease-out forwards',
                'fade-in-up': 'fade-in-up 1s ease-out forwards',
            },
            keyframes: {
                'border-beam': {
                    '0%, 100%': { 'offset-distance': '0%' },
                    '50%': { 'offset-distance': '100%' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
};

export default config;
