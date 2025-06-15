import { ChannelStatusCard } from "./channel-page/channel-status-card";

export function ChannelSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold">Configurações do canal</h3>
      <div className="space-y-2">
        <ChannelStatusCard />
      </div>
    </div>
  )
}