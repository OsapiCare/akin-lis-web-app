"use client";
interface ITeste {}

export default function Teste({}: ITeste) {
  async function onSubmitFn(data: FormData) {
    const checkboxes = document.querySelectorAll('input[name="xxx"]:checked');
    const selectedValues = Array.from(checkboxes).map((checkbox) => (checkbox as HTMLInputElement).value);
    // const selectedValues = Array.from(checkboxes).map((checkbox) => checkbox.value);
    console.log("🚀 ~ onSubmitFn ~ selectedValues:", selectedValues);

  }

  return (
    <div className="h-screen bg-blue-400">
      <form action={onSubmitFn} className="  ">
        <input type="text" name="dd"  />


<label htmlFor="">OPC - 1<input type="checkbox" name="xxx" value="A"/></label>
<label htmlFor="">OPC - 2<input type="checkbox" name="xxx" value="B" /></label>
<label htmlFor="">OPC - 3<input type="checkbox" name="xxx" value="C"/></label>

{/* 
        <label>
      <input type="checkbox" name="opcao" value="opcao1"> Opção 1
    </label><br>
   */}

       <button type="submit">Send</button>
      </form>
    </div>
  );
}
