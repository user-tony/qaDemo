import plugin from 'tailwindcss/plugin'

export const tailwindcssAnimate = plugin(
  function ({ addUtilities }) {
    addUtilities({
      '.animate-in': {
        animationName: 'enter',
        animationDuration: '150ms',
        '--tw-enter-opacity': '0',
        '--tw-enter-scale': '0.95',
        '--tw-enter-rotate': '0',
        '--tw-enter-translate-x': '0',
        '--tw-enter-translate-y': '0',
      },
      '.animate-out': {
        animationName: 'exit',
        animationDuration: '150ms',
        '--tw-exit-opacity': '0',
        '--tw-exit-scale': '0.95',
        '--tw-exit-rotate': '0',
        '--tw-exit-translate-x': '0',
        '--tw-exit-translate-y': '0',
      },
    })
  },
  {
    theme: {
      extend: {
        keyframes: {
          enter: {
            from: {
              opacity: 'var(--tw-enter-opacity, 1)',
              transform:
                'translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1)) rotate(var(--tw-enter-rotate, 0))',
            },
          },
          exit: {
            to: {
              opacity: 'var(--tw-exit-opacity, 1)',
              transform:
                'translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), var(--tw-exit-scale, 1)) rotate(var(--tw-exit-rotate, 0))',
            },
          },
        },
      },
    },
  }
)
