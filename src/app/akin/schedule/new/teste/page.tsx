"use client";
interface ITeste {}

export default function Teste({}: ITeste) {
  async function onSubmitFn(data: FormData) {
    console.log("Form data", data.get("dd"));
  }

  return (
    <div className="h-screen bg-blue-400">
      <form action={onSubmitFn} className="  ">
        <input type="text" name="dd"  />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
