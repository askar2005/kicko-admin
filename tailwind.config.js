/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0ea5e9',
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#f1f5f9',
                    foreground: '#0f172a',
                },
                destructive: {
                    DEFAULT: '#ef4444',
                    foreground: '#ffffff',
                },
                muted: {
                    DEFAULT: '#f8fafc',
                    foreground: '#64748b',
                },
                card: {
                    DEFAULT: '#ffffff',
                    foreground: '#0f172a',
                },
            },
            borderRadius: {
                '2xl': '1rem',
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            }
        },
    },
    plugins: [],
}
