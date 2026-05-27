import CreatorPage from "@/components/artist/page"

export default async function Page( { params }: { params: Promise<{ slug: string }> } ) {
  const { slug } = await params

  return (
    <div><CreatorPage slug={slug} /></div>
  )
}