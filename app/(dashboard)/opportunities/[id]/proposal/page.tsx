import ProposalClient from "./proposal-client";

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProposalClient id={id} />;
}
