type CameraIconProps = {
  width?: number
  height?: number
  className?: string
}

export default function CameraIcon({
  width = 22,
  height = 22,
  className,
}: CameraIconProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9.5 7.5 10.8 5.6A1.5 1.5 0 0 1 12.1 5h3.8a1.5 1.5 0 0 1 1.3.6L18.5 7.5H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
