// 모든 페이지를 감싸는 껍데기(레이아웃). 공통 디자인(globals.css)을 여기서 불러온다.
import "./globals.css";

export const metadata = { title: "평생건강가이드북", description: "검진 수치를 입력하면 내 건강을 쉽게 풀어주는 평생건강가이드북" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
