import type { RecipientProfile } from "@core/types";

/**
 * Serializes a RecipientProfile into a structured text format for LLM input
 */
export function serializeRecipientProfile(
  profile: RecipientProfile | null,
): string {
  if (profile === null) {
    return "Brak profilu użytkownika";
  }

  const sections: string[] = [];

  // Personal Info
  const personalInfo: string[] = [];
  const relationship = profile.personalInfoDescription.relationship;
  if (relationship != null && relationship !== "") {
    personalInfo.push(`Relacja: ${relationship}`);
  }
  const occasion = profile.personalInfoDescription.occasion;
  if (occasion != null && occasion !== "") {
    personalInfo.push(`Okazja: ${occasion}`);
  }
  const ageRange = profile.personalInfoDescription.ageRange;
  if (ageRange != null && ageRange !== "") {
    personalInfo.push(`Wiek: ${ageRange}`);
  }
  if (personalInfo.length > 0) {
    sections.push(`INFORMACJE OSOBISTE:\n${personalInfo.join(", ")}`);
  }

  // Lifestyle
  if (
    profile.lifestyleDescription != null &&
    profile.lifestyleDescription !== ""
  ) {
    sections.push(`STYL ŻYCIA:\n${profile.lifestyleDescription}`);
  }

  // Preferences
  if (
    profile.preferencesDescription != null &&
    profile.preferencesDescription !== ""
  ) {
    sections.push(`PREFERENCJE:\n${profile.preferencesDescription}`);
  }

  // Recent Life
  if (
    profile.recentLifeDescription != null &&
    profile.recentLifeDescription !== ""
  ) {
    sections.push(`OSTATNIE ŻYCIE:\n${profile.recentLifeDescription}`);
  }

  // Possessions
  const possessions: string[] = [];
  if (profile.possessions.what_already_has.length > 0) {
    possessions.push(
      `Już posiada: ${profile.possessions.what_already_has.join(", ")}`,
    );
  }
  if (profile.possessions.what_is_missing.length > 0) {
    possessions.push(
      `Potrzebuje/brakuje: ${profile.possessions.what_is_missing.join(", ")}`,
    );
  }
  if (possessions.length > 0) {
    sections.push(`POSIADANIE:\n${possessions.join(", ")}`);
  }

  return sections.length > 0
    ? sections.join("\n\n")
    : "Profil użytkownika jest pusty";
}
