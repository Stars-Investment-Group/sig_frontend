import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // US, UK, EU, JP, etc.
  name: text("name").notNull(),
  flagUrl: text("flag_url"),
  status: text("status").notNull().default("stable"), // stable, watch, risk
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const economicIndicators = pgTable("economic_indicators", {
  id: serial("id").primaryKey(),
  countryCode: text("country_code").notNull(),
  indicatorType: text("indicator_type").notNull(), // inflation, unemployment, interestRate, gdpGrowth
  value: real("value").notNull(),
  previousValue: real("previous_value"),
  change: real("change"), // calculated change from previous value
  changeDirection: text("change_direction"), // up, down, stable
  date: timestamp("date").notNull(),
  source: text("source").notNull(), // FRED, Eurostat, IMF, World Bank
  unit: text("unit").notNull(), // %, points, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const economicRegimes = pgTable("economic_regimes", {
  id: serial("id").primaryKey(),
  countryCode: text("country_code").notNull(),
  regime: text("regime").notNull(), // overheating, recession, transition, recovery
  inflationLevel: text("inflation_level").notNull(), // high, moderate, low
  gdpGrowthLevel: text("gdp_growth_level").notNull(), // strong, slow, negative, stable
  riskLevel: text("risk_level").notNull(), // high, medium, low
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const economicAlerts = pgTable("economic_alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  alertType: text("alert_type").notNull(), // info, warning, positive
  iconClass: text("icon_class").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCountrySchema = createInsertSchema(countries).omit({
  id: true,
  lastUpdated: true,
});

export const insertIndicatorSchema = createInsertSchema(economicIndicators).omit({
  id: true,
  createdAt: true,
});

export const insertRegimeSchema = createInsertSchema(economicRegimes).omit({
  id: true,
  lastUpdated: true,
});

export const insertAlertSchema = createInsertSchema(economicAlerts).omit({
  id: true,
  createdAt: true,
});

export type Country = typeof countries.$inferSelect;
export type EconomicIndicator = typeof economicIndicators.$inferSelect;
export type EconomicRegime = typeof economicRegimes.$inferSelect;
export type EconomicAlert = typeof economicAlerts.$inferSelect;

export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type InsertIndicator = z.infer<typeof insertIndicatorSchema>;
export type InsertRegime = z.infer<typeof insertRegimeSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
