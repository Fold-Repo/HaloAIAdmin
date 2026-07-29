import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthErrorAlert } from '@/features/authentication/components/AuthFormField';
import { useOnboarding } from '@/features/authentication/hooks/useOnboarding';
import {
  onboardingSchema,
  type OnboardingFormValues,
} from '@/features/authentication/schemas/auth.schemas';

const STEPS = ['Profile', 'Studio', 'Complete'] as const;

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const { completeOnboarding, isPending, error, defaultValues } = useOnboarding();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues,
    mode: 'onChange',
  });

  const nextStep = async () => {
    const fieldsByStep: Array<Array<keyof OnboardingFormValues>> = [
      ['displayName', 'studioName'],
      ['contentType', 'experienceLevel', 'notificationsEnabled'],
      [],
    ];

    const valid = await form.trigger(fieldsByStep[step]);
    if (!valid) return;

    if (step < STEPS.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    completeOnboarding(form.getValues());
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome to AI Creator Studio</h1>
        <p className="text-muted-foreground text-sm">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
        <div className="bg-muted mx-auto h-2 w-full max-w-sm overflow-hidden rounded-full">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          className="bg-card space-y-4 rounded-xl border p-6 shadow-sm"
        >
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input id="displayName" {...form.register('displayName')} />
                {form.formState.errors.displayName && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.displayName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="studioName">Studio name</Label>
                <Input id="studioName" {...form.register('studioName')} />
                {form.formState.errors.studioName && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.studioName.message}
                  </p>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="contentType">Primary content type</Label>
                <select
                  id="contentType"
                  className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                  {...form.register('contentType')}
                >
                  <option value="short-drama">Short drama</option>
                  <option value="series">Series</option>
                  <option value="documentary">Documentary</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience level</Label>
                <select
                  id="experienceLevel"
                  className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                  {...form.register('experienceLevel')}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register('notificationsEnabled')} />
                Enable product and job notifications
              </label>
            </>
          )}

          {step === 2 && (
            <div className="space-y-2 text-center">
              <h2 className="text-lg font-semibold">You are all set</h2>
              <p className="text-muted-foreground text-sm">
                Your studio profile for <strong>{form.watch('studioName')}</strong> is ready.
                You can update these preferences later in settings.
              </p>
            </div>
          )}

          {error && <AuthErrorAlert message={error.message} />}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0 || isPending}
          onClick={() => setStep((current) => current - 1)}
        >
          Back
        </Button>
        <Button type="button" disabled={isPending} onClick={nextStep}>
          {step === STEPS.length - 1 ? (isPending ? 'Finishing...' : 'Finish setup') : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
