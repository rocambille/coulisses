type PreferenceLevel = "HIGH" | "MEDIUM" | "LOW" | "NOT_INTERESTED";

interface PreferenceBadgeProps {
  level: PreferenceLevel;
  className?: string;
  onClick?: () => void;
}

const LEVEL_MAP: Record<
  PreferenceLevel,
  { label: string; color: string; emoji: string }
> = {
  HIGH: { label: "Très envie", color: "ins", emoji: "🔥" },
  MEDIUM: { label: "Pourquoi pas", color: "mark", emoji: "👍" },
  LOW: { label: "Pas trop", color: "kbd", emoji: "🤏" },
  NOT_INTERESTED: { label: "Pas du tout", color: "del", emoji: "❌" },
};

export default function PreferenceBadge({
  level,
  className,
}: PreferenceBadgeProps) {
  const { color, emoji } = LEVEL_MAP[level];

  const style = {
    display: "inline-block",
    padding: "0.2rem 0.5rem",
    borderRadius: "0.25rem",
    margin: "0 0.1rem",
  };
  const title = LEVEL_MAP[level].label;

  switch (color) {
    case "ins":
      return (
        <ins className={className} style={style} title={title}>
          {emoji}
        </ins>
      );
    case "mark":
      return (
        <mark className={className} style={style} title={title}>
          {emoji}
        </mark>
      );
    case "kbd":
      return (
        <kbd className={className} style={style} title={title}>
          {emoji}
        </kbd>
      );
    case "del":
      return (
        <del className={className} style={style} title={title}>
          {emoji}
        </del>
      );
    default:
      return (
        <span className={className} style={style} title={title}>
          {emoji}
        </span>
      );
  }
}
