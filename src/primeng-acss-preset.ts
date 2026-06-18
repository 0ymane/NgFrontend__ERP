// primeng-acss-preset.ts
// Maps PrimeNG design tokens → your ACSS Tailwind CSS variables
// Works with PrimeNG v18+ / Angular v21 / Tailwind v4
//
// Strategy: PrimeNG's preset system resolves tokens in order:
//   component tokens → semantic tokens → primitive tokens
// We override at the SEMANTIC level so all components inherit from
// your ACSS variables automatically.

import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

// ---------------------------------------------------------------------------
// PRIMITIVE LAYER
// Your ACSS palette expressed as PrimeNG primitive tokens.
// These are reference-only values; semantics below point at them via CSS vars.
// ---------------------------------------------------------------------------
const acssPrimitives = {
  // Mirror your oklch palette into PrimeNG's primitive namespace.
  // PrimeNG primitives are typically used as fallbacks and in $dt() calls.
  acss: {
    primary:           'var(--color-primary)',
    primaryHover:      'var(--color-primary-hover)',
    primaryUltraLight: 'var(--color-primary-ultra-light)',
    primaryLight:      'var(--color-primary-light)',
    primarySemiLight:  'var(--color-primary-semi-light)',
    primarySemiDark:   'var(--color-primary-semi-dark)',
    primaryDark:       'var(--color-primary-dark)',
    primaryUltraDark:  'var(--color-primary-ultra-dark)',

    secondary:           'var(--color-secondary)',
    secondaryHover:      'var(--color-secondary-hover)',
    secondaryUltraLight: 'var(--color-secondary-ultra-light)',
    secondaryLight:      'var(--color-secondary-light)',
    secondarySemiLight:  'var(--color-secondary-semi-light)',
    secondarySemiDark:   'var(--color-secondary-semi-dark)',
    secondaryDark:       'var(--color-secondary-dark)',
    secondaryUltraDark:  'var(--color-secondary-ultra-dark)',

    accent:           'var(--color-accent)',
    accentHover:      'var(--color-accent-hover)',
    accentUltraLight: 'var(--color-accent-ultra-light)',
    accentLight:      'var(--color-accent-light)',
    accentSemiLight:  'var(--color-accent-semi-light)',
    accentSemiDark:   'var(--color-accent-semi-dark)',
    accentDark:       'var(--color-accent-dark)',
    accentUltraDark:  'var(--color-accent-ultra-dark)',

    neutralUltraLight: 'var(--color-neutral-ultra-light)',
    neutralLight:      'var(--color-neutral-light)',
    neutralSemiLight:  'var(--color-neutral-semi-light)',
    neutralSemiDark:   'var(--color-neutral-semi-dark)',
    neutralDark:       'var(--color-neutral-dark)',
    neutralUltraDark:  'var(--color-neutral-ultra-dark)',

    white: 'var(--color-white)',
    black: 'var(--color-black)',

    // Typography
    fontText:    'var(--font-family-text)',
    fontHeading: 'var(--font-family-heading)',

    // Spacing
    spaceXs:  'var(--space-xs)',
    spaceS:   'var(--space-s)',
    spaceM:   'var(--space-m)',
    spaceL:   'var(--space-l)',
    spaceXl:  'var(--space-xl)',
    spaceXxl: 'var(--space-xxl)',

    // Border radius
    radiusXs:   'var(--radius-xs)',
    radiusS:    'var(--radius-s)',
    radiusM:    'var(--radius-m)',
    radiusL:    'var(--radius-l)',
    radiusXl:   'var(--radius-xl)',
    radiusPill: 'var(--radius-pill)',
  }
};

