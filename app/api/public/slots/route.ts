import { getAvailableSlots } from "@/lib/data/repository";
import { fail, fromError, ok } from "@/app/api/_lib";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const date = params.get("date");
    const serviceId = params.get("serviceId");
    if (!date || !serviceId) return fail("VALIDATION_ERROR", "Wybierz usługę i datę.");

    return ok(
      await getAvailableSlots({
        date,
        serviceId,
        staffId: params.get("staffId") ?? undefined,
      }),
    );
  } catch (err) {
    return fromError(err);
  }
}
