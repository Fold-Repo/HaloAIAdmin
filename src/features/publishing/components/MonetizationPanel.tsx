import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdatePublishSettings } from '@/features/publishing/hooks/usePublishing';
import type { PublishSettings } from '@/types';

type MonetizationPanelProps = {
  projectId: string;
  settings: PublishSettings;
};

function ToggleRow({
  id,
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <div>
        <Label htmlFor={id} className="font-medium">
          {label}
        </Label>
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
      </div>
    </div>
  );
}

export function MonetizationPanel({ projectId, settings }: MonetizationPanelProps) {
  const updateSettings = useUpdatePublishSettings(projectId);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monetization toggles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            id="premium"
            label="Premium toggle"
            description="Restrict episodes to premium subscribers."
            checked={settings.isPremium}
            onCheckedChange={(checked) => updateSettings.mutate({ isPremium: checked })}
          />
          <ToggleRow
            id="rewarded-ads"
            label="Rewarded ad toggle"
            description="Allow viewers to unlock episodes by watching rewarded ads."
            checked={settings.rewardedAdsEnabled}
            disabled={settings.isPremium}
            onCheckedChange={(checked) => updateSettings.mutate({ rewardedAdsEnabled: checked })}
          />
          <ToggleRow
            id="coin-unlock"
            label="Coin unlock toggle"
            description="Let viewers spend coins to unlock individual episodes."
            checked={settings.coinUnlockEnabled}
            onCheckedChange={(checked) => updateSettings.mutate({ coinUnlockEnabled: checked })}
          />
        </CardContent>
      </Card>

      {settings.coinUnlockEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Coin price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex max-w-xs items-center gap-3">
              <Input
                type="number"
                min={0}
                value={settings.coinPrice}
                onChange={(event) =>
                  updateSettings.mutate({ coinPrice: Number(event.target.value) })
                }
              />
              <span className="text-muted-foreground text-sm">coins per episode</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
