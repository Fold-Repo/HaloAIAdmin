import { Link } from 'react-router-dom';

import { cn } from '@/utils';

type AuthLinkProps = {
  prompt: string;
  linkText: string;
  to: string;
  className?: string;
};

export function AuthLink({ prompt, linkText, to, className }: AuthLinkProps) {
  return (
    <p className={cn('text-muted-foreground text-center text-sm', className)}>
      {prompt}{' '}
      <Link to={to} className="text-foreground font-medium underline-offset-4 hover:underline">
        {linkText}
      </Link>
    </p>
  );
}
