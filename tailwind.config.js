/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#111111',
                    800: '#1a1a1a',
                    700: '#2a2a2a',
                    600: '#3a3a3a',
                    500: '#4a4a4a',
                },
                poker: {
                    green: '#0f5132',
                    red: '#dc3545',
                    gold: '#ffc107',
                }
            },
            fontFamily: {
                sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
        },
    },
    plugins: [],
} 