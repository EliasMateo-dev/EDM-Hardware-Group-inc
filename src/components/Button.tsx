import React from 'react';
// minimal class join helper to avoid adding external dependency
const join = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
  className?: string;
}

const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-transform transform hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2';

const variants: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-400',
  secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus:ring-slate-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-400',
  ghost: 'bg-transparent text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-200',
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', href, className, children, ...rest }) => {
  const classes = join(base, variants[variant], className || '');

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
