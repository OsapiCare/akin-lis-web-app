"use client";
import { Button } from "@/components/button/index";
import { LucideServerOff, Server, ServerOff } from "lucide-react";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-akin-turquoise/30 text-akin-white-smoke">
      <div className="border shadow-md container m-auto rounded-lg overflow-hidden *:p-4 bg-akin-turquoise/50">
        <div className="font-bold text-3xl bg-akin-turquoise">
          <h2>{error.name} - Alguma coisa correu mal!</h2>
        </div>
        <h1 className="font-bold text-5xl">Ups💔</h1>
        <div className="space-y-4">
          <p>Mensagem: {error.message}</p>
          <hr />
          <p>{error.stack}</p>
          <hr />
          <Button.Primary
            onClick={
              () => reset()
            }
            label="Tentar Novamente"
          />
        </div>
      </div>
    </div>
  );
}
