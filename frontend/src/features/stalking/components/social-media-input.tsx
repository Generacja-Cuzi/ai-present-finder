import { Music, X } from "lucide-react";

import { Input } from "@/components/ui/input";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

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
        className="h-14 rounded-2xl border-2 border-gray-200 pl-12 text-base placeholder:text-gray-400 focus-visible:border-[#E89B3C] focus-visible:ring-[#E89B3C]/20"
        aria-label={platformLabels[platform]}
      />
    </div>
  );
}
