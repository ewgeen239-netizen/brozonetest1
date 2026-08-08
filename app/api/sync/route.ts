import { getSyncLog, usingSheets } from "@/lib/data/repository";
import { requireSession } from "@/lib/booking/session";
import { fromError, ok } from "@/app/api/_lib";

export async function GET() {
  try {
    await requireSession();
    return ok({
      source: usingSheets ? "sheets" : "demo",
      log: await getSyncLog(),
    });
  } catch (err) {
    return fromError(err);
  }
}
