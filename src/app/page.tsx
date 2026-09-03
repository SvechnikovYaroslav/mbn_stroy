import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-start justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">MBN Строй</h1>
      <p className="text-muted-foreground">Ремонт квартир и домов в Туле</p>
      <p>Project foundation is ready.</p>
      <Button type="button">Смотреть проекты</Button>
    </main>
  );
}
