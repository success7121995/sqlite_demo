import {nextui} from '@nextui-org/theme'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        Bold: "var(--font-euclid-bold)",  
        BoldItalic: "var(--font-euclid-bold-italic)",
        Italic: "var(--font-euclid-italic)",
        LightItalic: "var(--font-euclid-light-italic)",
        Light: "var(--font-euclid-light)",
        MediumItalic: "var(--font-euclid-medium-italic)",
        Medium: "var(--font-euclid-medium)",
        Regular: "var(--font-euclid-regular)",
        SemiBoldItalic: "var(--font-euclid-semibold-italic)",
        SemiBold: "var(--font-euclid-semibold)",
      },
    },
  },
  darkMode: "class",
 plugins: [
    nextui({
      prefix: "ui", // prefix for themes variables
      addCommonColors: false, // override common colors (e.g. "blue", "green", "pink").
      layout: {}, // common layout tokens (applied to all themes)
      themes: {
        light: {
          layout: {}, // light theme layout tokens
          colors: {
            primary: '#8abfa3',
            background: '#ffffff'
          },
        },
      },
    })
 ],
}
