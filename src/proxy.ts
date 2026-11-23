import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const OPS_HOST = "ops.joinpathcross.com";
const MAIN_HOSTS = ["joinpathcross.com", "www.joinpathcross.com"];

// The ops dashboard lives at ops.joinpathcross.com. The page itself is still the /ops route.
export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;

  // ops.joinpathcross.com/ shows the dashboard.
  if (host === OPS_HOST && pathname === "/") {
    return NextResponse.rewrite(new URL("/ops", request.url));
  }

  // Old address: send joinpathcross.com/ops to the new one (production hosts only, so previews and localhost keep working).
  if (MAIN_HOSTS.includes(host) && pathname === "/ops") {
    return NextResponse.redirect(`https://${OPS_HOST}/`, 308);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/", "/ops"] };
