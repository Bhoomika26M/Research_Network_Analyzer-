import React from 'react'

interface ScientificLogoProps {
  width?: number
  height?: number
  iconOnly?: boolean
  /** text color override – defaults to white */
  textColor?: string
}

/** Atom mark + "Scientific" wordmark, white on any colored background */
export const ScientificLogo: React.FC<ScientificLogoProps> = ({
  width = 130, height = 34, iconOnly = false, textColor = '#ffffff'
}) => {
  if (iconOnly) {
    return (
      <svg viewBox="0 0 34 34" width={height} height={height} xmlns="http://www.w3.org/2000/svg" aria-label="Scientific">
        <circle cx="17" cy="17" r="4" fill={textColor} />
        {/* orbit 1 – horizontal */}
        <ellipse cx="17" cy="17" rx="16" ry="6" fill="none" stroke={textColor} strokeWidth="1.5" opacity="0.9" />
        {/* orbit 2 – 60° */}
        <ellipse cx="17" cy="17" rx="16" ry="6" fill="none" stroke={textColor} strokeWidth="1.5" opacity="0.7"
          transform="rotate(60 17 17)" />
        {/* orbit 3 – 120° */}
        <ellipse cx="17" cy="17" rx="16" ry="6" fill="none" stroke={textColor} strokeWidth="1.5" opacity="0.5"
          transform="rotate(120 17 17)" />
        {/* electrons */}
        <circle cx="33" cy="17" r="2.5" fill={textColor} />
        <circle cx="9"  cy="5.5" r="2.5" fill={textColor} opacity="0.8" />
        <circle cx="9"  cy="28.5" r="2.5" fill={textColor} opacity="0.6" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 160 34" width={width} height={height} xmlns="http://www.w3.org/2000/svg" aria-label="Scientific">
      {/* atom icon */}
      <circle cx="17" cy="17" r="3.5" fill={textColor} />
      <ellipse cx="17" cy="17" rx="15" ry="5.5" fill="none" stroke={textColor} strokeWidth="1.4" opacity="0.9" />
      <ellipse cx="17" cy="17" rx="15" ry="5.5" fill="none" stroke={textColor} strokeWidth="1.4" opacity="0.7"
        transform="rotate(60 17 17)" />
      <ellipse cx="17" cy="17" rx="15" ry="5.5" fill="none" stroke={textColor} strokeWidth="1.4" opacity="0.5"
        transform="rotate(120 17 17)" />
      <circle cx="32" cy="17" r="2.2" fill={textColor} />
      <circle cx="8.5" cy="6"  r="2.2" fill={textColor} opacity="0.8" />
      <circle cx="8.5" cy="28" r="2.2" fill={textColor} opacity="0.6" />
      {/* wordmark */}
      <text
        x="38" y="23"
        fontFamily="Poppins, system-ui, sans-serif"
        fontSize="15"
        fontWeight="700"
        letterSpacing="-0.3"
        fill={textColor}
      >Scientific</text>
    </svg>
  )
}

/** Gradient pill wrapper used in sidebar / auth */
export const ScientificLogoPill: React.FC<{ collapsed?: boolean }> = ({ collapsed = false }) => (
  <div
    className="flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600"
    style={collapsed ? { width: 36, height: 36 } : { padding: '6px 14px' }}
  >
    <ScientificLogo iconOnly={collapsed} width={collapsed ? 20 : 118} height={collapsed ? 20 : 26} />
  </div>
)

export default ScientificLogo
