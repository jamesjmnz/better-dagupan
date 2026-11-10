import {
  type AnchorHTMLAttributes,
  type ComponentProps,
  type ReactNode,
} from 'react';

import { Button } from '@bettergov/kapwa/button';

import { cn } from '@/lib/utils';

type KapwaButtonProps = ComponentProps<typeof Button>;

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  variant?: KapwaButtonProps['variant'];
  size?: KapwaButtonProps['size'];
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// The kapwa Button only renders a <button>, so it cannot navigate. These are
// the same class recipes it applies, so a link styled with them looks
// identical to the button it replaces.
const variantClasses: Record<
  NonNullable<ButtonLinkProps['variant']>,
  string
> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
  secondary:
    'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
  outline:
    'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  link: 'bg-transparent text-primary-500 hover:underline p-0 h-auto focus:ring-0',
};

const sizeClasses: Record<NonNullable<ButtonLinkProps['size']>, string> = {
  sm: 'text-sm px-3 py-1.5 h-8',
  md: 'text-base px-4 py-2 h-10',
  lg: 'text-lg px-6 py-3 h-12',
};

/**
 * A link that looks like a kapwa `Button`. Use it wherever a button-styled
 * control navigates somewhere instead of running an action.
 */
export function ButtonLink({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus:outline-hidden focus:ring-2 focus:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        variant !== 'link' && 'shadow-xs',
        className
      )}
      {...props}
    >
      {leftIcon && <span className='mr-2'>{leftIcon}</span>}
      {children}
      {rightIcon && <span className='ml-2'>{rightIcon}</span>}
    </a>
  );
}
