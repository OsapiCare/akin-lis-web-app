import { Input } from "@/components/input";
import { AppLayout } from "@/components/layout";
import { View } from "@/components/view";
import { Search, SquarePen, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import { MOCK_MESSAGES } from "@/mocks/message";
import Avatar from "@/components/avatar";

interface IMessage {}

export default function Message({}: IMessage) {
  return (
    <View.Vertical className=" h-screen ">
      <AppLayout.ContainerHeader label="Mensagens" />

      <div className="flex justify-between px-4 items-center">
        <Button.Primary icon={<SquarePen className="mr-1" />} className="h-fit">
          Escrever
        </Button.Primary>
        <Input.InputFieldIcon icon={Search} placeholder="Pesquisar Mensagem" />
      </div>

      <View.Scroll className="mx-0.5 mt-4">
        {MOCK_MESSAGES.map((message) => (
          <MessageCard key={message.id} avatar={message.avatar} name={message.name} wasSent="5s atrás" message={message.message} />
        ))}
      </View.Scroll>
    </View.Vertical>
  );
}

function MessageCard({ message, name, wasSent, avatar }: { avatar: string; message: string; wasSent: string; name: string }) {
  
  return (
    <div className=" flex py-1 px-4 justify-between has-[:hover]:bg-akin-turquoise/10 rounded-lg trasition ease-out">
      <div className="flex flex-1 gap-x-2 items-center cursor-pointer ">
        <Avatar userName={name} image={avatar} />
        <div className="">
          <p className="font-bold text-akin-turquoise/80 text-md">{name}</p>
          <span>{message.substring(0, 90).concat("...")}</span>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center w-[10%] ">
        <div className="flex gap-x-1 *:transition *:ease-in-out">
          <Trash2 size={20} className="cursor-pointer hover:fill-red-300 hover:text-red-500" />
          <Star size={20} className="cursor-pointer hover:fill-yellow-300 hover:text-yellow-500" />
        </div>
        <p className="text-center text-gray-400 italic text-sm">{wasSent}</p>
      </div>
    </div>
  );
}
