import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
  component: ProfileView,
});

function ProfileView() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#E8DED3] pb-20">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Your profile settings will appear here</p>
      </div>
    </div>
  );
}
