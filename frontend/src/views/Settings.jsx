import { SettingsPanel } from '../ui/SettingsPanel.jsx';

export function SettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-slate-500">System configuration, alert thresholds, and public portal flags.</p>
      </div>
      <SettingsPanel />
    </div>
  );
}
