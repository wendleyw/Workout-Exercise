// Vamos começar com a estrutura de pastas e arquivos principais

/*
workout-tracker/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ExerciseForm.tsx
│   │   ├── ExerciseCard.tsx
│   │   ├── WorkoutDay.tsx
│   │   ├── Header.tsx
│   │   └── ConfirmDialog.tsx
│   ├── types/
│   │   └── index.ts
│   ├── hooks/
│   │   └── useLocalStorage.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Exercises.tsx
│   │   ├── History.tsx
│   │   └── WeeklyPlan.tsx
│   ├── services/
│   │   └── imageService.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
*/

// Vamos criar os tipos principais
// src/types/index.ts
export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: string;
  imageUrl: string;
  muscleGroup: string;
}

export interface WorkoutDay {
  day: string;
  exercises: string[]; // IDs dos exercícios
  date?: string;
}

export interface WeeklyWorkout {
  id: string;
  week: string; // Formato: YYYY-MM-DD (início da semana)
  days: WorkoutDay[];
}

// src/hooks/useLocalStorage.ts
// Um hook personalizado para interagir com o localStorage
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar nosso valor
  // Passa a função inicial para o useState para que a lógica seja executada apenas uma vez
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      // Obtém do localStorage pelo key
      const item = window.localStorage.getItem(key);
      // Analisa o JSON armazenado ou retorna initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Se ocorrer um erro, retorna o initialValue
      console.log(error);
      return initialValue;
    }
  });
  
  // Retorna uma versão envolvida da função setter do useState que ...
  // ... persiste o novo valor para o localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permite que o valor seja uma função para que tenhamos a mesma API que o useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Salva o estado
      setStoredValue(valueToStore);
      // Salva para o localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Uma implementação mais avançada lidaria com o caso de erro
      console.log(error);
    }
  };
  
  return [storedValue, setValue] as const;
}

// src/services/imageService.ts
// Um serviço para buscar imagens de exercícios
// Usando a API do Unsplash como alternativa ao Google Images
const UNSPLASH_ACCESS_KEY = 'seu-access-key-unsplash'; // Você precisará criar uma conta e obter uma chave

export const getExerciseImage = async (exerciseName: string): Promise<string> => {
  try {
    // Para desenvolvimento e testes, podemos usar URLs de placeholder
    // Em produção, você usaria a API do Unsplash ou similar
    return `https://source.unsplash.com/300x200/?${encodeURIComponent(exerciseName + ' exercise')}`;

    // Implementação real com Unsplash:
    /*
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(exerciseName + ' exercise')}&per_page=1`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }
    
    // Retorna uma imagem padrão se não encontrar nada
    return '/placeholder-exercise.jpg';
    */
  } catch (error) {
    console.error('Error fetching exercise image:', error);
    return '/placeholder-exercise.jpg';
  }
};

