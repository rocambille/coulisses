/*
  Purpose:
  Calendar Page for displaying and managing events (shows and rehearsals).
  Route: /plays/:playId/calendar
*/

import { use, useState } from "react";
import { useParams } from "react-router";
import z, { ZodError } from "zod";

import { cache } from "../../helpers/cache";
import {
  fromInputParts,
  toDisplayString,
  toInputDate,
  toInputTime,
} from "../../helpers/datetime";
import { useMutate } from "../../helpers/mutate";
import { useMembership } from "./hooks";

type EventData = {
  id: RowId;
  play_id: RowId;
  type: "SHOW" | "FIXED_REHEARSAL" | "AUTO_REHEARSAL";
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
};

const eventSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  type: z.enum(["SHOW", "FIXED_REHEARSAL", "AUTO_REHEARSAL"]),
  start_date: z.iso.date(),
  start_time: z.iso.time(),
  end_date: z.iso.date(),
  end_time: z.iso.time(),
  location: z.string().nullable(),
  description: z.string().nullable(),
});

const validate = (data: FormData) => {
  const title = data.get("title")?.toString();
  const type = data.get("type")?.toString();
  const startDate = data.get("start_date")?.toString();
  const startTime = data.get("start_time")?.toString();
  const endDate = data.get("end_date")?.toString();
  const endTime = data.get("end_time")?.toString();
  const location = data.get("location")?.toString();
  const description = data.get("description")?.toString();

  const parsed = eventSchema.safeParse({
    title,
    type,
    start_date: startDate,
    start_time: startTime,
    end_date: endDate,
    end_time: endTime,
    location,
    description,
  });

  if (!parsed.success) {
    throw parsed.error;
  }

  return {
    type: parsed.data.type,
    title: parsed.data.title,
    description: parsed.data.description,
    location: parsed.data.location,
    start_time: fromInputParts(
      parsed.data.start_date,
      parsed.data.start_time,
    ).toISOString(),
    end_time: fromInputParts(
      parsed.data.end_date,
      parsed.data.end_time,
    ).toISOString(),
  };
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Convert Sunday=0 to Monday=0
}

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function CalendarPage() {
  const { playId } = useParams();
  const mutate = useMutate();
  const { isTeacher } = useMembership(playId);

  const events: EventData[] = use(cache(`/api/plays/${playId}/events`));

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const currentMonthEvents = events.filter((e) => {
    const d = new Date(e.start_time);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const handleAdd = async (formData: FormData) => {
    try {
      const parsedData = validate(formData);

      const response = await mutate(
        `/api/plays/${playId}/events`,
        "post",
        parsedData,
        [`/api/plays/${playId}/events`],
      );

      if (response.ok) {
        setShowAddModal(false);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        alert(z.prettifyError(err));
      }
    }
  };

  const handleEdit = async (formData: FormData) => {
    if (!selectedEvent) return;

    try {
      const parsedData = validate(formData);

      const response = await mutate(
        `/api/events/${selectedEvent.id}`,
        "put",
        parsedData,
        [`/api/plays/${playId}/events`],
      );

      if (response.ok) {
        setSelectedEvent(null);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        alert(z.prettifyError(err));
      }
    }
  };

  const handleDelete = async (eventId: EventData["id"]) => {
    if (!confirm("Delete this event?")) return;
    const response = await mutate(
      `/api/events/${eventId}`,
      "delete",
      undefined,
      [`/api/plays/${playId}/events`],
    );

    if (response.ok) {
      setSelectedEvent(null);
    }
  };

  return (
    <>
      <hgroup>
        <h2>Calendrier</h2>
        <p>
          Répétitions et représentations.
          <br />
          <small>Tous les horaires sont affichés à l'heure de Paris.</small>
        </p>
      </hgroup>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <button
          type="button"
          className="secondary outline"
          onClick={prevMonth}
          style={{ width: "auto" }}
        >
          &lt;
        </button>
        <h3 style={{ margin: 0 }}>
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <button
          type="button"
          className="secondary outline"
          onClick={nextMonth}
          style={{ width: "auto" }}
        >
          &gt;
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "0.25rem",
        }}
      >
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
          <div
            key={day}
            style={{
              textAlign: "center",
              fontWeight: "bold",
              padding: "0.5rem",
            }}
          >
            {day}
          </div>
        ))}

        {Array.from({ length: firstDay }).map((_, i) => {
          const emptyDate = new Date(
            currentYear,
            currentMonth,
            -firstDay + i + 1,
          );
          return (
            <div
              key={emptyDate.toISOString()}
              style={{
                padding: "0.5rem",
                minHeight: "100px",
                backgroundColor: "var(--pico-secondary-background-color)",
                opacity: 0.5,
              }}
            ></div>
          );
        })}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          // Create a local date for the current day (noon to avoid DST edge cases)
          const currentDayDate = new Date(currentYear, currentMonth, day, 12);
          const dayEvents = currentMonthEvents.filter(
            (e) => new Date(e.start_time).getDate() === day,
          );

          return (
            <div
              key={currentDayDate.toISOString()}
              style={{
                position: "relative",
                padding: "0.5rem",
                minHeight: "100px",
                border: "1px solid var(--pico-muted-border-color)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                backgroundColor: "var(--pico-background-color)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {isTeacher && (
                <button
                  type="button"
                  aria-label={`Ajouter un événement le ${toInputDate(currentDayDate)}`}
                  onClick={() => {
                    setSelectedDate(currentDayDate);
                    setShowAddModal(true);
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 1,
                    border: "none",
                    background: "transparent",
                  }}
                />
              )}
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  position: "relative",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
                aria-hidden="true"
              >
                {day}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                  flexGrow: 1,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {dayEvents.map((e) => (
                  <button
                    type="button"
                    key={e.id}
                    aria-label={e.title}
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setSelectedEvent(e);
                    }}
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.25rem",
                      borderRadius: "0.25rem",
                      backgroundColor:
                        e.type === "SHOW"
                          ? "var(--pico-primary-background)"
                          : "var(--pico-secondary-background)",
                      color:
                        e.type === "SHOW"
                          ? "var(--pico-primary-inverse)"
                          : "var(--pico-secondary-inverse)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {e.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && isTeacher && (
        <dialog open>
          <article>
            <header>
              <button
                type="button"
                rel="prev"
                aria-label="Fermer"
                onClick={() => setShowAddModal(false)}
              ></button>
              Nouvel événement
            </header>
            <form aria-label="event form" action={handleAdd}>
              <label>
                Titre
                <input name="title" required />
              </label>

              <label>
                Type
                <select name="type" required>
                  <option value="SHOW">Représentation</option>
                  <option value="FIXED_REHEARSAL">Répétition</option>
                </select>
              </label>

              <div className="grid">
                <label>
                  Date de début
                  <input
                    name="start_date"
                    type="date"
                    defaultValue={
                      selectedDate ? toInputDate(selectedDate) : undefined
                    }
                    required
                  />
                </label>
                <label>
                  Heure
                  <input
                    name="start_time"
                    type="time"
                    defaultValue={
                      selectedDate ? toInputTime(selectedDate) : undefined
                    }
                    required
                  />
                </label>
              </div>

              <div className="grid">
                <label>
                  Date de fin
                  <input
                    name="end_date"
                    type="date"
                    defaultValue={
                      selectedDate ? toInputDate(selectedDate) : undefined
                    }
                    required
                  />
                </label>
                <label>
                  Heure
                  <input
                    name="end_time"
                    type="time"
                    defaultValue={
                      selectedDate ? toInputTime(selectedDate) : undefined
                    }
                    required
                  />
                </label>
              </div>

              <label>
                Lieu
                <input name="location" />
              </label>

              <label>
                Description
                <textarea name="description" />
              </label>

              <footer>
                <button type="submit">Ajouter</button>
              </footer>
            </form>
          </article>
        </dialog>
      )}

      {selectedEvent && (
        <dialog open>
          <article>
            <header>
              <button
                type="button"
                rel="prev"
                aria-label="Fermer"
                onClick={() => {
                  setSelectedEvent(null);
                }}
              ></button>
            </header>
            {isTeacher ? (
              <form aria-label="event form" action={handleEdit}>
                <label>
                  Titre
                  <input
                    name="title"
                    defaultValue={selectedEvent.title}
                    required
                  />
                </label>

                <label>
                  Type
                  <select
                    name="type"
                    defaultValue={selectedEvent.type}
                    required
                  >
                    <option value="SHOW">Représentation</option>
                    <option value="FIXED_REHEARSAL">Répétition</option>
                  </select>
                </label>

                <div className="grid">
                  <label>
                    Date de début
                    <input
                      name="start_date"
                      type="date"
                      defaultValue={toInputDate(selectedEvent.start_time)}
                      required
                    />
                  </label>
                  <label>
                    Heure
                    <input
                      name="start_time"
                      type="time"
                      defaultValue={toInputTime(selectedEvent.start_time)}
                      required
                    />
                  </label>
                </div>

                <div className="grid">
                  <label>
                    Date de fin
                    <input
                      name="end_date"
                      type="date"
                      defaultValue={toInputDate(selectedEvent.end_time)}
                      required
                    />
                  </label>
                  <label>
                    Heure
                    <input
                      name="end_time"
                      type="time"
                      defaultValue={toInputTime(selectedEvent.end_time)}
                      required
                    />
                  </label>
                </div>

                <label>
                  Lieu
                  <input
                    name="location"
                    defaultValue={selectedEvent.location}
                  />
                </label>

                <label>
                  Description
                  <textarea
                    name="description"
                    defaultValue={selectedEvent.description}
                  />
                </label>

                <footer>
                  <button
                    type="button"
                    className="contrast"
                    onClick={() => handleDelete(selectedEvent.id)}
                  >
                    Supprimer
                  </button>
                  <button type="submit">Enregistrer</button>
                </footer>
              </form>
            ) : (
              <p>
                <strong>Type:</strong>{" "}
                {selectedEvent.type === "SHOW"
                  ? "🎭 Représentation"
                  : "📅 Répétition"}
                <br />
                <strong>Début:</strong>{" "}
                {toDisplayString(selectedEvent.start_time)}
                <br />
                <strong>Fin:</strong> {toDisplayString(selectedEvent.end_time)}
                <br />
                {selectedEvent.location && (
                  <>
                    <strong>Lieu:</strong> {selectedEvent.location}
                    <br />
                  </>
                )}
                {selectedEvent.description && (
                  <>
                    <strong>Description:</strong> {selectedEvent.description}
                  </>
                )}
              </p>
            )}
          </article>
        </dialog>
      )}
    </>
  );
}

export default CalendarPage;
