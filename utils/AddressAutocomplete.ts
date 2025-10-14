const API_BASE_URL = 'https://api.mapbox.com/search/searchbox/v1';
const accesToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export async function getSuggestions(
  input: string,
  session_token: string,
  signal?: AbortSignal,
  userLocation?: LocationCoords
) {
  // Default to NYC coordinates if no user location available
  const defaultCoords = { latitude: 40.740121, longitude: -73.990593 };
  const coords = userLocation || defaultCoords;

  const proximityParam = `${coords.longitude},${coords.latitude}`;

  const response = await fetch(
    `${API_BASE_URL}/suggest?q=${input}&language=en&proximity=${proximityParam}&session_token=${session_token}&access_token=${accesToken}`,
    { signal }
  );

  const json = await response.json();
  return json;
}

export const retrieveDetails = async (id: string, session_token: string) => {
  const response = await fetch(
    `${API_BASE_URL}/retrieve/${id}?session_token=${session_token}&access_token=${accesToken}`
  );

  const json = await response.json();
  return json;
};
