import MainLayout from '@/components/layout/MainLayout'

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}
