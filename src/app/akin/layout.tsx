import { appLayout } from "@/components/layout";
import { MOCK_LOGGED_USER } from "@/mocks/logged-user";

interface IDashboard {
  children: React.ReactNode;
}

export default function Akin({ children }: IDashboard) {
  return (
    <div className="flex h-screen">
      <appLayout.Menu />
      <main className="flex flex-col flex-1 p-4">
        <div className="space-y-8">
          <appLayout.Header avatar={MOCK_LOGGED_USER.avatar} name={MOCK_LOGGED_USER.fullName} email={MOCK_LOGGED_USER.email} />
          {children}
        </div>
      </main>
    </div>
  );
}
