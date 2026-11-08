// Timezone choices for the Profile page, and the browser's own timezone for
// new accounts (so nobody outside US Eastern opens Today on the wrong day).

/** The common choices, always listed first. */
export const COMMON_TIMEZONES: { value: string; label: string }[] = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)" },
];

/** True for a name the browser's Intl knows, e.g. "America/Indiana/Indianapolis". */
export function isValidTimezone(tz: string | null | undefined): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** The browser's timezone, or null if it can't tell. */
export function browserTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidTimezone(tz) ? tz : null;
  } catch {
    return null;
  }
}

/** "America/Indiana/Indianapolis" → "Indianapolis (America/Indiana)". */
export function timezoneLabel(tz: string): string {
  const common = COMMON_TIMEZONES.find((t) => t.value === tz);
  if (common) return common.label;
  const parts = tz.split("/");
  const city = parts[parts.length - 1].replace(/_/g, " ");
  return parts.length > 1 ? `${city} (${parts.slice(0, -1).join("/").replace(/_/g, " ")})` : city;
}

/**
 * The options to show: the common ones, plus the one already saved and the
 * browser's own if either isn't among them (otherwise the select would show
 * blank for, say, America/Indiana/Indianapolis).
 */
export function timezoneOptions(current: string | null | undefined): { value: string; label: string }[] {
  const options = [...COMMON_TIMEZONES];
  const extra = [current, browserTimezone()].filter(
    (tz): tz is string => isValidTimezone(tz) && !options.some((o) => o.value === tz)
  );
  for (const tz of new Set(extra)) {
    options.unshift({ value: tz, label: `${timezoneLabel(tz)}${tz === browserTimezone() ? " (this device)" : ""}` });
  }
  return options;
}
