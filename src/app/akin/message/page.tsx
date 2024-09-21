import { Input } from "@/components/input";
import { AppLayout } from "@/components/layout";
import { View } from "@/components/view";
import { Search, SquarePen, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import { MOCK_MESSAGES } from "@/mocks/message";
import Avatar from "@/components/avatar";

interface IMessage {}

async function getMessages() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return MOCK_MESSAGES;
}

export default async function Message({}: IMessage) {
  const messages = await getMessages();
  return (
    <View.Vertical className=" h-screen ">
      <AppLayout.ContainerHeader label="Mensagens" />

      <div className="flex justify-between px-4 items-center">
        <Button.Primary icon={<SquarePen className="mr-1" />} className="h-fit">
          Escrever
        </Button.Primary>
        <Input.InputFieldIcon icon={Search} placeholder="Pesquisar Mensagem" />
      </div>

      <div className="flex h-full">
        <div className="flex flex-col h-fit bg-yellow-300">
          <View.Scroll className="mx-0.5 mt-4">
            {messages.map((message) => (
              <MessageCard key={message.id} avatar={message.avatar} name={message.name} wasSent="5s atrás" message={message.message} />
            ))}
          </View.Scroll>
        </div>

        <div className="bg-blue-300">Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate, in? Quae omnis exercitationem eaque nulla iste saepe quibusdam dolorum vitae, odit nemo accusamus corrupti earum aperiam, accusantium animi, dicta molestias!</div>
      </div>
    </View.Vertical>
  );
}

/**
 * 
 * @param param0 
 * 
 * @returns 
 * 
 * 
 *    

 */
function MessageCard({ message, name, wasSent, avatar }: { avatar: string; message: string; wasSent: string; name: string }) {
  return (
    <div className=" flex px-2 justify-between gap-x-2 has-[:hover]:bg-akin-turquoise/10 rounded-lg trasition ease-out">
      <div className="flex flex-1 gap-x-2 items-center cursor-pointer ">
        <Avatar userName={name} image={avatar} size="large" />
        <div className="">
          <p className="font-bold text-akin-turquoise/80 text-md">{name}</p>
          <span>{message.substring(0, 15).concat("...")}</span>
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
