/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales corporativos de IMSSE
        primary: {
          DEFAULT: '#1E40AF',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#1E40AF',
          700: '#1D4ED8',
          800: '#1E3A8A',
          900: '#1E293B',
        },
        secondary: {
          DEFAULT: '#374151',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Colores de estado técnico
        status: {
          emergency: '#DC2626',    // Rojo para emergencias
          success: '#059669',      // Verde para éxito
          warning: '#D97706',      // Naranja para advertencias
          info: '#1E40AF',         // Azul para información
          pending: '#6B7280',      // Gris para pendiente
        },
        // Colores específicos para roles
        admin: {
          DEFAULT: '#1E40AF',
          light: '#3B82F6',
          dark: '#1E3A8A',
        },
        technician: {
          DEFAULT: '#059669',
          light: '#10B981',
          dark: '#047857',
        },
        client: {
          DEFAULT: '#6B7280',
          light: '#9CA3AF',
          dark: '#4B5563',
        },
        // Neutros profesionales
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Open Sans', 'ui-sans-serif', 'system-ui'],
        montserrat: ['Montserrat', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'gradient-corporate': 'linear-gradient(135deg, #1E40AF 0%, #374151 100%)',
        'gradient-admin': 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
        'gradient-tech': 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        'gradient-elegant': 'linear-gradient(135deg, #334155 0%, #475569 50%, #64748b 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
      },
      boxShadow: {
        'corporate': '0 4px 6px -1px rgba(30, 64, 175, 0.1), 0 2px 4px -1px rgba(30, 64, 175, 0.06)',
        'admin': '0 4px 6px -1px rgba(30, 64, 175, 0.15), 0 2px 4px -1px rgba(30, 64, 175, 0.1)',
        'tech': '0 4px 6px -1px rgba(5, 150, 105, 0.15), 0 2px 4px -1px rgba(5, 150, 105, 0.1)',
        'elegant': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}