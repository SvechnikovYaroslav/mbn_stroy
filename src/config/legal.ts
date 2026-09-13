/**
 * Legal page copy templates for Отделка 360.
 *
 * TECHNICAL TEMPLATE — must be reviewed with real operator details and
 * processes before production. Do not invent requisites in code.
 */

import { brandTitle, siteConfig } from "@/config/site";

export const privacyPolicyMeta = {
  title: brandTitle("Политика обработки персональных данных"),
  description: `Порядок обработки персональных данных на сайте ${siteConfig.name} при обращении за ремонтом в Туле и Тульской области.`,
  h1: "Политика в отношении обработки персональных данных",
} as const;

export const personalDataConsentMeta = {
  title: brandTitle("Согласие на обработку персональных данных"),
  description: `Согласие на обработку персональных данных при отправке заявки на сайте ${siteConfig.name}.`,
  h1: "Согласие на обработку персональных данных",
} as const;
