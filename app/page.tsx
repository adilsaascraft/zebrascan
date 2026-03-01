'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 to-gray-100">
      
      {/* ---------------- BANNER ---------------- */}
      <div className="relative w-full overflow-hidden">
        <Image
          src="https://res.cloudinary.com/dymanaa1j/image/upload/v1772339421/ChatGPT_Image_Mar_1_2026_09_57_48_AM_1_nqjcvh.png"
          alt="Wedding Banner"
          width={1536}
          height={380}
          priority
          sizes="100vw"
          className="w-full h-auto object-cover"
        />
        <div className="absolute inset-0 bg-orange-900/30" />
      </div>

      {/* ---------------- CONTENT SECTION ---------------- */}
      <div className="flex justify-center px-4 py-10 flex-1">
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
              className="w-full bg-sky-800 hover:bg-sky-900 text-white"
              onClick={() => router.push('/zebra-scan')}
            >
              Zebra Scan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="mt-auto border-t bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} All Rights Reserved. Powered by SaaScraft Studio (India) Pvt. Ltd.
        </div>
      </footer>

    </div>
  )
}