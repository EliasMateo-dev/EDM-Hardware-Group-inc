import React from 'react';
// helper mínimo para unir clases y evitar añadir una dependencia externa
const join = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'brand';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-transform transform hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2';

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base font-semibold',
};

const variants: Record<Variant, string> = {
  // Elegante: degradado navy -> dorado
  primary: 'bg-gradient-to-r from-slate-800 via-slate-700 to-amber-500 text-white shadow-lg hover:from-slate-900 hover:via-slate-800 hover:to-amber-600 focus:ring-amber-300',
  secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus:ring-slate-300',
  // Brand: azul sólido usado en el resto de la página (sin degradado)
  brand: 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 focus:ring-blue-300 shadow-md',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-400',
  ghost: 'bg-transparent text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-200',
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', href, className, size = 'md', children, ...rest }) => {
  const classes = join(base, sizes[size] || sizes.md, variants[variant], className || '');

  if (href) {
    return (
      <a href={href} className={classes} {...(rest as any)}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};

export default Button;
