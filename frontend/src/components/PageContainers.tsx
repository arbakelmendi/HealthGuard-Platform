import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
};

export function PageContainer({ children }: PageContainerProps) {
  return <div className="mx-auto w-full max-w-[1240px] space-y-6">{children}</div>;
}

export function UserPageContainer({ children }: PageContainerProps) {
  return <PageContainer>{children}</PageContainer>;
}

export function AdminPageContainer({ children }: PageContainerProps) {
  return <PageContainer>{children}</PageContainer>;
}
