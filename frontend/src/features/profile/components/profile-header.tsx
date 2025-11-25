import { PageHeader } from "@/components/ui/page-header";

interface ProfileHeaderProps {
  title: string;
}

export function ProfileHeader({ title }: ProfileHeaderProps) {
  return <PageHeader title={title} />;
}
