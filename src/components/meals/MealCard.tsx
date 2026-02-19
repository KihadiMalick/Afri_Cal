import type { Meal } from "@/types";

interface MealCardProps {
  meal: Meal;
}

export default function MealCard({ meal }: MealCardProps) {
  return (
    <div className="card flex items-center gap-4">
      {meal.image_url ? (
        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
          {/* Image will be loaded here */}
        </div>
      ) : (
        <div className="w-16 h-16 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">&#x1F372;</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{meal.name}</h3>
        {meal.description && (
          <p className="text-sm text-gray-500 truncate">{meal.description}</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-primary-600">{meal.calories}</p>
        <p className="text-xs text-gray-400">kcal</p>
      </div>
    </div>
  );
}
