import { Music, X } from "lucide-react";

import { InstagramIcon } from "@/components/icons/instagram-icon";
import { Input } from "@/components/ui/input";

const platformIcons = {
  instagram: InstagramIcon,
  x: X,
  tiktok: Music,
};

const platformLabels = {
  instagram: "Instagram URL",
  x: "X (formerly Twitter) URL",
  tiktok: "TikTok URL",
};

export function SocialMediaInput({
  platform,
  value,
  onChange,
  placeholder,
}: {
  platform: "instagram" | "x" | "tiktok";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const Icon = platformIcons[platform];

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon className="size-5" />
      </div>
      <Input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        className="focus-visible:border-primary focus-visible:ring-primary/20 h-14 rounded-2xl border-2 border-gray-200 pl-12 text-base placeholder:text-gray-400"
        aria-label={platformLabels[platform]}
      />
    </div>
  );
}
