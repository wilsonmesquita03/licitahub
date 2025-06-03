import { ResetPasswordForm } from "@/components/reset-password-form";
import { notFound } from "next/navigation";
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const token = (await searchParams).token;

  if (!token || typeof token !== "string") {
    return notFound();
  }

  return <ResetPasswordForm token={token} />;
}
