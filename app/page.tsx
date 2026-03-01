'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            Choose Mode of Scan
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Button
            className="w-full bg-sky-800 hover:bg-sky-900 text-white"
            onClick={() => router.push('/mobile-scan')}
          >
            Mobile Scan
          </Button>

          <Button
            variant="secondary"
            onClick={() => router.push('/zebra-scan')}
            className="w-full bg-sky-800 hover:bg-sky-900 text-white"
          >
            Zebra Scan
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}