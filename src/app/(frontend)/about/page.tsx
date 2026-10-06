import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ProjectCard } from "@/components/projects/project-card";
import { buttonVariants } from "@/components/ui/button";
import { brandTitle, siteConfig } from "@/config/site";
import { pageMetadata } from "@/config/seo";
import { getFeaturedProjects } from "@/lib/projects";
import { ensurePortfolioDynamic } from "@/lib/projects/dynamic";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({ pathname: "/about", title: brandTitle("О компании и подходе к ремонту в Туле"), description: `${siteConfig.name} — ремонт квартир, домов и отдельных помещений в Туле и Тульской области.` });

const trustFacts = [
  { label: "Договор", text: "Работаем официально по договору." },
  { label: "Смета", text: "Составляем смету до начала работ.", detail: "Если в процессе меняется объём работ или появляются задачи, которые невозможно было определить при первоначальном осмотре, изменения согласовываем отдельно." },
  { label: "Гарантия", text: "Предоставляем гарантию на выполненные работы." },
  { label: "Выезд", text: "Бесплатный выезд и замер по Туле." },
  { label: "Контроль", text: "Контролируем качество работ на всех этапах ремонта." },
  { label: "Оплата", text: "Расчёты привязаны к согласованным этапам работ: аванс на старте, далее — поэтапная оплата." },
] as const;

const processSteps = [
  { title: "Обсуждаем задачу", text: "Бесплатно консультируем, уточняем особенности объекта, ваши задачи и желаемый результат." },
  { title: "Выезжаем на объект", text: "В Туле выезд и замер выполняются бесплатно." },
  { title: "Составляем смету и договор", text: "Определяем состав работ, стоимость, сроки и условия выполнения." },
  { title: "Выполняем ремонт", text: "Работы выполняют наши мастера и постоянные бригады. Контролируем качество и предоставляем фотоотчёты по ходу ремонта." },
  { title: "Сдаём объект", text: "Завершаем согласованные работы и передаём готовый результат. На выполненные работы предоставляется гарантия." },
] as const;

const workGroups = [
  ["Перегородки", "Штукатурные работы", "Стяжка", "Шпаклёвка"],
  ["Электрика", "Сантехника", "Плиточные работы", "Напольные покрытия"],
  ["Обои", "Натяжные потолки", "Чистовая сантехника", "Чистовая электрика", "Система кондиционирования", "Двери"],
] as const;

