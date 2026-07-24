import PostDetailModal from "../../../_components/PostDetailModal";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostDetailModal postId={id} />;
}
