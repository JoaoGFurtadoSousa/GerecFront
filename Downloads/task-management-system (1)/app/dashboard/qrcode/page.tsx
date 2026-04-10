import { QrCode } from "lucide-react";
import { QrcodeForm } from "@/components/qrcode-form";

export default function QrcodePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">Gerar QRCodes</h1>
        <p className="mt-2 text-muted">
          Preencha o formulario abaixo para gerar novos QR Codes
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <QrCode className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <QrcodeForm />
      </div>
    </div>
  );
}
