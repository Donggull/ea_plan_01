import MainLayout from '@/components/layout/MainLayout'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}
