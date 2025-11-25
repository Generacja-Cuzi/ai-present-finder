interface ProfileAvatarProps {
  src: string | null;
  alt: string;
}

export function ProfileAvatar({ src, alt }: ProfileAvatarProps) {
  return (
    <img
      src={src ?? "https://via.placeholder.com/150"}
      alt={alt}
      className="ring-primary/20 h-32 w-32 rounded-full object-cover ring-4"
    />
  );
}
