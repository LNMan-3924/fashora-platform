export default function Skeleton({
  className = '',
  variant = 'rectangular',
}) {
  const variants = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
  }

  return (
    <div
      className={`animate-pulse bg-[#F0F0F0] ${variants[variant]} ${className}`}
    />
  )
}