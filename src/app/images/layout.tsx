import MainLayout from '@/components/layout/MainLayout'

export default function ImagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}
