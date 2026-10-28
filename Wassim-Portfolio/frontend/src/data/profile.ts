import type { Profile } from "@/lib/types";
import raw from "./profile.json";

export const profile = raw as Profile;

export function getProfile(): Profile {
  return profile;
}
