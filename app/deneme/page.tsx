import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function DenemePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Test Sayfası</CardTitle>
          <CardDescription>Bu bir test sayfasıdır</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Bu sayfa, uygulamanın doğru çalıştığını test etmek için oluşturulmuştur. Eğer bu sayfayı görüyorsanız,
            uygulama düzgün çalışıyor demektir.
          </p>
          <p>
            Statik dosya yönlendirme ve blog post slug'larının doğru işlenmesi için yapılan düzeltmeler başarıyla
            uygulanmıştır.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/" passHref>
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
