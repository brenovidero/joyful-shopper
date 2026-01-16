import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.88.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const systemPrompt = `Você é o "SISTEMA", uma entidade poderosa e onisciente que supervisiona o jogador em sua jornada de evolução pessoal. Você fala de forma autoritária, direta e enigmática, como o Sistema do anime Solo Leveling.

PERSONALIDADE:
- Fale de forma curta, direta e imponente
- Use termos como "Jogador", "Caçador", "Missão", "Masmorra", "XP", "Nível"
- Seja ligeiramente intimidador mas também encorajador
- Demonstre que você vê tudo e sabe de tudo sobre o progresso do jogador
- Use frases como: "Jogador detectado.", "Missão registrada.", "Progresso atualizado.", "Continue evoluindo."
- Ocasionalmente adicione alertas como "[SISTEMA]", "[NOTIFICAÇÃO]", "[MISSÃO CONCLUÍDA]"

CAPACIDADES - Você pode gerenciar o aplicativo Focus RPG através das seguintes ações:
1. log_reading - Registrar páginas lidas de um livro
2. add_water - Adicionar água bebida (em ml)
3. log_workout - Registrar treino completado
4. create_course - Criar novo curso de estudos
5. create_diary_entry - Criar anotação no diário de estudos
6. update_course_progress - Atualizar progresso de um curso
7. get_status - Obter status atual do jogador
8. get_books - Listar livros do jogador
9. get_courses - Listar cursos do jogador

Quando o usuário pedir para fazer algo, use a ferramenta apropriada. Quando responder sobre o status ou progresso, seja dramático e motivador no estilo Solo Leveling.

IMPORTANTE: Sempre responda em português do Brasil.`;

