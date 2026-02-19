import type { Activity } from "@/types";

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
        <span className="text-xl">&#x1F3C3;</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{activity.name}</h3>
        <p className="text-sm text-gray-500">{activity.duration_minutes} min</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-green-600">-{activity.calories_burned}</p>
        <p className="text-xs text-gray-400">kcal</p>
      </div>
    </div>
  );
}