export default async function AboutPage() {
  await ensurePortfolioDynamic();
  const projects = await getFeaturedProjects(3);

  return (
    <main>
      <section className="border-b border-border">
        <Container className="py-12 md:py-16 lg:py-20">
          <p className="text-caption font-medium tracking-[0.12em] text-primary uppercase">О компании</p>
          <h1 className="mt-4 max-w-4xl text-h1 text-foreground">Берём ремонт целиком — от сметы до готового объекта.</h1>
          <p className="mt-5 max-w-3xl text-body-lg text-muted-foreground">«Отделка 360» выполняет капитальный ремонт квартир, домов и коммерческих помещений. Берём на себя комплекс работ по объекту — от подготовки и инженерных систем до чистовой отделки. Работаем в Туле, выезд по Тульской области обсуждается индивидуально.</p>
        </Container>
      </section>

      <section className="border-b border-border">
        <Container className="py-10 md:py-14">
          <dl className="grid border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {trustFacts.map((fact) => <div key={fact.label} className="border-b border-border px-0 py-5 sm:px-5 sm:odd:border-r lg:px-7 lg:[&:nth-child(3n+1)]:pl-0 lg:[&:nth-child(3n)]:border-r-0">
              <dt className="text-caption font-medium tracking-[0.12em] text-primary uppercase">{fact.label}</dt>
              <dd className="mt-2 text-body text-foreground">{fact.text}</dd>
              {"detail" in fact ? <p className="mt-2 text-small text-muted-foreground">{fact.detail}</p> : null}
            </div>)}
          </dl>
        </Container>
      </section>

      <section>
        <Container className="py-16 md:py-20 lg:py-24">
          <h2 className="text-h2 text-foreground">Как мы работаем</h2>
          <ol className="mt-9 grid gap-0 border-t border-border md:grid-cols-5">
            {processSteps.map((step, index) => <li key={step.title} className="border-b border-border py-6 md:border-r md:px-5 md:last:border-r-0 lg:px-6">
              <span className="text-caption font-medium tracking-[0.12em] text-primary">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-h3 text-foreground">{step.title}</h3>
              <p className="mt-3 text-body text-muted-foreground">{step.text}</p>
            </li>)}
          </ol>
        </Container>
      </section>

      <section className="border-y border-border bg-surface">
        <Container className="py-16 md:py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <div>
              <h2 className="max-w-xl text-h2 text-foreground">Один подрядчик на весь ремонт</h2>
              <p className="mt-5 max-w-2xl text-body-lg text-muted-foreground">Вы приходите с задачей по объекту, а мы берём на себя комплекс необходимых работ — от подготовки помещений и инженерных систем до чистовой отделки.</p>
              <Link href="/services" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-7 h-11 px-5")}>Все услуги <span aria-hidden="true">→</span></Link>
            </div>
            <div className="grid gap-x-8 border-y border-border py-5 sm:grid-cols-3">
              {workGroups.map((group, index) => <ul key={index} className={cn("space-y-3 py-3 text-body text-muted-foreground", index > 0 && "sm:border-l sm:border-border sm:pl-6")}>
                {group.map((work) => <li key={work}>{work}</li>)}
              </ul>)}
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16 md:py-20 lg:py-24">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <article className="border-t border-border pt-6"><h2 className="text-h3 text-foreground">Материалы</h2><p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">Черновые материалы можем закупать мы или заказчик. Чистовые материалы закупаются по согласованию. Помогаем с выбором и работаем с материалами заказчика.</p><p className="mt-4 max-w-2xl text-body text-muted-foreground">При необходимости доставка и подъём материалов выполняются с привлечением сторонних подрядчиков.</p></article>
            <article className="border-t border-border pt-6"><h2 className="text-h3 text-foreground">Оплата</h2><p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">Порядок расчётов согласовывается до начала ремонта. На старте предусмотрен аванс, дальнейшая оплата производится по завершении согласованных этапов работ.</p><p className="mt-4 text-body text-muted-foreground">Наличные · перевод · расчётный счёт</p></article>
          </div>
        </Container>
      </section>

      <section className="border-y border-border">
        <Container className="py-16 md:py-20 lg:py-24"><div className="max-w-3xl"><h2 className="text-h2 text-foreground">Кто выполняет работы</h2><p className="mt-5 text-body-lg text-muted-foreground">Работы выполняют наши мастера и постоянные бригады. За ходом ремонта и качеством выполненных работ ведётся контроль.</p><p className="mt-6 text-body text-muted-foreground">Срок зависит от объёма и состава работ, состояния объекта и выбранных решений. Конкретный график определяем после осмотра объекта и согласования задачи.</p></div></Container>
      </section>

      {projects.length > 0 ? <section><Container className="py-16 md:py-20 lg:py-24">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><h2 className="text-h2 text-foreground">Реализованные проекты</h2><p className="max-w-md text-body text-muted-foreground">Примеры выполненных работ на реальных объектах.</p></div>
        <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">{projects.map((project) => <li key={project.id}><ProjectCard project={project} /></li>)}</ul>
        <Link href="/projects" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-10 h-11 px-5")}>Смотреть все проекты <span aria-hidden="true">→</span></Link>
      </Container></section> : null}

      <section className="border-t border-border bg-surface">
        <Container className="py-14 md:py-16"><div className="max-w-3xl"><h2 className="text-h2 text-foreground">Есть объект для ремонта?</h2><p className="mt-4 text-body-lg text-muted-foreground">Расскажите о задаче — обсудим объём работ и дальнейшие шаги.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/calculator" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>Рассчитать стоимость</Link><Link href="/contacts" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}>Связаться</Link></div></div></Container>
      </section>
    </main>
  );
}
