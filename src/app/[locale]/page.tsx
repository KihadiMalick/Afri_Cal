import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LocaleHome({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/dashboard`);
}
