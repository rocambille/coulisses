interface RoleBadgeProps {
  name: string;
  className?: string;
}

export default function RoleBadge({ name, className }: RoleBadgeProps) {
  // In Pico CSS, <kbd> is often used to display small tags.
  return (
    <kbd
      className={className}
      style={{ padding: "0.5rem 1rem", fontWeight: "bold" }}
    >
      {name}
    </kbd>
  );
}
