import { forwardRef, type ImgHTMLAttributes, useState } from 'react';
import { cn } from '@/shared/utils/cn';

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
}

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, size = 'md', src, alt = '', fallback, ...props }, ref) => {
    const [error, setError] = useState(false);

    const sizeStyles = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    };

    const textSizeStyles = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-xl',
    };

    if (error || !src) {
      return (
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium',
            sizeStyles[size],
            textSizeStyles[size],
            className
          )}
        >
          {fallback || alt?.charAt(0)?.toUpperCase() || '?'}
        </div>
      );
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        onError={() => setError(true)}
        className={cn(
          'inline-block rounded-full object-cover',
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Avatar.displayName = 'Avatar';