// ---------------------------------------------------------------------------
// SEMANTIC LAYER
// Maps PrimeNG's well-known semantic slots → your ACSS CSS variables.
// colorScheme must mirror original preset structure (light/dark) or overrides
// will be silently ignored. We define both so dark mode works out of the box.
// ---------------------------------------------------------------------------
const acssSemantics = {
  primary: {
    color:       '{acss.primary}',
    hoverColor:  '{acss.primaryHover}',
    activeColor: '{acss.primaryDark}',
    contrastColor: '{acss.white}',
  },

  colorScheme: {
    light: {
      primary: {
        color:         '{acss.primary}',
        contrastColor: '{acss.white}',
        hoverColor:    '{acss.primaryHover}',
        activeColor:   '{acss.primaryDark}',
      },
      highlight: {
        background:    '{acss.primaryUltraLight}',
        focusBackground: '{acss.primaryLight}',
        color:         '{acss.primaryUltraDark}',
        focusColor:    '{acss.primaryUltraDark}',
      },
      focusRing: {
        color:  '{acss.primary}',
        shadow: '0 0 0 0.25rem var(--color-primary-light)',
      },
      text: {
        color:          '{acss.black}',
        hoverColor:     '{acss.neutralUltraDark}',
        mutedColor:     '{acss.neutralSemiDark}',
        hoverMutedColor: '{acss.neutralDark}',
      },
      content: {
        background:      '{acss.white}',
        hoverBackground: '{acss.neutralUltraLight}',
        borderColor:     '{acss.neutralLight}',
        color:           '{acss.black}',
        hoverColor:      '{acss.neutralUltraDark}',
      },
      overlay: {
        select: {
          background:  '{acss.white}',
          borderColor: '{acss.neutralLight}',
          color:       '{acss.black}',
        },
        popover: {
          background:  '{acss.white}',
          borderColor: '{acss.neutralLight}',
          color:       '{acss.black}',
        },
        modal: {
          background:  '{acss.white}',
          borderColor: '{acss.neutralLight}',
          color:       '{acss.black}',
        },
      },
      formField: {
        background:           '{acss.neutralUltraLight}',
        disabledBackground:   '{acss.neutralLight}',
        filledBackground:     '{acss.neutralLight}',
        filledHoverBackground: '{acss.neutralLight}',
        filledFocusBackground: '{acss.neutralUltraLight}',
        borderColor:          '{acss.neutralLight}',
        hoverBorderColor:     '{acss.primary}',
        focusBorderColor:     '{acss.primary}',
        invalidBorderColor:   '#d22b2b',
        color:                '{acss.black}',
        disabledColor:        '{acss.neutralSemiDark}',
        placeholderColor:     '{acss.neutralSemiDark}',
        floatLabelColor:      '{acss.neutralSemiDark}',
        floatLabelFocusColor: '{acss.primary}',
        floatLabelActiveColor: '{acss.neutralSemiDark}',
        floatLabelInvalidColor: '#d22b2b',
        iconColor:            '{acss.neutralSemiDark}',
        shadow:               'var(--shadow-sm)',
      },
      list: {
        option: {
          focusBackground:   '{acss.primaryUltraLight}',
          selectedBackground: '{acss.primaryLight}',
          selectedFocusBackground: '{acss.primarySemiLight}',
          color:             '{acss.black}',
          focusColor:        '{acss.primaryUltraDark}',
          selectedColor:     '{acss.primaryUltraDark}',
          selectedFocusColor: '{acss.primaryUltraDark}',
          icon: {
            color:       '{acss.neutralSemiDark}',
            focusColor:  '{acss.primary}',
          },
        },
        optionGroup: {
          background: 'transparent',
          color: '{acss.neutralSemiDark}',
        },
      },
      navigation: {
        item: {
          focusBackground:   '{acss.primaryUltraLight}',
          activeBackground:  '{acss.primaryLight}',
          color:             '{acss.black}',
          focusColor:        '{acss.primaryUltraDark}',
          activeColor:       '{acss.primaryUltraDark}',
          icon: {
            color:       '{acss.neutralSemiDark}',
            focusColor:  '{acss.primary}',
            activeColor: '{acss.primary}',
          },
        },
        submenuLabel: {
          background: 'transparent',
          color: '{acss.neutralSemiDark}',
        },
        submenuIcon: {
          color:       '{acss.neutralSemiDark}',
          focusColor:  '{acss.primary}',
          activeColor: '{acss.primary}',
        },
      },
    },

    // ---- DARK MODE ----
    dark: {
      primary: {
        color:         '{acss.primarySemiLight}',
        contrastColor: '{acss.primaryUltraDark}',
        hoverColor:    '{acss.primaryLight}',
        activeColor:   '{acss.primaryUltraLight}',
      },
      highlight: {
        background:      '{acss.primaryUltraDark}',
        focusBackground: '{acss.primaryDark}',
        color:           '{acss.primaryUltraLight}',
        focusColor:      '{acss.primaryUltraLight}',
      },
      focusRing: {
        color:  '{acss.primarySemiLight}',
        shadow: '0 0 0 0.25rem var(--color-primary-dark)',
      },
      text: {
        color:          '{acss.neutralUltraLight}',
        hoverColor:     '{acss.white}',
        mutedColor:     '{acss.neutralSemiLight}',
        hoverMutedColor: '{acss.neutralLight}',
      },
      content: {
        background:      '{acss.neutralUltraDark}',
        hoverBackground: '{acss.neutralDark}',
        borderColor:     '{acss.neutralSemiDark}',
        color:           '{acss.neutralUltraLight}',
        hoverColor:      '{acss.white}',
      },
      overlay: {
        select: {
          background:  '{acss.neutralUltraDark}',
          borderColor: '{acss.neutralSemiDark}',
          color:       '{acss.neutralUltraLight}',
        },
        popover: {
          background:  '{acss.neutralUltraDark}',
          borderColor: '{acss.neutralSemiDark}',
          color:       '{acss.neutralUltraLight}',
        },
        modal: {
          background:  '{acss.neutralUltraDark}',
          borderColor: '{acss.neutralSemiDark}',
          color:       '{acss.neutralUltraLight}',
        },
      },
      formField: {
        background:           '{acss.neutralDark}',
        disabledBackground:   '{acss.neutralUltraDark}',
        filledBackground:     '{acss.neutralSemiDark}',
        filledHoverBackground: '{acss.neutralSemiDark}',
        filledFocusBackground: '{acss.neutralDark}',
        borderColor:          '{acss.neutralSemiDark}',
        hoverBorderColor:     '{acss.primarySemiLight}',
        focusBorderColor:     '{acss.primarySemiLight}',
        invalidBorderColor:   '#f87171',
        color:                '{acss.neutralUltraLight}',
        disabledColor:        '{acss.neutralSemiLight}',
        placeholderColor:     '{acss.neutralSemiLight}',
        floatLabelColor:      '{acss.neutralSemiLight}',
        floatLabelFocusColor: '{acss.primarySemiLight}',
        floatLabelActiveColor: '{acss.neutralSemiLight}',
        floatLabelInvalidColor: '#f87171',
        iconColor:            '{acss.neutralSemiLight}',
        shadow:               'var(--shadow-sm)',
      },
      list: {
        option: {
          focusBackground:         '{acss.primaryUltraDark}',
          selectedBackground:      '{acss.primaryDark}',
          selectedFocusBackground: '{acss.primarySemiDark}',
          color:                   '{acss.neutralUltraLight}',
          focusColor:              '{acss.primaryUltraLight}',
          selectedColor:           '{acss.primaryUltraLight}',
          selectedFocusColor:      '{acss.white}',
          icon: {
            color:      '{acss.neutralSemiLight}',
            focusColor: '{acss.primarySemiLight}',
          },
        },
        optionGroup: {
          background: 'transparent',
          color: '{acss.neutralSemiLight}',
        },
      },
      navigation: {
        item: {
          focusBackground:  '{acss.primaryUltraDark}',
          activeBackground: '{acss.primaryDark}',
          color:            '{acss.neutralUltraLight}',
          focusColor:       '{acss.primaryUltraLight}',
          activeColor:      '{acss.primaryUltraLight}',
          icon: {
            color:       '{acss.neutralSemiLight}',
            focusColor:  '{acss.primarySemiLight}',
            activeColor: '{acss.primarySemiLight}',
          },
        },
        submenuLabel: {
          background: 'transparent',
          color: '{acss.neutralSemiLight}',
        },
        submenuIcon: {
          color:       '{acss.neutralSemiLight}',
          focusColor:  '{acss.primarySemiLight}',
          activeColor: '{acss.primarySemiLight}',
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// COMPONENT OVERRIDES
// Fine-tune specific components where the semantic defaults aren't enough.
// Uncomment and extend as needed.
// ---------------------------------------------------------------------------
const acssComponents = {
  button: {
    root: {
      borderRadius:   'var(--radius-m)',
      gap:            '0.5rem',
      paddingX:       '1rem',
      paddingY:       '0.65rem',
      fontWeight:     '500',
      fontSize:       'var(--text-m)',
      transitionDuration: '150ms',
    },
    // Variant overrides use PrimeNG's named severity system
    // 'primary' maps naturally to your --color-primary
    // Add secondary / accent variants below if needed:
  },
  inputtext: {
    root: {
      borderRadius:    'var(--radius-s)',
      paddingX:        '0.8em',
      paddingY:        '0.5em',
      fontSize:        'max(1rem, 16px)',
      transitionDuration: '150ms',
    },
  },
  select: {
    root: {
      borderRadius: 'var(--radius-s)',
    },
  },
  dialog: {
    root: {
      borderRadius: 'var(--radius-l)',
      shadow:       'var(--shadow-xl)',
    },
  },
  card: {
    root: {
      borderRadius: 'var(--radius-l)',
      shadow:       'var(--shadow-md)',
    },
  },
  panel: {
    root: {
      borderRadius: 'var(--radius-l)',
    },
  },
  toast: {
    root: {
      borderRadius: 'var(--radius-l)',
      shadow:       'var(--shadow-lg)',
    },
  },
  badge: {
    root: {
      borderRadius: 'var(--radius-pill)',
      fontSize:     'var(--text-xs)',
    },
  },
  tag: {
    root: {
      borderRadius: 'var(--radius-m)',
      fontSize:     'var(--text-xs)',
    },
  },
};

// ---------------------------------------------------------------------------
// ASSEMBLED PRESET
// ---------------------------------------------------------------------------
export const AcssPreset = definePreset(Aura, {
  primitive: acssPrimitives,
  semantic:  acssSemantics,
  components: acssComponents,
});

export default AcssPreset;
