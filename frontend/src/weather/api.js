export async function fetchRouteWeather(source, dest) {
  const res = await fetch('/api/weather/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, destination: dest }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Server error (${res.status})`);
  }

  return res.json();
}
