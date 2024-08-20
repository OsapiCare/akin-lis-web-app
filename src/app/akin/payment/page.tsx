// import { unstable_cache } from "next/cache";

interface IPayment {}

// export const cache = "no-store";

// const getData = unstable_cache(async () => {
//   await new Promise((resolve) => setTimeout(resolve, 2000));
//   console.log("Payment");
//   return new Date().toLocaleString();
// }, ["my-app-user"]);

export default async function Payment({}: IPayment) {
//   const data = await getData();
  console.log("---");
  return (
    <>
      {/* {data} */}
      <h1>Payment</h1>
    </>
  );
}
