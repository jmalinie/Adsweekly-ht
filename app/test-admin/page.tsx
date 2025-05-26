export default function TestAdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Admin Sayfası</h1>
      <p>Bu sayfa erişilebilir mi kontrol etmek için oluşturulmuştur.</p>
      <div className="mt-4">
        <a href="/admin" className="text-blue-600 hover:underline">
          Admin Sayfasına Git
        </a>
      </div>
    </div>
  )
}
