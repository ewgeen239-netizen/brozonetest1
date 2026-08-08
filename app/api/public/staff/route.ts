import { getStaff } from "@/lib/data/repository";
import { fromError, ok } from "@/app/api/_lib";

export async function GET(request: Request) {
  try {
    const category = new URL(request.url).searchParams.get("category") ?? undefined;
    const staff = await getStaff(category);
    // strona publiczna nie dostaje telefonów, prowizji ani osób ukrytych
    return ok(
      staff
        .filter((s) => s.active && s.showOnWebsite)
        .map(({ phone: _phone, email: _email, ...rest }) => rest),
    );
  } catch (err) {
    return fromError(err);
  }
}
