/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Modern dark theme palette
                dark: {
                    950: '#0a0a0a',
                    900: '#111111',
                    850: '#171717',
                    800: '#1f1f1f',
                    750: '#262626',
                    700: '#2d2d2d',
                    600: '#404040',
                    500: '#525252',
                    400: '#6b6b6b',
                    300: '#a3a3a3',
                },
                // Enhanced poker theme
                poker: {
                    green: {
                        50: '#f0fdf4',
                        100: '#dcfce7',
                        500: '#22c55e',
                        600: '#16a34a',
                        700: '#15803d',
                        800: '#166534',
                        900: '#14532d',
                    },
                    gold: {
                        50: '#fffbeb',
                        100: '#fef3c7',
                        400: '#fbbf24',
                        500: '#f59e0b',
                        600: '#d97706',
                        700: '#b45309',
                    },
                    red: {
                        500: '#ef4444',
                        600: '#dc2626',
                        700: '#b91c1c',
                    }
                },
                // Accent colors
                accent: {
                    blue: '#3b82f6',
                    purple: '#8b5cf6',
                    emerald: '#10b981',
                    amber: '#f59e0b',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                display: ['Inter', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(34, 197, 94, 0.3)',
                'glow-gold': '0 0 20px rgba(245, 158, 11, 0.3)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' },
                    '50%': { boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)' },
                },
            },
        },
    },
    plugins: [],
} 