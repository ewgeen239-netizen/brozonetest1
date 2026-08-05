import type { Barber, Service, ServiceVariant } from "./types";

/* --------------------------------------------------------------------------
   Booksy labels its price tiers with barber names ("MAX & OLGA", "Illia"),
   sometimes misspelled or paired. Resolve a variant for a given barber by
   matching their first name inside the label.
-------------------------------------------------------------------------- */

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/ł/g, "l")
    .replace(/[^a-z]/g, "");

/**
 * Aliases for names Booksy spells inconsistently ("Ilia" / "Illia").
 * Note: "OLA" in the "OLA & WALERA" tier is not Olga — she is priced in
 * "MAX & OLGA" — so Olga deliberately has no "ola" alias.
 */
const ALIASES: Record<string, string[]> = {
  ilia: ["ilia", "illia"],
  olga: ["olga"],
  walera: ["walera", "valera"],
  max: ["max", "maks"],
};

function matchesBarber(label: string, barber: Barber) {
  const first = normalise(barber.name.split(" ")[0]);
  const needles = ALIASES[first] ?? [first];
  const hay = normalise(label);
  return needles.some((n) => hay.includes(n));
}

/** the variant this barber performs, or undefined when tiers are not per-barber */
export function variantForBarber(
  service: Service,
  barber: Barber,
): ServiceVariant | undefined {
  if (!service.variants?.length) return undefined;
  return service.variants.find((v) => matchesBarber(v.label, barber));
}

/** price/duration a given barber charges — falls back to the entry-level tier */
export function priceForBarber(service: Service, barber: Barber) {
  const variant = variantForBarber(service, barber);
  return {
    price: variant?.price ?? service.price,
    durationMin: variant?.durationMin ?? service.durationMin,
    label: variant?.label,
    exact: Boolean(variant),
  };
}

/** services a barber offers, most booked first */
export function servicesForBarber(services: Service[], barber: Barber) {
  return services
    .filter((s) => s.active && barber.serviceIds.includes(s.id))
    .sort((a, b) => b.popularity - a.popularity);
}
