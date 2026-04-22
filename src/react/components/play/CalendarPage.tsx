/*
  Purpose:
  Calendar Page for displaying and managing events (shows and rehearsals).
  Route: /plays/:playId/calendar
*/

import { use, useState } from "react";
import { useParams } from "react-router";
import { useMutate } from "../RefreshContext";
import { cache } from "../utils";
import { useMembership } from "./hooks";

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
    const title = formData.get("title")?.toString();
    const type = formData.get("type")?.toString();
    const startDate = formData.get("start_date")?.toString();
    const startTime = formData.get("start_time")?.toString();
    const endDate = formData.get("end_date")?.toString();
    const endTime = formData.get("end_time")?.toString();
    const location = formData.get("location")?.toString();
    const description = formData.get("description")?.toString();

    if (!title || !type || !startDate || !startTime || !endDate || !endTime) {
      throw new Error("Invalid form submission");
    }

    const start_time = new Date(`${startDate}T${startTime}`).toISOString();
    const end_time = new Date(`${endDate}T${endTime}`).toISOString();

    const response = await mutate(
      `/api/plays/${playId}/events`,
      "post",
      {
        title,
        type,
        start_time,
        end_time,
        location,
        description,
      },
      [`/api/plays/${playId}/events`],
    );

    if (response.ok) {
      setShowAddModal(false);
    }
  };

  const handleEdit = async (formData: FormData) => {
    if (!selectedEvent) return;

    const title = formData.get("title")?.toString();
    const type = formData.get("type")?.toString();
    const startDate = formData.get("start_date")?.toString();
    const startTime = formData.get("start_time")?.toString();
    const endDate = formData.get("end_date")?.toString();
    const endTime = formData.get("end_time")?.toString();
    const location = formData.get("location")?.toString();
    const description = formData.get("description")?.toString();

    if (!title || !type || !startDate || !startTime || !endDate || !endTime) {
      throw new Error("Invalid form submission");
    }

    const start_time = `${startDate}T${startTime}:00.000Z`;
    const end_time = `${endDate}T${endTime}:00.000Z`;

    const response = await mutate(
      `/api/events/${selectedEvent.id}`,
      "put",
      {
        type,
        title,
        description,
        location,
        start_time,
        end_time,
      },
      [`/api/plays/${playId}/events`],
    );

    if (response.ok) {
      setSelectedEvent(null);
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
        <p>Répétitions et représentations.</p>
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
          const timeZoneOffset = new Date().getTimezoneOffset() / 60;
          const currentDayDate = new Date(
            `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T${12 - timeZoneOffset}:00:00.000Z`,
          );
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
                  aria-label={`Ajouter un événement le ${currentDayDate.toISOString().split("T")[0]}`}
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
            <form action={handleAdd}>
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
                    defaultValue={selectedDate?.toISOString().split("T")[0]}
                    required
                  />
                </label>
                <label>
                  Heure
                  <input
                    name="start_time"
                    type="time"
                    defaultValue={selectedDate
                      ?.toISOString()
                      .split("T")[1]
                      .slice(0, 5)}
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
                    defaultValue={selectedDate?.toISOString().split("T")[0]}
                    required
                  />
                </label>
                <label>
                  Heure
                  <input
                    name="end_time"
                    type="time"
                    defaultValue={selectedDate
                      ?.toISOString()
                      .split("T")[1]
                      .slice(0, 5)}
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
              <form action={handleEdit}>
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
                      defaultValue={selectedEvent.start_time.split("T")[0]}
                      required
                    />
                  </label>
                  <label>
                    Heure
                    <input
                      name="start_time"
                      type="time"
                      defaultValue={selectedEvent.start_time
                        .split("T")[1]
                        .slice(0, 5)}
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
                      defaultValue={selectedEvent.end_time.split("T")[0]}
                      required
                    />
                  </label>
                  <label>
                    Heure
                    <input
                      name="end_time"
                      type="time"
                      defaultValue={selectedEvent.end_time
                        .split("T")[1]
                        .slice(0, 5)}
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
                {new Date(selectedEvent.start_time).toLocaleString()}
                <br />
                <strong>Fin:</strong>{" "}
                {new Date(selectedEvent.end_time).toLocaleString()}
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
