/**
 * Vietnamese administrative units for the checkout address selects (plan §1.5).
 *
 * There is no shop-owned source for this list, so it comes from the public
 * provinces API. Every call fails soft: when the service is unreachable the
 * checkout form falls back to plain text inputs rather than blocking the order.
 */

const BASE_URL = "https://provinces.open-api.vn/api/v1";

export type AdministrativeUnit = { code: number; name: string };

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, { signal });
  if (!response.ok) throw new Error(`Address lookup failed: ${response.status}`);
  return (await response.json()) as T;
}

export async function getProvinces(signal?: AbortSignal): Promise<AdministrativeUnit[]> {
  const data = await fetchJson<AdministrativeUnit[]>("/p/", signal);
  return data.map(({ code, name }) => ({ code, name }));
}

export async function getDistricts(
  provinceCode: number,
  signal?: AbortSignal
): Promise<AdministrativeUnit[]> {
  const data = await fetchJson<{ districts?: AdministrativeUnit[] }>(
    `/p/${provinceCode}?depth=2`,
    signal
  );
  return (data.districts ?? []).map(({ code, name }) => ({ code, name }));
}

export async function getWards(
  districtCode: number,
  signal?: AbortSignal
): Promise<AdministrativeUnit[]> {
  const data = await fetchJson<{ wards?: AdministrativeUnit[] }>(
    `/d/${districtCode}?depth=2`,
    signal
  );
  return (data.wards ?? []).map(({ code, name }) => ({ code, name }));
}
