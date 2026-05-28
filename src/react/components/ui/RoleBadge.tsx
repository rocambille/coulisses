interface RoleBadgeProps {
  name: string;
  className?: string;
}

export default function RoleBadge({ name, className }: RoleBadgeProps) {
  // In Pico CSS, <kbd> is often used to display small tags.
  return (
    <kbd
      className={className}
      style={{ margin: "0 0.2rem", fontWeight: "bold" }}
    >
      {name}
    </kbd>
  );
}
