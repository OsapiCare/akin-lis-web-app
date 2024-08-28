import { AppLayout } from "@/components/layout";
import OTP from "@/components/otp";
import { View } from "@/components/view";

interface ISetting {}

export default function Setting({}: ISetting) {
  return (
    <View.Vertical className="h-screen ">
      <AppLayout.ContainerHeader label="Configurações" />
      
      {/* <OTP otpLength={8}/> */}
    </View.Vertical>
  );
}