// src/components/ExerciseCard.tsx
// Componente para exibir um exercício individual
import React from 'react';
import { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onEdit,
  onDelete,
  selectable = false,
  selected = false,
  onSelect
}) => {
  return (
    <div className={`border rounded-lg overflow-hidden shadow-md ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="h-48 bg-gray-200 overflow-hidden">
        <img 
          src={exercise.imageUrl} 
          alt={exercise.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{exercise.name}</h3>
        <p className="text-gray-600 text-sm">{exercise.muscleGroup}</p>
        <p className="text-gray-800 mt-2">{exercise.description}</p>
        <p className="mt-2 font-medium">
          {exercise.sets} séries x {exercise.reps}
        </p>
        
        <div className="mt-4 flex justify-between">
          {selectable ? (
            <button
              onClick={() => onSelect && onSelect(exercise.id)}
              className={`px-3 py-1 rounded ${selected ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {selected ? 'Selecionado' : 'Selecionar'}
            </button>
          ) : (
            <>
              <button
                onClick={() => onEdit(exercise.id)}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(exercise.id)}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Excluir
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;

// src/components/ExerciseForm.tsx
// Formulário para adicionar ou editar exercícios
import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { getExerciseImage } from '../services/imageService';

interface ExerciseFormProps {
  exercise?: Exercise;
  onSubmit: (exercise: Omit<Exercise, 'id' | 'imageUrl'>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const muscleGroups = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Calves', 'Forearms'
];

const ExerciseForm: React.FC<ExerciseFormProps> = ({
  exercise,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [name, setName] = useState(exercise?.name || '');
  const [description, setDescription] = useState(exercise?.description || '');
  const [sets, setSets] = useState(exercise?.sets || 3);
  const [reps, setReps] = useState(exercise?.reps || '8-12');
  const [muscleGroup, setMuscleGroup] = useState(exercise?.muscleGroup || muscleGroups[0]);
  const [previewImage, setPreviewImage] = useState(exercise?.imageUrl || '');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Função para buscar uma imagem de prévia quando o nome é alterado
  useEffect(() => {
    const fetchPreviewImage = async () => {
      if (name.trim().length > 3) {
        setIsLoadingPreview(true);
        const imageUrl = await getExerciseImage(name);
        setPreviewImage(imageUrl);
        setIsLoadingPreview(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchPreviewImage();
    }, 500);

    return () => clearTimeout(debounce);
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      description,
      sets,
      reps,
      muscleGroup
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nome do Exercício
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Grupo Muscular
        </label>
        <select
          value={muscleGroup}
          onChange={(e) => setMuscleGroup(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {muscleGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Séries
          </label>
          <input
            type="number"
            min="1"
            value={sets}
            onChange={(e) => setSets(parseInt(e.target.value))}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Repetições (ex: 8-12, até falha)
          </label>
          <input
            type="text"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      {previewImage && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Imagem de Prévia
          </label>
          <div className="mt-1 h-40 bg-gray-200 rounded-md overflow-hidden">
            <img 
              src={previewImage} 
              alt="Prévia do exercício" 
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Esta imagem será associada ao exercício
          </p>
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || isLoadingPreview}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};

export default ExerciseForm;

// src/components/WorkoutDay.tsx
// Componente para exibir e configurar os exercícios de um dia específico
import React, { useState } from 'react';
import { Exercise, WorkoutDay as WorkoutDayType } from '../types';

interface WorkoutDayProps {
  day: string;
  exercises: Exercise[];
  selectedExerciseIds: string[];
  allExercises: Exercise[];
  onSave: (day: string, exerciseIds: string[]) => void;
}

const WorkoutDay: React.FC<WorkoutDayProps> = ({
  day,
  exercises,
  selectedExerciseIds,
  allExercises,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedExerciseIds);
  
  const toggleExercise = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(exId => exId !== id)
        : [...prev, id]
    );
  };
  
  const handleSave = () => {
    onSave(day, selectedIds);
    setIsEditing(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{day}</h2>
        {isEditing ? (
          <div className="space-x-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Salvar
            </button>
            <button
              onClick={() => {
                setSelectedIds(selectedExerciseIds);
                setIsEditing(false);
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Editar
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          <h3 className="font-medium">Selecione os exercícios:</h3>
          {allExercises.map(exercise => (
            <div 
              key={exercise.id} 
              className={`p-2 border rounded cursor-pointer ${
                selectedIds.includes(exercise.id) ? 'bg-blue-100 border-blue-500' : ''
              }`}
              onClick={() => toggleExercise(exercise.id)}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(exercise.id)}
                  onChange={() => {}}
                  className="mr-2"
                />
                <div>
                  <p className="font-medium">{exercise.name}</p>
                  <p className="text-sm text-gray-600">
                    {exercise.muscleGroup} | {exercise.sets} x {exercise.reps}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {exercises.length === 0 ? (
            <p className="text-gray-500 italic">Nenhum exercício selecionado para este dia.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exercises.map(exercise => (
                <div key={exercise.id} className="border rounded p-3">
                  <div className="h-32 bg-gray-200 mb-2 rounded overflow-hidden">
                    <img 
                      src={exercise.imageUrl} 
                      alt={exercise.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium">{exercise.name}</h3>
                  <p className="text-sm text-gray-600">
                    {exercise.muscleGroup} | {exercise.sets} x {exercise.reps}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutDay;

// src/components/ConfirmDialog.tsx
// Componente de diálogo para confirmações de ações importantes
import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

// src/components/Header.tsx
// Componente de cabeçalho para navegação
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/exercises', label: 'Exercícios' },
    { path: '/weekly-plan', label: 'Plano Semanal' },
    { path: '/history', label: 'Histórico' },
  ];
  
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-xl font-bold">Workout Tracker</h1>
          
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {navItems.map(item => (
                <li key={item.path}>
                  <Link 
                    to={item.path}
                    className={`hover:text-blue-200 ${
                      location.pathname === item.path ? 'font-bold text-white' : 'text-blue-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="md:hidden">
            {/* Implementar menu mobile aqui */}
            <button className="text-white">
              ☰
            </button>
          </div>
        </div>
      </div>
      
      {/* Menu mobile - simplificado para este exemplo */}
      <div className="md:hidden">
        <div className="bg-blue-700 px-4 py-2">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={`block py-1 ${
                    location.pathname === item.path ? 'font-bold text-white' : 'text-blue-100'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;

// src/pages/Home.tsx
// Página inicial do aplicativo
import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Exercise, WeeklyWorkout } from '../types';

const Home: React.FC = () => {
  const [exercises] = useLocalStorage<Exercise[]>('exercises', []);
  const [weeklyWorkouts] = useLocalStorage<WeeklyWorkout[]>('weeklyWorkouts', []);
  
  // Obtém o treino da semana atual
  const getCurrentWeekWorkout = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo como início da semana
    
    const weekStartStr = startOfWeek.toISOString().split('T')[0];
    
    return weeklyWorkouts.find(workout => workout.week === weekStartStr);
  };
  
  const currentWorkout = getCurrentWeekWorkout();
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  const capitalizedToday = today.charAt(0).toUpperCase() + today.slice(1);
  
  // Encontra os exercícios para hoje
  const getTodayExercises = () => {
    if (!currentWorkout) return [];
    
    const todayWorkout = currentWorkout.days.find(
      day => day.day.toLowerCase() === capitalizedToday.toLowerCase()
    );
    
    if (!todayWorkout) return [];
    
    return todayWorkout.exercises.map(id => 
      exercises.find(ex => ex.id === id)
    ).filter(Boolean) as Exercise[];
  };
  
  const todayExercises = getTodayExercises();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Workout Tracker</h2>
        <p className="text-gray-700 mb-4">
          Seu assistente para acompanhar seus treinos e exercícios.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link 
            to="/exercises" 
            className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700"
          >
            <h3 className="text-lg font-semibold mb-2">Exercícios</h3>
            <p className="text-sm">Gerenciar {exercises.length} exercícios</p>
          </Link>
          
          <Link 
            to="/weekly-plan" 
            className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700"
          >
            <h3 className="text-lg font-semibold mb-2">Plano Semanal</h3>
            <p className="text-sm">Programar seus treinos da semana</p>
          </Link>
          
          <Link 
            to="/history" 
            className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700"
          >
            <h3 className="text-lg font-semibold mb-2">Histórico</h3>
            <p className="text-sm">Ver treinos anteriores</p>
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Treino de Hoje: {capitalizedToday}</h2>
        
        {todayExercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayExercises.map(exercise => (
              <div key={exercise.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="h-40 bg-gray-200">
                  <img 
                    src={exercise.imageUrl} 
                    alt={exercise.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-lg">{exercise.name}</h3>
                  <p className="text-sm text-gray-600">{exercise.muscleGroup}</p>
                  <p className="mt-1 font-medium">
                    {exercise.sets} séries x {exercise.reps}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum exercício planejado para hoje.</p>
            <Link 
              to="/weekly-plan" 
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Planejar Treino
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

// src/pages/Exercises.tsx
// Página para gerenciar exercícios
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ExerciseForm from '../components/ExerciseForm';
import ExerciseCard from '../components/ExerciseCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Exercise } from '../types';
import { getExerciseImage } from '../services/imageService';

const Exercises: React.FC = () => {
  const [exercises, setExercises] = useLocalStorage<Exercise[]>('exercises', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    exerciseId: '',
    exerciseName: ''
  });
  const [filterMuscleGroup, setFilterMuscleGroup] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Adicionar exercício
  const handleAddExercise = async (exerciseData: Omit<Exercise, 'id' | 'imageUrl'>) => {
    setIsLoading(true);
    try {
      const imageUrl = await getExerciseImage(exerciseData.name);
      
      const newExercise: Exercise = {
        id: uuidv4(),
        ...exerciseData,
        imageUrl
    };
      
      if (editingExercise) {
        // Atualizar exercício existente
        setExercises(prev => 
          prev.map(ex => ex.id === editingExercise.id ? { ...newExercise, id: editingExercise.id } : ex)
        );
      } else {
        // Adicionar novo exercício
        setExercises(prev => [...prev, newExercise]);
      }
      
      setIsFormOpen(false);
      setEditingExercise(null);
    } catch (error) {
      console.error('Error adding exercise:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Abrir formulário para editar exercício
  const handleEditExercise = (id: string) => {
    const exercise = exercises.find(ex => ex.id === id);
    if (exercise) {
      setEditingExercise(exercise);
      setIsFormOpen(true);
    }
  };
  
  // Abrir diálogo de confirmação para exclusão
  const handleDeleteClick = (id: string) => {
    const exercise = exercises.find(ex => ex.id === id);
    if (exercise) {
      setConfirmDialog({
        isOpen: true,
        exerciseId: id,
        exerciseName: exercise.name
      });
    }
  };
  
  // Excluir exercício após confirmação
  const handleConfirmDelete = () => {
    setExercises(prev => prev.filter(ex => ex.id !== confirmDialog.exerciseId));
    setConfirmDialog({ isOpen: false, exerciseId: '', exerciseName: '' });
  };
  
  // Filtrar exercícios conforme grupo muscular e termo de busca
  const filteredExercises = exercises.filter(exercise => {
    const matchesMuscleGroup = filterMuscleGroup ? exercise.muscleGroup === filterMuscleGroup : true;
    const matchesSearch = searchTerm 
      ? exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesMuscleGroup && matchesSearch;
  });
  
  // Obter lista única de grupos musculares
  const muscleGroups = Array.from(new Set(exercises.map(ex => ex.muscleGroup))).sort();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Exercícios</h1>
        <button
          onClick={() => {
            setEditingExercise(null);
            setIsFormOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Adicionar Exercício
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar Exercícios
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite para buscar..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Grupo
            </label>
            <select
              value={filterMuscleGroup}
              onChange={(e) => setFilterMuscleGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos</option>
              {muscleGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>
        
        {isFormOpen ? (
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingExercise ? 'Editar Exercício' : 'Adicionar Exercício'}
            </h2>
            <ExerciseForm
              exercise={editingExercise || undefined}
              onSubmit={handleAddExercise}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingExercise(null);
              }}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <>
            {filteredExercises.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExercises.map(exercise => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onEdit={handleEditExercise}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">
                  {exercises.length === 0
                    ? 'Nenhum exercício cadastrado ainda.'
                    : 'Nenhum exercício encontrado com os filtros atuais.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Excluir Exercício"
        message={`Tem certeza que deseja excluir o exercício "${confirmDialog.exerciseName}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, exerciseId: '', exerciseName: '' })}
      />
    </div>
  );
};

export default Exercises;