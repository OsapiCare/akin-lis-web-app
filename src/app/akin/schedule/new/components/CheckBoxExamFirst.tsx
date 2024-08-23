import React  from "react"
import CheckBoxExam from "./CheckBoxExam";
export default function CheckBoxExamFirst() {
    return (
        <div className="flex flex-col gap-2">
            <h1 className="font-semibold">Marque os exames solicitados</h1>
            <div className="flex flex-col gap-2 text-lg">
                <CheckBoxExam checked={false} description="estomagologia" value="1" onChangecheck={() =>  alert("")}/>
                <CheckBoxExam checked={false} description="estomagologia" value="2" onChangecheck={() =>  alert("")}/>
                <CheckBoxExam checked={true}  description="estomagologia" value="3"  onChangecheck={() =>  alert("")}/>
                <CheckBoxExam checked={true}  description="estomagologia" value="4"  onChangecheck={() =>  alert("")}/>
                <CheckBoxExam checked={false} description="estomagologia" value="5" onChangecheck={() =>  alert("")}/>
                <CheckBoxExam checked={true}  description="estomagologia" value="7"  onChangecheck={() =>  alert("")}/>
                <CheckBoxExam checked={false} description="estomagologia" value="6" onChangecheck={() =>  alert("")}/>
                <CheckBoxExam checked={false} description="estomagologia" value="8" onChangecheck={() =>  alert("")}/>
            </div>
        </div>
        
    )
}