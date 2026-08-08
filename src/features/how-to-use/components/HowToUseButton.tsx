import { CircleHelp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { resolveHowToUseGuide } from '@/features/how-to-use/content/how-to-use.content';
import { ROUTES } from '@/constants';

type HowToUseButtonProps = {
  /** Visual variant for different shells */
  variant?: 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'default' | 'icon';
  className?: string;
  /** Optional label override (icon-only when size=icon) */
  label?: string;
};

export function HowToUseButton({
  variant = 'outline',
  size = 'sm',
  className,
  label = 'How to use',
}: HowToUseButtonProps) {
  const { pathname } = useLocation();
  const guide = resolveHowToUseGuide(pathname);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          className={className}
          aria-label={label}
        >
          <CircleHelp className="size-4" />
          {size !== 'icon' ? <span>{label}</span> : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>How to use — {guide.title}</DialogTitle>
          <DialogDescription>{guide.summary}</DialogDescription>
        </DialogHeader>

        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">
          {guide.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        {guide.tips && guide.tips.length > 0 && (
          <div className="bg-muted mt-4 rounded-md p-3 text-sm">
            <p className="font-medium">Tips</p>
            <ul className="text-muted-foreground mt-1 list-disc space-y-1 pl-4">
              {guide.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link to={ROUTES.STUDIO.TUTORIAL}>Full tutorial</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.TUTORIAL}>Public tutorial</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
