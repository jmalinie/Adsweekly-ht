import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DenemePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 p-8 max-w-md">
        <h1 className="text-3xl font-bold">Test Sayfası</h1>
        <p className="text-gray-600">Bu bir test sayfasıdır</p>
        <p className="text-sm text-gray-500">
          Bu sayfa, uygulamanın doğru çalıştığını test etmek için oluşturulmuştur. Eğer bu sayfayı görüyorsanız,
          uygulama düzgün çalışıyor demektir.
        </p>
        <p className="text-sm text-gray-500">
          Statik dosya yönlendirme ve blog post slug'larının doğru işlenmesi için yapılan düzeltmeler başarıyla
          uygulanmıştır.
        </p>
        <Link href="/">
          <Button>Ana Sayfaya Dön</Button>
        </Link>
      </div>
    </div>
  )
}
