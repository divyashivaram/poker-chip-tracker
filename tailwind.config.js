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
                // Enhanced poker theme with refined, sophisticated colors
                poker: {
                    green: {
                        50: '#ecfdf5',
                        100: '#d1fae5',
                        500: '#059669', // Deep Emerald - more sophisticated than bright green
                        600: '#047857', // Forest Green - refined and luxurious
                        700: '#065f46',
                        800: '#064e3b',
                        900: '#022c22',
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
                        500: '#b91c1c', // Deep Crimson - refined alternative to fire-engine red
                        600: '#991b1b', // Ruby Red - sophisticated and less jarring
                        700: '#7f1d1d',
                    }
                },
                // Accent colors with refined palette
                accent: {
                    blue: '#475569', // Slate Blue - muted and calming for call actions
                    teal: '#0f766e', // Alternative teal option for call actions
                    purple: '#8b5cf6',
                    emerald: '#059669', // Matching the new poker green
                    amber: '#f59e0b',
                },
                // Extended teal palette for call actions
                teal: {
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                },
                // Extended slate palette for call actions
                slate: {
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
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
                'glow': '0 0 20px rgba(5, 150, 105, 0.3)', // Updated to match new emerald green
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
                    '0%, 100%': { boxShadow: '0 0 20px rgba(5, 150, 105, 0.3)' }, // Updated to match new emerald green
                    '50%': { boxShadow: '0 0 30px rgba(5, 150, 105, 0.6)' },
                },
            },
        },
    },
    plugins: [],
} 