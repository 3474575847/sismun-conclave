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
                platinum: '#F0F4F8', // Cool White
                charcoal: '#0A192F', // Deep Royal Blue (Background/Text)
                gold: '#FFCC00',     // School Yellow/Gold
                'school-red': '#D32F2F',
                'school-blue': '#1565C0',
                border: 'rgba(255, 204, 0, 0.2)', // Gold border
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-jetbrains-mono)', 'monospace'],
                display: ['var(--font-cormorant)', 'serif'],
                serif: ['var(--font-cormorant)', 'serif'],
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
