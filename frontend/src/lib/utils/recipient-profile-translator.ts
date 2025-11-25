// Mapowanie wartości gender
const GENDER_LABELS: Record<string, string> = {
  male: "mężczyzna",
  female: "kobieta",
  other: "inna",
  "non-binary": "niebinarna",
  "prefer not to say": "wolę nie podawać",
};

// Mapowanie wartości relationship
const RELATIONSHIP_LABELS: Record<string, string> = {
  parent: "rodzic",
  child: "dziecko",
  spouse: "małżonek/małżonka",
  partner: "partner/partnerka",
  sibling: "rodzeństwo",
  friend: "przyjaciel/przyjaciółka",
  colleague: "kolega/koleżanka z pracy",
  acquaintance: "znajomy/znajoma",
  relative: "krewny/krewna",
  grandparent: "dziadek/babcia",
  grandchild: "wnuk/wnuczka",
  aunt: "ciocia",
  uncle: "wujek",
  cousin: "kuzyn/kuzynka",
  "mother-in-law": "teściowa",
  "father-in-law": "teść",
  teacher: "nauczyciel/nauczycielka",
  student: "uczeń/uczennica",
  boss: "szef/szefowa",
  employee: "pracownik/pracownica",
};

// Funkcja do formatowania wartości z obiektu personalInfoDescription
function formatPersonalInfo(info: Record<string, unknown>): string {
  const parts: string[] = [];

  if (info.ageRange !== null && info.ageRange !== undefined) {
    const ageRangeValue =
      typeof info.ageRange === "string"
        ? info.ageRange
        : JSON.stringify(info.ageRange);
    parts.push(`Wiek: ${ageRangeValue}`);
  }
  if (info.gender !== null && info.gender !== undefined) {
    const genderString =
      typeof info.gender === "string"
        ? info.gender
        : JSON.stringify(info.gender);
    const genderValue = genderString.toLowerCase();
    const translatedGender = GENDER_LABELS[genderValue] ?? genderValue;
    parts.push(`Płeć: ${translatedGender}`);
  }
  if (info.relationship !== null && info.relationship !== undefined) {
    const relationshipString =
      typeof info.relationship === "string"
        ? info.relationship
        : JSON.stringify(info.relationship);
    const relationshipValue = relationshipString.toLowerCase();
    const translatedRelationship =
      RELATIONSHIP_LABELS[relationshipValue] ?? relationshipValue;
    parts.push(`Relacja: ${translatedRelationship}`);
  }
  if (info.occasion !== null && info.occasion !== undefined) {
    const occasionValue =
      typeof info.occasion === "string"
        ? info.occasion
        : JSON.stringify(info.occasion);
    parts.push(`Z okazji: ${occasionValue}`);
  }

  return parts.join(", ");
}

// Funkcja do formatowania possessions
function formatPossessions(possessions: Record<string, unknown>): string {
  const parts: string[] = [];

  if (
    Array.isArray(possessions.what_already_has) &&
    possessions.what_already_has.length > 0
  ) {
    parts.push(`Posiada: ${possessions.what_already_has.join(", ")}`);
  }
  if (
    Array.isArray(possessions.what_is_missing) &&
    possessions.what_is_missing.length > 0
  ) {
    parts.push(`Brakuje: ${possessions.what_is_missing.join(", ")}`);
  }

  return parts.join(". ");
}

interface RecipientProfileSection {
  label: string;
  value: string;
}

// Funkcja do formatowania całego profilu - zwraca sekcje jako osobne kafelki
export function formatRecipientProfile(
  profile: Record<string, unknown>,
): RecipientProfileSection[] {
  const sections: RecipientProfileSection[] = [];

  // Informacje osobiste (jeśli istnieją)
  if (
    profile.personalInfoDescription !== null &&
    profile.personalInfoDescription !== undefined &&
    typeof profile.personalInfoDescription === "object"
  ) {
    const personalInfo = formatPersonalInfo(
      profile.personalInfoDescription as Record<string, unknown>,
    );
    if (personalInfo.length > 0) {
      sections.push({
        label: "Informacje osobiste",
        value: personalInfo,
      });
    }
  }

  // Styl życia
  if (
    profile.lifestyleDescription !== null &&
    profile.lifestyleDescription !== undefined &&
    typeof profile.lifestyleDescription === "string"
  ) {
    sections.push({
      label: "Styl życia",
      value: profile.lifestyleDescription,
    });
  }

  // Preferencje
  if (
    profile.preferencesDescription !== null &&
    profile.preferencesDescription !== undefined &&
    typeof profile.preferencesDescription === "string"
  ) {
    sections.push({
      label: "Preferencje",
      value: profile.preferencesDescription,
    });
  }

  // Ostatnie wydarzenia
  if (
    profile.recentLifeDescription !== null &&
    profile.recentLifeDescription !== undefined &&
    typeof profile.recentLifeDescription === "string"
  ) {
    sections.push({
      label: "Ostatnie wydarzenia",
      value: profile.recentLifeDescription,
    });
  }

  // Posiadane rzeczy
  if (
    profile.possessions !== null &&
    profile.possessions !== undefined &&
    typeof profile.possessions === "object"
  ) {
    const possessionsText = formatPossessions(
      profile.possessions as Record<string, unknown>,
    );
    if (possessionsText.length > 0) {
      sections.push({
        label: "Posiadanie",
        value: possessionsText,
      });
    }
  }

  return sections;
}
