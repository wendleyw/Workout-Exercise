// src/pages/History.tsx
import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Exercise, WeeklyWorkout } from '../types';

const History: React.FC = () => {
  const [exercises] = useLocalStorage<Exercise[]>('exercises', []);
  const [weeklyWorkouts] = useLocalStorage<WeeklyWorkout[]>('weeklyWorkouts', []);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  
  // Ordenar semanas por data (mais recente primeiro)
  const sortedWorkouts = [...weeklyWorkouts].sort((a, b) => {
    return new Date(b.week).getTime() - new Date(a.week).getTime();
  });
  
  // Formatar a data da semana para exibição
  const formatWeekDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 6);
    
    const formatDate = (d: Date) => {
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };
    
    return `${formatDate(date)} - ${formatDate(endDate)}`;
  };
  
  // Obter o treino selecionado
  const selectedWorkout = selectedWeekId 
    ? weeklyWorkouts.find(workout => workout.id === selectedWeekId)
    : null;
  
  // Obter os dias de treino da semana selecionada
  const workoutDays = selectedWorkout 
    ? selectedWorkout.days.filter(day => day.exercises.length > 0)
    : [];
  
  // Obter os exercícios do dia selecionado
  const getDayExercises = () => {
    if (!selectedWorkout || !selectedDay) return [];
    
    const dayData = selectedWorkout.days.find(d => d.day === selectedDay);
    if (!dayData) return [];
    
    return dayData.exercises.map(id => 
      exercises.find(ex => ex.id === id)
    ).filter(Boolean) as Exercise[];
  };
  
  const dayExercises = getDayExercises();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Histórico de Treinos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Lista de semanas */}
        <div className="md:col-span-3 bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-4">Semanas</h2>
          
          {sortedWorkouts.length === 0 ? (
            <p className="text-gray-500">Nenhum treino registrado.</p>
          ) : (
            <ul className="space-y-2">
              {sortedWorkouts.map(workout => (
                <li key={workout.id}>
                  <button
                    onClick={() => {
                      setSelectedWeekId(workout.id);
                      setSelectedDay('');
                    }}
                    className={`w-full text-left p-2 rounded ${
                      selectedWeekId === workout.id 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {formatWeekDate(workout.week)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Dias da semana */}
        <div className="md:col-span-3 bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-4">Dias com Treino</h2>
          
          {!selectedWorkout ? (
            <p className="text-gray-500">Selecione uma semana para ver os dias.</p>
          ) : workoutDays.length === 0 ? (
            <p className="text-gray-500">Nenhum treino registrado nesta semana.</p>
          ) : (
            <ul className="space-y-2">
              {workoutDays.map(day => (
                <li key={day.day}>
                  <button
                    onClick={() => setSelectedDay(day.day)}
                    className={`w-full text-left p-2 rounded ${
                      selectedDay === day.day 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {day.day}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Exercícios do dia */}
        <div className="md:col-span-6 bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-4">
            {selectedDay ? `Exercícios - ${selectedDay}` : 'Exercícios'}
          </h2>
          
          {!selectedDay ? (
            <p className="text-gray-500">Selecione um dia para ver os exercícios.</p>
          ) : dayExercises.length === 0 ? (
            <p className="text-gray-500">Nenhum exercício registrado para este dia.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dayExercises.map(exercise => (
                <div key={exercise.id} className="border rounded overflow-hidden shadow-sm">
                  <div className="h-40 bg-gray-200">
                    <img 
                      src={exercise.imageUrl} 
                      alt={exercise.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium">{exercise.name}</h3>
                    <p className="text-sm text-gray-600">{exercise.muscleGroup}</p>
                    <p className="mt-1">
                      {exercise.sets} séries x {exercise.reps}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;