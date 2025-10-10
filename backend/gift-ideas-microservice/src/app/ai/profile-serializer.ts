import type { RecipientProfile } from "@core/types";

/**
 * Serializes a RecipientProfile into a structured text format for LLM input
 */
export function serializeRecipientProfile(
  profile: RecipientProfile | null,
): string {
  if (profile == null) {
    return "Brak profilu użytkownika";
  }

  const sections: string[] = [];

  // Personal Info
  const personalInfo: string[] = [];
  if (
    profile.personal_info.relationship != null &&
    profile.personal_info.relationship !== ""
  ) {
    personalInfo.push(`Relacja: ${profile.personal_info.relationship}`);
  }
  if (
    profile.personal_info.occasion != null &&
    profile.personal_info.occasion !== ""
  ) {
    personalInfo.push(`Okazja: ${profile.personal_info.occasion}`);
  }
  if (
    profile.personal_info.age_range != null &&
    profile.personal_info.age_range !== ""
  ) {
    personalInfo.push(`Wiek: ${profile.personal_info.age_range}`);
  }
  if (personalInfo.length > 0) {
    sections.push(`INFORMACJE OSOBISTE:\n${personalInfo.join(", ")}`);
  }

  // Lifestyle
  const lifestyle: string[] = [];
  if (
    profile.lifestyle.primary_hobbies != null &&
    profile.lifestyle.primary_hobbies.length > 0
  ) {
    lifestyle.push(
      `Główne hobby: ${profile.lifestyle.primary_hobbies.join(", ")}`,
    );
  }
  if (
    profile.lifestyle.daily_routine != null &&
    profile.lifestyle.daily_routine !== ""
  ) {
    lifestyle.push(`Codzienna rutyna: ${profile.lifestyle.daily_routine}`);
  }
  if (
    profile.lifestyle.relaxation_methods != null &&
    profile.lifestyle.relaxation_methods.length > 0
  ) {
    lifestyle.push(
      `Metody relaksu: ${profile.lifestyle.relaxation_methods.join(", ")}`,
    );
  }
  if (
    profile.lifestyle.work_style != null &&
    profile.lifestyle.work_style !== ""
  ) {
    lifestyle.push(`Styl pracy: ${profile.lifestyle.work_style}`);
  }
  if (lifestyle.length > 0) {
    sections.push(`STYL ŻYCIA:\n${lifestyle.join(", ")}`);
  }

  // Preferences
  const preferences: string[] = [];
  if (
    profile.preferences.home_aesthetic != null &&
    profile.preferences.home_aesthetic !== ""
  ) {
    preferences.push(`Estetyka domu: ${profile.preferences.home_aesthetic}`);
  }
  if (
    profile.preferences.valued_items != null &&
    profile.preferences.valued_items.length > 0
  ) {
    preferences.push(
      `Cenne przedmioty: ${profile.preferences.valued_items.join(", ")}`,
    );
  }
  if (
    profile.preferences.favorite_beverages != null &&
    profile.preferences.favorite_beverages.length > 0
  ) {
    preferences.push(
      `Ulubione napoje: ${profile.preferences.favorite_beverages.join(", ")}`,
    );
  }
  if (
    profile.preferences.comfort_foods != null &&
    profile.preferences.comfort_foods.length > 0
  ) {
    preferences.push(
      `Jedzenie na pocieszenie: ${profile.preferences.comfort_foods.join(", ")}`,
    );
  }
  if (preferences.length > 0) {
    sections.push(`PREFERENCJE:\n${preferences.join(", ")}`);
  }

  // Media Interests
  const media: string[] = [];
  if (
    profile.media_interests.favorite_books != null &&
    profile.media_interests.favorite_books.length > 0
  ) {
    media.push(
      `Ulubione książki: ${profile.media_interests.favorite_books.join(", ")}`,
    );
  }
  if (
    profile.media_interests.must_watch_shows != null &&
    profile.media_interests.must_watch_shows.length > 0
  ) {
    media.push(
      `Must-watch seriale: ${profile.media_interests.must_watch_shows.join(", ")}`,
    );
  }
  if (
    profile.media_interests.podcasts != null &&
    profile.media_interests.podcasts.length > 0
  ) {
    media.push(`Podcasty: ${profile.media_interests.podcasts.join(", ")}`);
  }
  if (
    profile.media_interests.music_preferences != null &&
    profile.media_interests.music_preferences.length > 0
  ) {
    media.push(
      `Preferencje muzyczne: ${profile.media_interests.music_preferences.join(", ")}`,
    );
  }
  if (media.length > 0) {
    sections.push(`INTERESY MEDIALNE:\n${media.join(", ")}`);
  }

  // Recent Life
  const recentLife: string[] = [];
  if (
    profile.recent_life.new_experiences != null &&
    profile.recent_life.new_experiences.length > 0
  ) {
    recentLife.push(
      `Nowe doświadczenia: ${profile.recent_life.new_experiences.join(", ")}`,
    );
  }
  if (
    profile.recent_life.mentioned_needs != null &&
    profile.recent_life.mentioned_needs.length > 0
  ) {
    recentLife.push(
      `Wspomniane potrzeby: ${profile.recent_life.mentioned_needs.join(", ")}`,
    );
  }
  if (
    profile.recent_life.recent_achievements != null &&
    profile.recent_life.recent_achievements.length > 0
  ) {
    recentLife.push(
      `Ostatnie osiągnięcia: ${profile.recent_life.recent_achievements.join(", ")}`,
    );
  }
  if (recentLife.length > 0) {
    sections.push(`OSTATNIE ŻYCIE:\n${recentLife.join(", ")}`);
  }

  // Gift Context
  const giftContext: string[] = [];
  if (
    profile.gift_context.occasion_significance != null &&
    profile.gift_context.occasion_significance !== ""
  ) {
    giftContext.push(
      `Znaczenie okazji: ${profile.gift_context.occasion_significance}`,
    );
  }
  if (
    profile.gift_context.gift_message != null &&
    profile.gift_context.gift_message !== ""
  ) {
    giftContext.push(`Przekaz prezentu: ${profile.gift_context.gift_message}`);
  }
  if (
    profile.gift_context.previous_gift_successes != null &&
    profile.gift_context.previous_gift_successes.length > 0
  ) {
    giftContext.push(
      `Poprzednie udane prezenty: ${profile.gift_context.previous_gift_successes.join(", ")}`,
    );
  }
  if (giftContext.length > 0) {
    sections.push(`KONTEKST PREZENTU:\n${giftContext.join(", ")}`);
  }

  return sections.length > 0
    ? sections.join("\n\n")
    : "Profil użytkownika jest pusty";
}
