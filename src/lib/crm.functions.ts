import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// ---------- Models ----------
export const listModels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("models")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const getModel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: model, error } = await context.supabase
      .from("models").select("*").eq("id", data.id).single();
    if (error) throw new Error(error.message);
    return model;
  });

export const createModel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      stage_name: z.string().min(1),
      niche: z.string().optional(),
      onlyfans_url: z.string().url().optional().or(z.literal("")),
      commission_rate: z.number().min(0).max(100).default(20),
      monthly_goal: z.number().min(0).default(0),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("models")
      .insert({
        owner_id: context.userId,
        stage_name: data.stage_name,
        niche: data.niche || null,
        onlyfans_url: data.onlyfans_url || null,
        commission_rate: data.commission_rate,
        monthly_goal: data.monthly_goal,
      })
      .select().single();
    if (error) throw new Error(error.message);
    return row;
  });

// ---------- Fans ----------
export const listFans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ model_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("fans")
      .select("*")
      .eq("model_id", data.model_id)
      .order("lifetime_value", { ascending: false });
    if (error) throw new Error(error.message);
    return rows;
  });

export const createFan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      model_id: z.string().uuid(),
      handle: z.string().min(1),
      display_name: z.string().optional(),
      country: z.string().optional(),
      language: z.string().default("en"),
      status: z.enum(["lead", "active", "vip", "whale", "churned"]).default("lead"),
      tags: z.array(z.string()).default([]),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("fans")
      .insert({
        model_id: data.model_id,
        owner_id: context.userId,
        handle: data.handle,
        display_name: data.display_name || null,
        country: data.country || null,
        language: data.language,
        status: data.status,
        tags: data.tags,
      })
      .select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateFanStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["lead", "active", "vip", "whale", "churned"]),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("fans").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Interactions ----------
export const listInteractions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ fan_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("interactions").select("*")
      .eq("fan_id", data.fan_id)
      .order("occurred_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return rows;
  });

export const addInteraction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      fan_id: z.string().uuid(),
      model_id: z.string().uuid(),
      kind: z.enum(["message_in","message_out","ppv_sent","ppv_purchased","tip","subscription","call","note"]),
      content: z.string().optional(),
      amount: z.number().optional(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("interactions")
      .insert({
        fan_id: data.fan_id,
        model_id: data.model_id,
        owner_id: context.userId,
        kind: data.kind,
        content: data.content || null,
        amount: data.amount ?? null,
      }).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

// ---------- AI Copilot ----------
export const aiSuggestReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      fan_id: z.string().uuid(),
      goal: z.enum(["engage", "upsell_ppv", "tip", "reactivate"]).default("engage"),
      extra_context: z.string().optional(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { data: fan, error: fErr } = await context.supabase
      .from("fans").select("*, models(stage_name, niche)").eq("id", data.fan_id).single();
    if (fErr) throw new Error(fErr.message);

    const { data: last } = await context.supabase
      .from("interactions").select("kind, content, amount, occurred_at")
      .eq("fan_id", data.fan_id).order("occurred_at", { ascending: false }).limit(15);

    const { generateText } = await import("ai");
    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const goalMap: Record<string, string> = {
      engage: "renforcer la relation, poser une question ouverte engageante",
      upsell_ppv: "vendre un PPV premium (propose un prix cohérent avec la LTV)",
      tip: "solliciter un tip de manière charmante et non-agressive",
      reactivate: "réactiver ce fan inactif avec un message personnalisé",
    };

    const timeline = (last ?? []).slice().reverse()
      .map((i) => `[${i.kind}${i.amount ? ` $${i.amount}` : ""}] ${i.content ?? ""}`)
      .join("\n");

    const prompt = `Tu es le chatter IA de l'agence OFM pour la modèle "${(fan as any).models?.stage_name}" (niche: ${(fan as any).models?.niche ?? "n/a"}).
Fan: @${fan.handle} — statut ${fan.status}, LTV $${fan.lifetime_value}, langue ${fan.language}, pays ${fan.country ?? "n/a"}, tags: ${(fan.tags ?? []).join(", ") || "aucun"}.
Objectif: ${goalMap[data.goal]}.
${data.extra_context ? `Contexte additionnel: ${data.extra_context}\n` : ""}
Historique récent:
${timeline || "(aucun échange)"}

Rédige 3 propositions de réponse dans la langue du fan (${fan.language}). Ton flirt, authentique, respectueux, sans emojis excessifs. Format: liste numérotée courte (max 2 phrases chacune).`;

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      prompt,
    });

    return { suggestions: text };
  });

export const aiSummarizeFan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ fan_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { data: fan, error } = await context.supabase
      .from("fans").select("*").eq("id", data.fan_id).single();
    if (error) throw new Error(error.message);
    const { data: last } = await context.supabase
      .from("interactions").select("kind, content, amount, occurred_at")
      .eq("fan_id", data.fan_id).order("occurred_at", { ascending: false }).limit(50);

    const { generateText } = await import("ai");
    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const timeline = (last ?? []).slice().reverse()
      .map((i) => `[${i.kind}${i.amount ? ` $${i.amount}` : ""}] ${i.content ?? ""}`).join("\n");

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      prompt: `Résume ce fan OnlyFans en 4-5 lignes: profil, intérêts, triggers d'achat, next best action.
Fan @${fan.handle}, statut ${fan.status}, LTV $${fan.lifetime_value}, tags: ${(fan.tags ?? []).join(", ") || "aucun"}.
Historique:
${timeline || "(aucun)"}
`,
    });

    await context.supabase.from("fans").update({ ai_summary: text }).eq("id", data.fan_id);
    return { summary: text };
  });
