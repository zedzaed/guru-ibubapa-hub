import { redirect } from "next/navigation";
import { getCurrentAccount, portalForRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const account = await getCurrentAccount();
  redirect(account ? portalForRole(account.role) : "/log-masuk");
}
