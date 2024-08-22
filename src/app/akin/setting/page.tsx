import OTP from "../../../components/otp";

interface ISetting {}

export default function Setting({}:ISetting) {
    return (
        <div className="flex flex-col h-screen ">
            <h1>Setting</h1>
            <OTP />
        </div>
    );
}