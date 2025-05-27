"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { useState } from "react";
import { UserPreferences } from "@prisma/client";
import { toggleNotificationAction } from "@/app/(dashboard)/actions";

const NotificationPopover = ({
  userPreference,
}: {
  userPreference: UserPreferences | null;
}) => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(
    userPreference?.emailNotification || false
  );
  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    userPreference?.emailNotification ? ["email"] : []
  );

  const notificationChannels = [{ id: "email", label: "E-mail" }];

  const handleChannelChange = (channelId: string, checked: boolean) => {
    setSelectedChannels((prev) =>
      checked ? [...prev, channelId] : prev.filter((id) => id !== channelId)
    );
  };

  const handleSaveNotifications = () => {
    console.log("Notificações:", isNotificationsEnabled);
    console.log("Canais selecionados:", selectedChannels);

    if (isNotificationsEnabled) {
      toggleNotificationAction(selectedChannels.length > 0);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="mb-4">
          <h4 className="font-medium leading-none">
            Configurações de Notificação
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie suas preferências de notificação
          </p>
        </div>

        <div className="flex items-center justify-between space-x-4">
          <Label htmlFor="notification-switch">Ativar Notificações</Label>
          <Switch
            id="notification-switch"
            checked={isNotificationsEnabled}
            onCheckedChange={setIsNotificationsEnabled}
          />
        </div>

        {isNotificationsEnabled && (
          <div className="space-y-3">
            <Label className="block mb-2">Canais de Notificação:</Label>
            <div className="space-y-2">
              {notificationChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/50"
                >
                  <Checkbox
                    id={channel.id}
                    checked={selectedChannels.includes(channel.id)}
                    onCheckedChange={(checked) =>
                      handleChannelChange(channel.id, !!checked)
                    }
                  />
                  <Label
                    htmlFor={channel.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {channel.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={handleSaveNotifications} className="w-full mt-4">
          Salvar Preferências
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover;
