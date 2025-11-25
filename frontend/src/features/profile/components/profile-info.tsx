interface ProfileInfoProps {
  givenName: string | null;
  familyName: string | null;
  email: string;
  isAdmin: boolean;
}

export function ProfileInfo({
  givenName,
  familyName,
  email,
  isAdmin,
}: ProfileInfoProps) {
  const displayName =
    givenName !== null && familyName !== null
      ? `${givenName} ${familyName}`
      : "Użytkownik";

  return (
    <div className="mt-4 flex flex-col items-center text-center">
      <p className="text-foreground text-2xl font-semibold">{displayName}</p>

      <p className="text-primary mt-1 text-sm">{email}</p>

      {isAdmin ? (
        <p className="mt-2 font-semibold text-purple-600">Administrator</p>
      ) : null}
    </div>
  );
}