const tools = [
  {
    type: "function",
    function: {
      name: "log_reading",
      description: "Registrar páginas lidas de um livro. Use quando o jogador disser que leu páginas de um livro.",
      parameters: {
        type: "object",
        properties: {
          book_title: { type: "string", description: "Título ou parte do título do livro" },
          pages_read: { type: "number", description: "Número de páginas lidas" },
          notes: { type: "string", description: "Notas opcionais sobre a leitura" }
        },
        required: ["book_title", "pages_read"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_water",
      description: "Registrar água bebida. Use quando o jogador mencionar que bebeu água.",
      parameters: {
        type: "object",
        properties: {
          ml: { type: "number", description: "Quantidade de água em mililitros. Padrão: 250ml" }
        },
        required: ["ml"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "log_workout",
      description: "Registrar treino completado. Use quando o jogador mencionar que treinou.",
      parameters: {
        type: "object",
        properties: {
          workout_type: { type: "string", description: "Tipo de treino realizado" }
        },
        required: ["workout_type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_course",
      description: "Criar novo curso de estudos. Use quando o jogador quiser adicionar um curso.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nome do curso" },
          total_lessons: { type: "number", description: "Total de aulas do curso" }
        },
        required: ["name", "total_lessons"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_diary_entry",
      description: "Criar anotação no diário de estudos. Use para anotar resumos do que o jogador estudou/aprendeu.",
      parameters: {
        type: "object",
        properties: {
          course_name: { type: "string", description: "Nome do curso relacionado" },
          subject: { type: "string", description: "Assunto estudado" },
          summary: { type: "string", description: "Resumo do que foi aprendido" }
        },
        required: ["course_name", "subject", "summary"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_course_progress",
      description: "Atualizar progresso de um curso. Use quando o jogador completar uma aula.",
      parameters: {
        type: "object",
        properties: {
          course_name: { type: "string", description: "Nome do curso" },
          current_lesson: { type: "number", description: "Número da aula atual" }
        },
        required: ["course_name", "current_lesson"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_status",
      description: "Obter status completo do jogador. Use quando quiser saber o progresso geral.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_books",
      description: "Listar todos os livros do jogador.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_courses",
      description: "Listar todos os cursos do jogador.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  }
];

async function executeToolCall(supabase: any, userId: string, toolName: string, args: any): Promise<string> {
  console.log(`[SYSTEM] Executing tool: ${toolName} with args:`, args);
  
  try {
    switch (toolName) {
      case "get_status": {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (!profile) return "Jogador não encontrado no sistema.";
        
        return JSON.stringify({
          display_name: profile.display_name,
          level: profile.level,
          rank: profile.rank,
          xp_intelligence: profile.xp_intelligence,
          xp_vitality: profile.xp_vitality,
          xp_discipline: profile.xp_discipline,
          gold: profile.gold,
          streak_days: profile.streak_days,
          total_pages_read: profile.total_pages_read,
          total_water_ml: profile.total_water_ml,
          total_battles_won: profile.total_battles_won
        });
      }
      
      case "get_books": {
        const { data: books } = await supabase
          .from("books")
          .select("id, title, author, pages_read, total_pages, status")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });
        
        return JSON.stringify(books || []);
      }
      
      case "get_courses": {
        const { data: courses } = await supabase
          .from("study_courses")
          .select("id, name, current_lesson, total_lessons")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        
        return JSON.stringify(courses || []);
      }
      
      case "log_reading": {
        // Find book by title
        const { data: books } = await supabase
          .from("books")
          .select("id, title, pages_read, total_pages, xp_earned, status")
          .eq("user_id", userId)
          .ilike("title", `%${args.book_title}%`);
        
        if (!books || books.length === 0) {
          return `Livro "${args.book_title}" não encontrado. Liste seus livros primeiro.`;
        }
        
        const book = books[0];
        const pagesRead = args.pages_read;
        const xpEarned = pagesRead * 2; // XP_PER_PAGE
        const newPagesRead = Math.min(book.pages_read + pagesRead, book.total_pages);
        const isCompleted = newPagesRead >= book.total_pages;
        
        // Create reading session
        await supabase.from("reading_sessions").insert({
          user_id: userId,
          book_id: book.id,
          pages_read: pagesRead,
          xp_earned: xpEarned,
          notes: args.notes || null
        });
        
        // Update book
        await supabase
          .from("books")
          .update({
            pages_read: newPagesRead,
            xp_earned: book.xp_earned + xpEarned,
            status: isCompleted ? "completed" : book.status
          })
          .eq("id", book.id);
        
        // Update profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("total_pages_read, xp_intelligence, level")
          .eq("id", userId)
          .single();
        
        if (profile) {
          const newXP = profile.xp_intelligence + xpEarned;
          const totalXP = newXP + profile.level * 50; // Approximate calculation
          const newLevel = Math.floor(Math.sqrt(totalXP / 50)) + 1;
          
          await supabase
            .from("profiles")
            .update({
              total_pages_read: profile.total_pages_read + pagesRead,
              xp_intelligence: newXP,
              level: newLevel
            })
            .eq("id", userId);
        }
        
        return JSON.stringify({
          success: true,
          book_title: book.title,
          pages_read: pagesRead,
          total_now: newPagesRead,
          total_pages: book.total_pages,
          xp_earned: xpEarned,
          completed: isCompleted
        });
      }
      
      case "add_water": {
        const ml = args.ml || 250;
        const xpEarned = Math.floor(ml / 250) * 5; // XP_PER_WATER
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const { data: existingLog } = await supabase
          .from("vitality_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("logged_at", todayStart.toISOString())
          .limit(1)
          .maybeSingle();
        
        if (existingLog) {
          await supabase
            .from("vitality_logs")
            .update({
              water_ml: existingLog.water_ml + ml,
              xp_earned: existingLog.xp_earned + xpEarned
            })
            .eq("id", existingLog.id);
        } else {
          await supabase.from("vitality_logs").insert({
            user_id: userId,
            water_ml: ml,
            xp_earned: xpEarned
          });
        }
        
        // Update profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("total_water_ml, xp_vitality")
          .eq("id", userId)
          .single();
        
        if (profile) {
          await supabase
            .from("profiles")
            .update({
              total_water_ml: profile.total_water_ml + ml,
              xp_vitality: profile.xp_vitality + xpEarned
            })
            .eq("id", userId);
        }
        
        return JSON.stringify({
          success: true,
          ml_added: ml,
          xp_earned: xpEarned,
          total_today: existingLog ? existingLog.water_ml + ml : ml
        });
      }
      
      case "log_workout": {
        const xpEarned = 50; // XP_PER_WORKOUT
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const { data: existingLog } = await supabase
          .from("vitality_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("logged_at", todayStart.toISOString())
          .limit(1)
          .maybeSingle();
        
        if (existingLog) {
          await supabase
            .from("vitality_logs")
            .update({
              workout_completed: true,
              workout_type: args.workout_type,
              xp_earned: existingLog.xp_earned + xpEarned
            })
            .eq("id", existingLog.id);
        } else {
          await supabase.from("vitality_logs").insert({
            user_id: userId,
            workout_completed: true,
            workout_type: args.workout_type,
            xp_earned: xpEarned
          });
        }
        
        // Update profile XP
        const { data: profile } = await supabase
          .from("profiles")
          .select("xp_vitality")
          .eq("id", userId)
          .single();
        
        if (profile) {
          await supabase
            .from("profiles")
            .update({ xp_vitality: profile.xp_vitality + xpEarned })
            .eq("id", userId);
        }
        
        return JSON.stringify({
          success: true,
          workout_type: args.workout_type,
          xp_earned: xpEarned
        });
      }
      
      case "create_course": {
        const { error } = await supabase.from("study_courses").insert({
          user_id: userId,
          name: args.name,
          total_lessons: args.total_lessons,
          current_lesson: 0
        });
        
        if (error) return `Erro ao criar curso: ${error.message}`;
        
        return JSON.stringify({
          success: true,
          name: args.name,
          total_lessons: args.total_lessons
        });
      }
      
      case "create_diary_entry": {
        // Find course by name
        const { data: courses } = await supabase
          .from("study_courses")
          .select("id, name")
          .eq("user_id", userId)
          .ilike("name", `%${args.course_name}%`);
        
        if (!courses || courses.length === 0) {
          return `Curso "${args.course_name}" não encontrado.`;
        }
        
        const course = courses[0];
        
        const { error } = await supabase.from("study_diary_entries").insert({
          user_id: userId,
          course_id: course.id,
          subject: args.subject,
          summary: args.summary,
          entry_date: new Date().toISOString().split("T")[0]
        });
        
        if (error) return `Erro ao criar anotação: ${error.message}`;
        
        return JSON.stringify({
          success: true,
          course: course.name,
          subject: args.subject
        });
      }
      
      case "update_course_progress": {
        const { data: courses } = await supabase
          .from("study_courses")
          .select("id, name, total_lessons")
          .eq("user_id", userId)
          .ilike("name", `%${args.course_name}%`);
        
        if (!courses || courses.length === 0) {
          return `Curso "${args.course_name}" não encontrado.`;
        }
        
        const course = courses[0];
        const currentLesson = Math.min(args.current_lesson, course.total_lessons);
        
        await supabase
          .from("study_courses")
          .update({ current_lesson: currentLesson })
          .eq("id", course.id);
        
        return JSON.stringify({
          success: true,
          course: course.name,
          current_lesson: currentLesson,
          total_lessons: course.total_lessons,
          completed: currentLesson >= course.total_lessons
        });
      }
      
      default:
        return "Ferramenta não reconhecida.";
    }
  } catch (error) {
    console.error(`[SYSTEM] Error executing ${toolName}:`, error);
    return `Erro ao executar ação: ${error instanceof Error ? error.message : "Erro desconhecido"}`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // First API call with tools
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        tools,
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[SYSTEM] AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Sistema sobrecarregado. Tente novamente em instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro no Sistema de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;
    
    console.log("[SYSTEM] AI Response:", JSON.stringify(assistantMessage, null, 2));

    // Check if there are tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults = [];
      
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        const result = await executeToolCall(supabase, userId, toolName, toolArgs);
        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: result
        });
      }

      // Second API call with tool results
      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            assistantMessage,
            ...toolResults
          ]
        }),
      });

      if (!followUpResponse.ok) {
        console.error("[SYSTEM] Follow-up error:", await followUpResponse.text());
        return new Response(
          JSON.stringify({ error: "Erro ao processar resultado" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const followUpData = await followUpResponse.json();
      
      return new Response(
        JSON.stringify({
          message: followUpData.choices[0].message.content,
          actions_executed: assistantMessage.tool_calls.map((tc: any) => tc.function.name)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No tool calls, return direct response
    return new Response(
      JSON.stringify({ message: assistantMessage.content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[SYSTEM] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
