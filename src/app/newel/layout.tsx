import MainLayout from '@/components/layout/MainLayout'

export default function NewelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}
