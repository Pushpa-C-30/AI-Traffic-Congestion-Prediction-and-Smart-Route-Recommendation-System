import json
from functools import lru_cache
from threading import Lock
from time import monotonic, sleep
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class RouteLookupError(Exception):
    pass


_geocode_lock = Lock()
_last_geocode_at = 0.0


def _get_json(url: str, *, user_agent: bool = False):
    headers = {"User-Agent": "TRAFFIQ-local-demo/1.0 (Karnataka route lookup)"} if user_agent else {}
    request = Request(url, headers=headers)
    try:
        with urlopen(request, timeout=12) as response:
            return json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RouteLookupError("OpenStreetMap routing is temporarily unavailable. Try again shortly.") from exc


@lru_cache(maxsize=256)
def _geocode_karnataka(place: str) -> tuple[float, float, str]:
    global _last_geocode_at
    query = urlencode({
        "format": "jsonv2",
        "q": f"{place}, Karnataka, India",
        "countrycodes": "in",
        "addressdetails": 1,
        "limit": 1,
    })
    with _geocode_lock:
        wait = 1.0 - (monotonic() - _last_geocode_at)
        if wait > 0:
            sleep(wait)
        results = _get_json(f"https://nominatim.openstreetmap.org/search?{query}", user_agent=True)
        _last_geocode_at = monotonic()
    if not results:
        raise RouteLookupError(f"Could not find '{place}' in Karnataka. Check the place name and try again.")

    result = results[0]
    address = result.get("address", {})
    state = address.get("state", "")
    state_code = address.get("ISO3166-2-lvl4", "")
    if state.casefold() not in {"karnataka", "ಕರ್ನಾಟಕ"} and state_code != "IN-KA":
        raise RouteLookupError(f"'{place}' could not be verified as a Karnataka location.")

    return float(result["lon"]), float(result["lat"]), result.get("display_name", place)


def get_route_alternatives(origin: str, destination: str) -> dict:
    start_lon, start_lat, origin_label = _geocode_karnataka(origin.strip())
    end_lon, end_lat, destination_label = _geocode_karnataka(destination.strip())
    coordinates = f"{start_lon},{start_lat};{end_lon},{end_lat}"
    query = urlencode({"alternatives": 3, "overview": "false", "steps": "false"})
    response = _get_json(f"https://router.project-osrm.org/route/v1/driving/{coordinates}?{query}")
    if response.get("code") != "Ok" or not response.get("routes"):
        raise RouteLookupError("No drivable road route was found between those places.")

    options = []
    for index, route in enumerate(sorted(response["routes"], key=lambda option: option["duration"])[:3]):
        options.append({
            "name": f"Route {chr(65 + index)}",
            "distance_km": round(route["distance"] / 1000, 1),
            "duration_minutes": max(1, round(route["duration"] / 60)),
            "traffic_percent": None,
            "traffic_label": "Live traffic unavailable",
            "source": "OpenStreetMap road network via OSRM",
        })

    return {
        "origin": origin_label,
        "destination": destination_label,
        "routes": options,
        "traffic_source": None,
    }