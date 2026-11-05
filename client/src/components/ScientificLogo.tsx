import React from 'react'

interface ScientificLogoProps {
  width?: number
  height?: number
  iconOnly?: boolean
  textColor?: string
}

export const ScientificLogo: React.FC<ScientificLogoProps> = ({
  width = 130,
  height = 34,
  iconOnly = false,
  textColor = '#ffffff',
}) => {
  if (iconOnly) {
    return (
      <svg viewBox="0 0 34 34" width={height} height={height} xmlns="http://www.w3.org/2000/svg" aria-label="Scientific">
        <circle cx="17" cy="17" r="4" fill={textColor} />
        <ellipse cx="17" cy="17" rx="16" ry="6" fill="none" stroke={textColor} strokeWidth="1.5" opacity="0.9" />
        <ellipse
          cx="17"
          cy="17"
          rx="16"
          ry="6"
          fill="none"
          stroke={textColor}
          strokeWidth="1.5"
          opacity="0.7"
          transform="rotate(60 17 17)"
        />
        <ellipse
          cx="17"
          cy="17"
          rx="16"
          ry="6"
          fill="none"
          stroke={textColor}
          strokeWidth="1.5"
          opacity="0.5"
          transform="rotate(120 17 17)"
        />
        <circle cx="33" cy="17" r="2.5" fill={textColor} />
        <circle cx="9" cy="5.5" r="2.5" fill={textColor} opacity="0.8" />
        <circle cx="9" cy="28.5" r="2.5" fill={textColor} opacity="0.6" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 160 34" width={width} height={height} xmlns="http://www.w3.org/2000/svg" aria-label="Scientific">
      <circle cx="17" cy="17" r="3.5" fill={textColor} />
      <ellipse cx="17" cy="17" rx="15" ry="5.5" fill="none" stroke={textColor} strokeWidth="1.4" opacity="0.9" />
      <ellipse
        cx="17"
        cy="17"
        rx="15"
        ry="5.5"
        fill="none"
        stroke={textColor}
        strokeWidth="1.4"
        opacity="0.7"
        transform="rotate(60 17 17)"
      />
      <ellipse
        cx="17"
        cy="17"
        rx="15"
        ry="5.5"
        fill="none"
        stroke={textColor}
        strokeWidth="1.4"
        opacity="0.5"
        transform="rotate(120 17 17)"
      />
      <circle cx="32" cy="17" r="2.2" fill={textColor} />
      <circle cx="8.5" cy="6" r="2.2" fill={textColor} opacity="0.8" />
      <circle cx="8.5" cy="28" r="2.2" fill={textColor} opacity="0.6" />
      <text
        x="38"
        y="23"
        fontFamily="'Poppins', 'Inter', system-ui, sans-serif"
        fontSize="16"
        fontWeight="700"
        letterSpacing="-0.3"
        fill={textColor}
      >
        Scientific
      </text>
    </svg>
  )
}

/** Rounded pill button seen exactly in the Figma screenshots */
export const ScientificLogoPill: React.FC<{ collapsed?: boolean }> = ({ collapsed = false }) => (
  <div
    className="flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 shadow-sm"
    style={collapsed ? { width: 38, height: 38 } : { width: '100%', height: 42, padding: '0 16px' }}
  >
    <ScientificLogo iconOnly={collapsed} width={collapsed ? 22 : 126} height={collapsed ? 22 : 28} textColor="#ffffff" />
  </div>
)

export default ScientificLogo
