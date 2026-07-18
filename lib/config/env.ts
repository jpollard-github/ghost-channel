export type LocationConfig = {
  label: string;
  latitude: number;
  longitude: number;
  userAgent: string;
};

export function getLocationConfig(
  env: NodeJS.ProcessEnv = process.env,
): LocationConfig | null {
  const latitude = Number(env.GHOST_CHANNEL_LATITUDE);
  const longitude = Number(env.GHOST_CHANNEL_LONGITUDE);
  if (
    !env.GHOST_CHANNEL_LOCATION_LABEL ||
    !env.GHOST_CHANNEL_LATITUDE ||
    !env.GHOST_CHANNEL_LONGITUDE ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  )
    return null;
  return {
    label: env.GHOST_CHANNEL_LOCATION_LABEL,
    latitude,
    longitude,
    userAgent:
      env.GHOST_CHANNEL_NWS_USER_AGENT ||
      "ghost-channel-local (replace-with-contact)",
  };
}
