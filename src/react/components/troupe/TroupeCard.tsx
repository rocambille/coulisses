import { Link } from "react-router";

interface TroupeCardProps {
  troupe: Troupe;
}

export default function TroupeCard({ troupe }: TroupeCardProps) {
  return (
    <article>
      <header>
        <Link to={`/troupes/${troupe.id}`}>
          <strong>{troupe.name}</strong>
        </Link>
      </header>
      <p>{troupe.description || "👺"}</p>
      {troupe.external_discussion_link && (
        <footer>
          <a
            href={troupe.external_discussion_link}
            target="_blank"
            rel="noreferrer"
          >
            Discussion externe
          </a>
        </footer>
      )}
    </article>
  );
}
