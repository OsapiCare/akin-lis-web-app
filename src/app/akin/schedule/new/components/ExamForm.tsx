import Primary from "@/components/button/primary";
import { ArrowRight } from "lucide-react";
import { Checkbox } from "primereact/checkbox";

export default function ExameForm() {

    return (
        <div className="min-w-96 bg-slate-200 rounded-lg  p-4 flex flex-col gap-2">
            <h1 className="font-semibold">Marque os exames solicitados</h1>
            <div className="flex flex-col gap-2 text-lg">
                <div className="flex gap-2 items-center">
                    <Checkbox checked onChange={()=>null} inputId="cb1" value="New York" ></Checkbox>
                    <label htmlFor="cb1" className="">Pesquisa de Plasmódio</label>
                </div>
                <div className="flex gap-2 items-center">
                    <Checkbox checked={false} onChange={()=>null} inputId="cb1" value="New York" ></Checkbox>
                    <label htmlFor="cb1" className="">Pesquisa de Plasmódio</label>
                </div>
                <div className="flex gap-2 items-center">
                    <Checkbox checked onChange={()=>null} inputId="cb1" value="New York" ></Checkbox>
                    <label htmlFor="cb1" className="">Pesquisa de Plasmódio</label>
                </div>
                <div className="flex gap-2 items-center">
                    <Checkbox checked={false} onChange={()=>null} inputId="cb1" value="New York" ></Checkbox>
                    <label  htmlFor="cb1" className="">Pesquisa de Plasmódio</label>
                </div>
                <div className="flex gap-2 items-center">
                    <Checkbox checked={false}  onChange={()=>null} inputId="cb1" value="New York" ></Checkbox>
                    <label htmlFor="cb1" className="">Pesquisa de Plasmódio</label>
                </div>
                <div className="flex gap-2 items-center">
                    <Checkbox checked={false}  onChange={()=>null} inputId="cb1" value="New York" ></Checkbox>
                    <label htmlFor="cb1" className="">Pesquisa de Plasmódio</label>
                </div>
                <div className="flex gap-2 items-center">
                    <Checkbox checked onChange={()=>null} inputId="cb1" value="New York" ></Checkbox>
                    <label htmlFor="cb1" className="">Pesquisa de Plasmódio</label>
                </div>
                <div className="flex gap-2 items-center">
                    <Checkbox checked onChange={()=>null} inputId="cb1" value="New York" ></Checkbox>
                    <label htmlFor="cb1" className="">Pesquisa de Plasmódio</label>
                </div>
                <div className="flex gap-2 items-center">
                    <Checkbox checked onChange={()=>null} inputId="cb1" value="New York" ></Checkbox>
                    <label htmlFor="cb1" className="">Pesquisa de Plasmódio</label>
                </div>
                <div className="mt-8 flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="w-10 h-10 ring-1 ring-blue-400 rounded-full flex items-center justify-center">1</div>
                        <div className="h-1 w-10 bg-blue-500"></div>
                        <div className="w-10 h-10 ring-1 ring-blue-400 rounded-full flex items-center justify-center">2</div>
                    </div>
                    <Primary className="flex gap-3">Proximo <ArrowRight/></Primary>
                </div>
            </div>
        </div>
    )
}