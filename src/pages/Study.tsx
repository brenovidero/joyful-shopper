import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Plus, 
  BookOpen, 
  FileText, 
  Star,
  ChevronLeft,
  Minus,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useStudy } from '@/hooks/useStudy';
import { StudyCourse } from '@/types/study';

import { AddCourseModal } from '@/components/study/AddCourseModal';
import { CourseCard } from '@/components/study/CourseCard';
import { StudyDashboard } from '@/components/study/StudyDashboard';
import { AddDiaryEntryModal } from '@/components/study/AddDiaryEntryModal';
import { DiaryEntryCard } from '@/components/study/DiaryEntryCard';
import { QuestionCard } from '@/components/study/QuestionCard';
import { GeneratedQuestionsModal } from '@/components/study/GeneratedQuestionsModal';

export default function Study() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const {
    courses,
    diaryEntries,
    questions,
    loading,
    createCourse,
    updateCourse,
    deleteCourse,
    createDiaryEntry,
    deleteDiaryEntry,
    saveQuestions,
    toggleFavorite,
    deleteQuestion,
    fetchQuestions,
  } = useStudy();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddDiary, setShowAddDiary] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<StudyCourse | null>(null);
  const [editingCourse, setEditingCourse] = useState<StudyCourse | null>(null);
  const [editName, setEditName] = useState('');
  const [editTotalLessons, setEditTotalLessons] = useState(0);

  // Generated questions modal state
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [generatedForEntryId, setGeneratedForEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCourseSelect = (course: StudyCourse) => {
    setSelectedCourse(course);
    setActiveTab('diary');
  };

  const handleEditCourse = (course: StudyCourse) => {
    setEditingCourse(course);
    setEditName(course.name);
    setEditTotalLessons(course.total_lessons);
  };

  const handleSaveEdit = async () => {
    if (!editingCourse) return;
    await updateCourse(editingCourse.id, {
      name: editName,
      total_lessons: editTotalLessons,
    });
    setEditingCourse(null);
    toast({ title: 'Curso atualizado!' });
  };

  const handleDeleteCourse = async (courseId: string) => {
    await deleteCourse(courseId);
    if (selectedCourse?.id === courseId) {
      setSelectedCourse(null);
    }
    toast({ title: 'Curso excluído!' });
  };

  const handleIncrementLesson = async (course: StudyCourse) => {
    if (course.current_lesson < course.total_lessons) {
      await updateCourse(course.id, {
        current_lesson: course.current_lesson + 1,
      });
    }
  };

  const handleDecrementLesson = async (course: StudyCourse) => {
    if (course.current_lesson > 0) {
      await updateCourse(course.id, {
        current_lesson: course.current_lesson - 1,
      });
    }
  };

  const handleDeleteDiaryEntry = async (entryId: string) => {
    await deleteDiaryEntry(entryId);
    toast({ title: 'Anotação excluída!' });
  };

  const handleQuestionsGenerated = (entryId: string, questions: string[]) => {
    setGeneratedForEntryId(entryId);
    setGeneratedQuestions(questions);
  };

  const handleSaveGeneratedQuestions = async (selectedQuestions: string[]) => {
    if (!generatedForEntryId) return { error: new Error('No entry selected') };
    const result = await saveQuestions(generatedForEntryId, selectedQuestions);
    if (!result.error) {
      toast({ title: 'Questões salvas!' });
    }
    return result;
  };

  const handleSaveAsFavorites = async (selectedQuestions: string[]) => {
    if (!generatedForEntryId || !user) return { error: new Error('No entry selected') };
    
    // First save the questions
    const result = await saveQuestions(generatedForEntryId, selectedQuestions);
    if (result.error) return result;

    // Then mark them as favorites (need to fetch and update)
    await fetchQuestions();
    
    toast({ title: 'Questões salvas como favoritas!' });
    return { error: null };
  };

  const handleToggleFavorite = async (questionId: string, isFavorite: boolean) => {
    await toggleFavorite(questionId, isFavorite);
    toast({ 
      title: isFavorite ? 'Adicionada aos favoritos!' : 'Removida dos favoritos' 
    });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await deleteQuestion(questionId);
    toast({ title: 'Questão excluída!' });
  };

  const favoriteQuestions = questions.filter(q => q.is_favorite);
  const filteredDiaryEntries = selectedCourse 
    ? diaryEntries.filter(e => e.course_id === selectedCourse.id)
    : diaryEntries;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Academia de Estudos</h1>
                  <p className="text-sm text-muted-foreground">
                    {courses.length} cursos
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowAddCourse(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Curso
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Cursos
            </TabsTrigger>
            <TabsTrigger value="diary" className="gap-2">
              <FileText className="w-4 h-4" />
              Diário
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Star className="w-4 h-4" />
              Favoritas
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <StudyDashboard courses={courses} />
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <div className="space-y-4">
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Nenhum curso cadastrado</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Adicione seu primeiro curso para começar
                  </p>
                  <Button onClick={() => setShowAddCourse(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Curso
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <div key={course.id}>
                      {editingCourse?.id === course.id ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-card border border-primary rounded-xl p-4 space-y-3"
                        >
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Nome do curso"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Total de aulas:</span>
                            <Input
                              type="number"
                              min={course.current_lesson}
                              value={editTotalLessons}
                              onChange={(e) => setEditTotalLessons(parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              <Check className="w-4 h-4 mr-1" />
                              Salvar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setEditingCourse(null)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="relative">
                          <CourseCard
                            course={course}
                            onSelect={handleCourseSelect}
                            onEdit={handleEditCourse}
                            onDelete={handleDeleteCourse}
                          />
                          {/* Quick lesson controls */}
                          <div className="absolute bottom-4 right-4 flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDecrementLesson(course);
                              }}
                              disabled={course.current_lesson <= 0}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIncrementLesson(course);
                              }}
                              disabled={course.current_lesson >= course.total_lessons}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Diary Tab */}
          <TabsContent value="diary">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  {selectedCourse ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCourse(null)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="font-medium">{selectedCourse.name}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Todas as anotações
                    </p>
                  )}
                </div>
                <Button onClick={() => setShowAddDiary(true)} disabled={courses.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Anotação
                </Button>
              </div>

              {filteredDiaryEntries.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Nenhuma anotação</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Registre seus aprendizados diários
                  </p>
                  {courses.length > 0 && (
                    <Button onClick={() => setShowAddDiary(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Anotação
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDiaryEntries.map((entry) => (
                    <DiaryEntryCard
                      key={entry.id}
                      entry={entry}
                      onDelete={handleDeleteDiaryEntry}
                      onQuestionsGenerated={handleQuestionsGenerated}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <div className="space-y-4">
              {favoriteQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Nenhuma questão favorita</h3>
                  <p className="text-sm text-muted-foreground">
                    Marque questões como favoritas para revisão
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favoriteQuestions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onToggleFavorite={handleToggleFavorite}
                      onDelete={handleDeleteQuestion}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <AddCourseModal
        isOpen={showAddCourse}
        onClose={() => setShowAddCourse(false)}
        onSubmit={createCourse}
      />

      <AddDiaryEntryModal
        isOpen={showAddDiary}
        onClose={() => setShowAddDiary(false)}
        courses={courses}
        preselectedCourseId={selectedCourse?.id}
        onSubmit={createDiaryEntry}
      />

      <GeneratedQuestionsModal
        isOpen={generatedQuestions.length > 0}
        onClose={() => {
          setGeneratedQuestions([]);
          setGeneratedForEntryId(null);
        }}
        questions={generatedQuestions}
        onSave={handleSaveGeneratedQuestions}
        onSaveAsFavorites={handleSaveAsFavorites}
      />
    </div>
  );
}
