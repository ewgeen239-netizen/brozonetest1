import { getServices } from "@/lib/data/repository";
import { fromError, ok } from "@/app/api/_lib";

export async function GET(request: Request) {
  try {
    const category = new URL(request.url).searchParams.get("category") ?? undefined;
    const services = await getServices(category);
    return ok(services.filter((s) => s.active));
  } catch (err) {
    return fromError(err);
  }
}
