import { CircleCheck, CircleX } from "lucide-react";
import { Dialog } from "primereact/dialog";
import { Button } from "../button";

interface Props {
  visible: boolean;
  setVisible: (state: boolean) => void;
  type: "Erro" | "Sucesso";
  message?: string;
}

export function Message({ visible, setVisible, type, message }: Props) {
  const errorMessage = "Ocorreu um erro. Tente novamente ou entre em contato com o suporte.";
  const successMessage = "Tudo certo! Ação realizada com sucesso."; 

  return (
    <Dialog
      header=""
      visible={visible}
      style={{ width: "30vw" }}
      onHide={() => {
        if (!visible) return;
        setVisible(false);
      }}
    >
      <div className="flex flex-col items-center justify-center gap-3">
        {type == "Erro" ? <CircleX className="text-red-700" size={100} /> : <CircleCheck className="text-green-700" size={100} />}
        <h1 className="text-3xl font-extrabold">{`${type}!`}</h1>
        <p className="text-center">{message ? message : type == "Erro" ? errorMessage : successMessage}</p>
      </div>

      <div className="flex justify-center items-center gap-2 ">
        <Button.Primary data-type={type} className="data-[type=Erro]:bg-red-700 bg-green-700 w-full flex justify-center items-center font-bold mt-4" onClick={() => setVisible(false)}>
          OK
        </Button.Primary>
      </div>
    </Dialog>
  );
}
