import {
  Target,
  Circle,
  Square,
  Users,
  Flag,
  Slash,
  AlertCircle,
  Clock,
  Trophy,
} from "lucide-react";

export const getEventColor = (eventType: string) => {
  switch (eventType) {
    case "goal":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "card_yellow":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "card_red":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "substitution":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "match_start":
    case "half_time":
    case "match_end":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

export const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case "goal":
      return <Trophy className="h-5 w-5 text-green-500" />;
    case "card_yellow":
      return <Square className="h-5 w-5 text-yellow-500" />;
    case "card_red":
      return <Square className="h-5 w-5 text-red-500" />;
    case "substitution":
      return <Users className="h-5 w-5 text-blue-500" />;
    case "shot_on_target":
      return <Target className="h-5 w-5 text-blue-400" />;
    case "shot_off_target":
      return <Circle className="h-5 w-5 text-gray-400" />;
    case "corner":
      return <Flag className="h-5 w-5 text-orange-500" />;
    case "penalty":
      return <AlertCircle className="h-5 w-5 text-red-400" />;
    case "offside":
      return <Slash className="h-5 w-5 text-gray-500" />;
    case "foul":
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
    case "match_start":
    case "half_time":
    case "match_end":
      return <Clock className="h-5 w-5 text-purple-500" />;
    default:
      return <Circle className="h-5 w-5 text-gray-400" />;
  }
};
