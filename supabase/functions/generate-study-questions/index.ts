import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { mode, summary, subject, skill_name, day_number, title } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Mode: generate_log - Generate skill log content
    if (mode === 'generate_log') {
      if (!skill_name || !title) {
        return new Response(
          JSON.stringify({ error: "skill_name and title are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const logPrompt = `Você é um assistente de aprendizado que ajuda estudantes a documentar seu progresso diário.

Gere um resumo de aprendizado para o dia ${day_number || 1} de estudo de "${skill_name}".
O título do estudo de hoje é: "${title}"

Crie um resumo conciso mas informativo (3-5 parágrafos) que inclua:
1. O que foi estudado/praticado
2. Conceitos-chave aprendidos
3. Desafios encontrados (se aplicável)
4. Próximos passos ou coisas para revisar

Escreva em primeira pessoa, como se fosse o próprio estudante registrando seu progresso.
Use linguagem natural e motivadora. Responda APENAS com o texto do resumo, sem formatação extra.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "user", content: logPrompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: "AI gateway error" }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      
      return new Response(
        JSON.stringify({ content }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default mode: generate questions
    if (!summary) {
      return new Response(
        JSON.stringify({ error: "Summary is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Você é um especialista em técnicas de aprendizagem e memorização, especialmente em Active Recall (Recuperação Ativa) e Spaced Repetition (Repetição Espaçada).

Sua tarefa é criar 3 perguntas estratégicas de Active Recall baseadas no resumo de estudo fornecido. As perguntas devem:

1. Testar a compreensão profunda do conteúdo, não apenas memorização superficial
2. Incentivar o aluno a recuperar ativamente as informações da memória
3. Variar entre diferentes níveis cognitivos (compreensão, aplicação, análise)
4. Ser específicas e focadas nos conceitos-chave do resumo
5. Ser formuladas de forma clara e objetiva

Retorne APENAS as 3 perguntas em formato JSON array, sem explicações adicionais.`;

    const userPrompt = `Assunto: ${subject || 'Não especificado'}

Resumo do estudo:
${summary}

Gere 3 perguntas de Active Recall para este conteúdo.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_questions",
              description: "Gera 3 perguntas de Active Recall baseadas no resumo",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3,
                    description: "Array com exatamente 3 perguntas de Active Recall",
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_questions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // Extract questions from tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify({ questions: args.questions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: try to parse from content
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        const questions = Array.isArray(parsed) ? parsed : parsed.questions;
        return new Response(
          JSON.stringify({ questions }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        // If not JSON, split by newlines
        const lines = content.split('\n').filter((l: string) => l.trim().length > 0);
        const questions = lines.slice(0, 3).map((l: string) => l.replace(/^\d+[\.\)]\s*/, ''));
        return new Response(
          JSON.stringify({ questions }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Failed to generate questions" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-study-questions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
