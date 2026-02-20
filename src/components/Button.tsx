import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  icon?: ReactNode
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
}

export default function Button({
  children,
  icon,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 text-base gap-2'

  const variants = {
    primary:
      'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-200',
    secondary:
      'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 active:bg-neutral-100 focus:ring-neutral-200',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}
