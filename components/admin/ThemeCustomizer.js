'use client'
import { useState } from 'react'
import { BiPalette, BiSun, BiMoon } from 'react-icons/bi'

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  CUSTOM: 'custom'
}

const COLOR_SCHEMES = {
  DEFAULT: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#8B5CF6'
  },
  WARM: {
    primary: '#F59E0B',
    secondary: '#EF4444',
    accent: '#EC4899'
  },
  COOL: {
    primary: '#06B6D4',
    secondary: '#6366F1',
    accent: '#8B5CF6'
  }
}

export default function ThemeCustomizer() {
  const [theme, setTheme] = useState(THEMES.LIGHT)
  const [colorScheme, setColorScheme] = useState(COLOR_SCHEMES.DEFAULT)
  const [customColors, setCustomColors] = useState({
    primary: '#000000',
    secondary: '#000000',
    accent: '#000000'
  })

  const applyTheme = () => {
    const root = document.documentElement
    const colors = theme === THEMES.CUSTOM ? customColors : colorScheme

    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-secondary', colors.secondary)
    root.style.setProperty('--color-accent', colors.accent)

    document.body.className = theme
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button
          onClick={() => setTheme(THEMES.LIGHT)}
          className={`p-2 rounded ${theme === THEMES.LIGHT ? 'bg-blue-100' : ''}`}
        >
          <BiSun />
        </button>
        <button
          onClick={() => setTheme(THEMES.DARK)}
          className={`p-2 rounded ${theme === THEMES.DARK ? 'bg-blue-100' : ''}`}
        >
          <BiMoon />
        </button>
      </div>

      {theme === THEMES.CUSTOM && (
        <div className="space-y-2">
          <div>
            <label className="block text-sm">Ana Renk</label>
            <input
              type="color"
              value={customColors.primary}
              onChange={(e) => setCustomColors({
                ...customColors,
                primary: e.target.value
              })}
              className="w-full"
            />
          </div>
          {/* ... diğer renk seçiciler */}
        </div>
      )}

      <button
        onClick={applyTheme}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Temayı Uygula
      </button>
    </div>
  )
} 