// import { unstable_cache } from "next/cache";

import { AppLayout } from "@/components/layout";
import { View } from "@/components/view";

interface IPayment {}

// export const cache = "no-store";

const getData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log("Payment");
  return new Date().toLocaleString();
};

export default async function Payment({}: IPayment) {
  const data = await getData();
  return (
    <View.Vertical className="h-screen ">
      <AppLayout.ContainerHeader label="Pagamentos" />
      <p>{data}</p>
    </View.Vertical>
  );
}
