// frontend/app/dashboard/charts/page.tsx
import dynamic from "next/dynamic";

const ChartClientPage = dynamic(() => import("./client-page"), {
  ssr: false,
});

export default function ChartWrapper() {
  return <ChartClientPage />;
}
