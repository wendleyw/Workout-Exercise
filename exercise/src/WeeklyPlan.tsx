// src/pages/WeeklyPlan.tsx
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import WorkoutDay from '../components/WorkoutDay';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Exercise, WeeklyWorkout, WorkoutDay as WorkoutDayType } from '../types';

const WeeklyPlan: React.FC = () => {
  const [exercises] = useLocalStorage<Exercise[]>('exercises', []);
  const [weeklyWorkouts, setWeeklyWorkouts] = useLocalStorage<WeeklyWorkout[]>('weeklyWorkouts', []);
  const [currentWeekStart, setCurrentWeekStart] = useState<string>('');
  
  // Dias da semana
  const weekDays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  
  // Inicializar com a semana atual
  useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo como início da semana
    
    const weekStartStr = startOfWeek.toISOString().split('T')[0];
    setCurrentWeekStart(weekStartStr);
    
    // Verificar se já existe um plano para esta semana, se não, criar um novo
    const existingWeek = weeklyWorkouts.find(workout => workout.week === weekStartStr);
    
    if (!existingWeek) {
      const newWeeklyWorkout: WeeklyWorkout = {
        id: uuidv4(),
        week: weekStartStr,
        days: weekDays.map(day => ({
          day,
          exercises: []
        }))
      };
      
      setWeeklyWorkouts(prev => [...prev, newWeeklyWorkout]);
    }
  }, [weeklyWorkouts, setWeeklyWorkouts]);
  
  // Obter o plano de treino da semana atual
  const getCurrentWeekWorkout = () => {
    return weeklyWorkouts.find(workout => workout.week === currentWeekStart);
  };
  
  // Navegar para a semana anterior
  const handlePreviousWeek = () => {
    const current = new Date(currentWeekStart);
    current.setDate(current.getDate() - 7);
    const newWeekStart = current.toISOString().split('T')[0];
    setCurrentWeekStart(newWeekStart);
    
    // Verificar se já existe um plano para esta semana, se não, criar um novo
    const existingWeek = weeklyWorkouts.find(workout => workout.week === newWeekStart);
    
    if (!existingWeek) {
      const newWeeklyWorkout: WeeklyWorkout = {
        id: uuidv4(),
        week: newWeekStart,
        days: weekDays.map(day => ({
          day,
          exercises: []
        }))
      };
      
      setWeeklyWorkouts(prev => [...prev, newWeeklyWorkout]);
    }
  };
  
  // Navegar para a próxima semana
  const handleNextWeek = () => {
    const current = new Date(currentWeekStart);
    current.setDate(current.getDate() + 7);
    const newWeekStart = current.toISOString().split('T')[0];
    setCurrentWeekStart(newWeekStart);
    
    // Verificar se já existe um plano para esta semana, se não, criar um novo
    const existingWeek = weeklyWorkouts.find(workout => workout.week === newWeekStart);
    
    if (!existingWeek) {
      const newWeeklyWorkout: WeeklyWorkout = {
        id: uuidv4(),
        week: newWeekStart,
        days: weekDays.map(day => ({
          day,
          exercises: []
        }))
      };
      
      setWeeklyWorkouts(prev => [...prev, newWeeklyWorkout]);
    }
  };
  
  // Salvar os exercícios para um dia específico
  const handleSaveDay = (day: string, exerciseIds: string[]) => {
    const currentWorkout = getCurrentWeekWorkout();
    
    if (currentWorkout) {
      const updatedWorkout: WeeklyWorkout = {
        ...currentWorkout,
        days: currentWorkout.days.map(d => 
          d.day === day 
            ? { ...d, exercises: exerciseIds }
            : d
        )
      };
      
      setWeeklyWorkouts(prev => 
        prev.map(workout => 
          workout.id === currentWorkout.id ? updatedWorkout : workout
        )
      );
    }
  };
  
  // Formatar a data para exibição
  const formatWeekRange = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };
  
  const currentWorkout = getCurrentWeekWorkout();
  
  if (!currentWorkout) {
    return <div className="container mx-auto px-4 py-8 text-center">Carregando...</div>;
  }
  
  // Obter os exercícios para cada dia
  const getDayExercises = (day: string) => {
    const dayData = currentWorkout.days.find(d => d.day === day);
    if (!dayData) return [];
    
    return dayData.exercises.map(id => 
      exercises.find(ex => ex.id === id)
    ).filter(Boolean) as Exercise[];
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Plano de Treino Semanal</h1>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousWeek}
              className="p-2 border rounded-md hover:bg-gray-100"
            >
              &lt; Anterior
            </button>
            <span className="font-medium">{formatWeekRange()}</span>
            <button
              onClick={handleNextWeek}
              className="p-2 border rounded-md hover:bg-gray-100"
            >
              Próxima &gt;
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          {weekDays.map(day => (
            <WorkoutDay
              key={day}
              day={day}
              exercises={getDayExercises(day)}
              selectedExerciseIds={
                currentWorkout.days.find(d => d.day === day)?.exercises || []
              }
              allExercises={exercises}
              onSave={handleSaveDay}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyPlan;