// src/utils/helpers.ts
import { v4 as uuidv4 } from 'uuid';
import { Exercise, WeeklyWorkout } from '../types';

// Função para formatar uma data como string YYYY-MM-DD
export const formatDateYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Função para obter o início da semana atual (domingo)
export const getCurrentWeekStart = (): string => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo como início da semana
  return formatDateYYYYMMDD(startOfWeek);
};

// Função para criar uma nova semana de treino vazia
export const createEmptyWeeklyWorkout = (weekStart: string): WeeklyWorkout => {
  const weekDays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  
  return {
    id: uuidv4(),
    week: weekStart,
    days: weekDays.map(day => ({
      day,
      exercises: []
    }))
  };
};

// Função para agrupar exercícios por grupo muscular
export const groupExercisesByMuscle = (exercises: Exercise[]): Record<string, Exercise[]> => {
  return exercises.reduce((groups, exercise) => {
    const group = exercise.muscleGroup;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(exercise);
    return groups;
  }, {} as Record<string, Exercise[]>);
};

// Função para formatar intervalo de datas da semana
export const formatWeekRange = (weekStart: string): string => {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  return `${formatDate(start)} - ${formatDate(end)}`;
};

// Função auxiliar para formatar data
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Função para importar exercícios da planilha de exemplo
export const importExercisesFromWorksheet = (worksheet: string): Exercise[] => {
  // Esta é uma função de exemplo que poderia ser usada para importar os exercícios 
  // da planilha fornecida no documento 2
  
  // Aqui, você implementaria a lógica para analisar o texto da planilha
  // e converter em objetos Exercise
  
  // Para o escopo deste projeto, isso seria uma implementação mais complexa
  // e pode ser desenvolvido como uma feature futura
  
  return [];
};