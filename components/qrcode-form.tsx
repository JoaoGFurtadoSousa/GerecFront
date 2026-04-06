"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchUnidades, criarQrCodes, type Unidade } from "@/lib/api";
import { Toast } from "./toast";

type StatusType = "0" | "2";

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export function QrcodeForm() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(true);
  const [selectedUnidade, setSelectedUnidade] = useState("");
  const [status, setStatus] = useState<StatusType>("0");
  const [quantidade, setQuantidade] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });
  const [quantidadeError, setQuantidadeError] = useState("");

  useEffect(() => {
    async function loadUnidades() {
      try {
        const data = await fetchUnidades();
        setUnidades(data);
        if (data.length > 0) {
          setSelectedUnidade(data[0].id_garagem);
        }
      } catch (error) {
        console.error("Erro ao carregar unidades:", error);
        setToast({
          show: true,
          message: "Erro ao carregar unidades",
          type: "error",
        });
      } finally {
        setLoadingUnidades(false);
      }
    }
    loadUnidades();
  }, []);

  const handleStatusChange = (newStatus: StatusType) => {
    setStatus(newStatus);
  };

  const handleQuantidadeChange = (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      setQuantidade(1);
      setQuantidadeError("Valor minimo: 1");
    } else if (num > 10) {
      setQuantidade(10);
      setQuantidadeError("Valor maximo: 10");
    } else {
      setQuantidade(num);
      setQuantidadeError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUnidade) {
      setToast({
        show: true,
        message: "Selecione uma unidade",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await criarQrCodes({
        id_garagem: selectedUnidade,
        status: status,
        quantidade: quantidade,
      });

      setToast({
        show: true,
        message: "QR Codes gerados com sucesso",
        type: "success",
      });

      // Reset form
      setQuantidade(1);
    } catch (error) {
      console.error("Erro ao gerar QR Codes:", error);
      setToast({
        show: true,
        message: error instanceof Error ? error.message : "Erro ao gerar QR Codes",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Unidade Select */}
        <div className="space-y-2">
          <label
            htmlFor="unidade"
            className="block text-sm font-medium text-foreground"
          >
            Unidade (id_garagem)
          </label>
          <select
            id="unidade"
            value={selectedUnidade}
            onChange={(e) => setSelectedUnidade(e.target.value)}
            disabled={loadingUnidades}
            className={cn(
              "w-full rounded-lg border border-input bg-secondary px-4 py-3 text-sm text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {loadingUnidades ? (
              <option>Carregando...</option>
            ) : unidades.length === 0 ? (
              <option>Nenhuma unidade encontrada</option>
            ) : (
              unidades.map((unidade) => (
                <option key={unidade.id_garagem} value={unidade.id_garagem}>
                  {unidade.id_garagem}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Status Checkboxes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Status
          </label>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={status === "0"}
                onChange={() => handleStatusChange("0")}
                className={cn(
                  "h-5 w-5 rounded border-2 border-input bg-secondary appearance-none cursor-pointer",
                  "checked:bg-primary checked:border-primary",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card",
                  "relative",
                  "after:content-[''] after:absolute after:hidden after:left-[6px] after:top-[2px] after:w-[5px] after:h-[10px]",
                  "after:border-white after:border-r-2 after:border-b-2 after:rotate-45",
                  "checked:after:block"
                )}
              />
              <span className="text-sm text-foreground">Cadastrado</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={status === "2"}
                onChange={() => handleStatusChange("2")}
                className={cn(
                  "h-5 w-5 rounded border-2 border-input bg-secondary appearance-none cursor-pointer",
                  "checked:bg-primary checked:border-primary",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card",
                  "relative",
                  "after:content-[''] after:absolute after:hidden after:left-[6px] after:top-[2px] after:w-[5px] after:h-[10px]",
                  "after:border-white after:border-r-2 after:border-b-2 after:rotate-45",
                  "checked:after:block"
                )}
              />
              <span className="text-sm text-foreground">Liberado para Sair</span>
            </label>
          </div>
        </div>

        {/* Quantidade Input */}
        <div className="space-y-2">
          <label
            htmlFor="quantidade"
            className="block text-sm font-medium text-foreground"
          >
            Quantidade
          </label>
          <input
            type="number"
            id="quantidade"
            min={1}
            max={10}
            value={quantidade}
            onChange={(e) => handleQuantidadeChange(e.target.value)}
            className={cn(
              "w-full rounded-lg border border-input bg-secondary px-4 py-3 text-sm text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              quantidadeError && "border-destructive focus:ring-destructive"
            )}
          />
          {quantidadeError && (
            <p className="text-xs text-destructive">{quantidadeError}</p>
          )}
          <p className="text-xs text-muted">Minimo: 1, Maximo: 10</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || loadingUnidades}
          className={cn(
            "w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground",
            "transition-colors hover:bg-primary/90",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "flex items-center justify-center gap-2"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            "Gerar QR Codes"
          )}
        </button>
      </form>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </>
  );
}
