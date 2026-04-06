const API_BASE_URL = "http://192.168.15.20:8000/api/v1";

export interface Unidade {
  id_garagem: string;
  [key: string]: unknown;
}

export interface QrCodePayload {
  id_garagem: string;
  status: "0" | "2";
  quantidade: number;
}

export async function fetchUnidades(): Promise<Unidade[]> {
  const response = await fetch(`${API_BASE_URL}/unidades/`);
  if (!response.ok) {
    throw new Error("Falha ao carregar unidades");
  }
  return response.json();
}

export async function criarQrCodes(payload: QrCodePayload): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/qrcode/criar_qrcode/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Falha ao gerar QR Codes");
  }

  return response.json();
}
