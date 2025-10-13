import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
  component: ProfileView,
});

function ProfileView() {
  return (
    <div className="bg-surface flex min-h-screen flex-col items-center justify-center pb-20">
      <div className="text-center">
        <h1 className="text-foreground mb-4 text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Your profile settings will appear here
        </p>
      </div>
    </div>
  );
}
