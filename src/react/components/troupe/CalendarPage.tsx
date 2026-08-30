/*
  Purpose:
  Calendar Page for displaying and managing events (shows and rehearsals).
  Route: /plays/:playId/calendar
*/

import { use, useId, useState } from "react";
import { useParams } from "react-router";
import { z } from "zod";
import type { $ZodIssue as ZodIssue } from "zod/v4/core";

import { getOrFetch } from "../../helpers/cache";
import {
  fromInputParts,
  toDisplayString,
  toInputDate,
  toInputTime,
} from "../../helpers/datetime";
import { useMutate } from "../../helpers/mutate";
import { useMe } from "../auth/MeContext";
import { FormError, hasError } from "../FormError";
import Modal from "../ui/Modal";
import PresenceToggle from "../ui/PresenceToggle";

const eventSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  type: z.enum(["SHOW", "COURSE", "REHEARSAL", "OTHER"]),
  start_date: z.iso.date("Date de début invalide"),
  start_time: z.iso.time("Heure de début invalide"),
  end_date: z.iso.date("Date de fin invalide"),
  end_time: z.iso.time("Heure de fin invalide"),
  location: z.string(),
  description: z.string(),
});

const validate = (data: FormData) => {
  const title = data.get("title")?.toString();
  const type = data.get("type")?.toString();
  const startDate = data.get("start_date")?.toString();
  const startTime = data.get("start_time")?.toString();
  const endDate = data.get("end_date")?.toString();
  const endTime = data.get("end_time")?.toString();
  const location = data.get("location")?.toString() ?? "";
  const description = data.get("description")?.toString() ?? "";

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
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(Date.UTC(year, month, 1)).getUTCDay();
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
  const { troupeId } = useParams();
  const { user } = useMe();
  const mutate = useMutate();

  const events: EventData[] = use(
    getOrFetch<EventData[]>(`/api/troupes/${troupeId}/events`),
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [addErrors, setAddErrors] = useState<ZodIssue[]>([]);
  const [editErrors, setEditErrors] = useState<ZodIssue[]>([]);

  const addTitleId = useId();
  const addTypeId = useId();
  const addStartDateId = useId();
  const addStartTimeId = useId();
  const addEndDateId = useId();
  const addEndTimeId = useId();
  const addLocationId = useId();
  const addDescriptionId = useId();

  const editTitleId = useId();
  const editTypeId = useId();
  const editStartDateId = useId();
  const editStartTimeId = useId();
  const editEndDateId = useId();
  const editEndTimeId = useId();
  const editLocationId = useId();
  const editDescriptionId = useId();

  const [currentYear, currentMonth] = toInputDate(currentDate.toISOString())
    .split("-")
    .map((v, i) => (i === 1 ? Number(v) - 1 : Number(v)));

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    setCurrentDate(new Date(Date.UTC(currentYear, currentMonth - 1, 1)));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(Date.UTC(currentYear, currentMonth + 1, 1)));
  };

  const showAddModal = selectedDate != null;

  const handleAdd = async (formData: FormData) => {
    try {
      const parsedData = validate(formData);
      setAddErrors([]);

      const response = await mutate(
        `/api/troupes/${troupeId}/events`,
        "post",
        parsedData,
        [`/api/troupes/${troupeId}/events`],
      );

      if (response.ok) {
        setSelectedDate(null);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setAddErrors(err.issues);
      }
    }
  };

  const handleEdit = async (formData: FormData) => {
    if (!selectedEvent) return;

    try {
      const parsedData = validate(formData);
      setEditErrors([]);

      const response = await mutate(
        `/api/events/${selectedEvent.id}`,
        "put",
        parsedData,
        [`/api/troupes/${troupeId}/events`],
      );

      if (response.ok) {
        setSelectedEvent(null);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setEditErrors(err.issues);
      }
    }
  };

  const handleDelete = async (eventId: EventData["id"]) => {
    if (!confirm("Delete this event?")) return;
    const response = await mutate(
      `/api/events/${eventId}`,
      "delete",
      undefined,
      [`/api/troupes/${troupeId}/events`],
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
        <button type="button" className="secondary outline" onClick={prevMonth}>
          &lt;
        </button>
        <h3 style={{ margin: 0 }}>
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <button type="button" className="secondary outline" onClick={nextMonth}>
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

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          // Create a date in the configured timezone (noon to avoid DST edge cases)
          const currentDayDate = fromInputParts(dateStr, "12:00");
          const dayEvents = events.filter(
            (e) => toInputDate(e.start_time) === dateStr,
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
                gridColumnStart: i === 0 ? firstDay + 1 : "initial",
              }}
            >
              <button
                type="button"
                aria-label={`Ajouter un événement le ${toInputDate(currentDayDate.toISOString())}`}
                onClick={() => {
                  setAddErrors([]);
                  setSelectedDate(currentDayDate);
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
                      setEditErrors([]);
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

      {showAddModal && selectedDate && (
        <Modal
          title="Nouvel événement"
          onClose={() => {
            setAddErrors([]);
            setSelectedDate(null);
          }}
        >
          <form
            aria-label="Formulaire d'ajout d'un événement"
            action={handleAdd}
          >
            <label htmlFor={addTitleId}>
              Titre
              <input
                id={addTitleId}
                name="title"
                required
                aria-invalid={hasError(addErrors, "title") || undefined}
                aria-describedby={`${addTitleId}-error`}
              />
              <FormError
                issues={addErrors}
                name="title"
                id={`${addTitleId}-error`}
              />
            </label>

            <label htmlFor={addTypeId}>
              Type
              <select id={addTypeId} name="type" required>
                <option value="SHOW">Représentation</option>
                <option value="REHEARSAL">Répétition</option>
                <option value="COURSE">Cours</option>
                <option value="OTHER">Autre</option>
              </select>
            </label>

            <div className="grid">
              <label htmlFor={addStartDateId}>
                Date de début
                <input
                  id={addStartDateId}
                  name="start_date"
                  type="date"
                  defaultValue={toInputDate(selectedDate.toISOString())}
                  required
                  aria-invalid={hasError(addErrors, "start_date") || undefined}
                  aria-describedby={`${addStartDateId}-error`}
                />
                <FormError
                  issues={addErrors}
                  name="start_date"
                  id={`${addStartDateId}-error`}
                />
              </label>
              <label htmlFor={addStartTimeId}>
                Heure
                <input
                  id={addStartTimeId}
                  name="start_time"
                  type="time"
                  defaultValue={toInputTime(selectedDate.toISOString())}
                  required
                  aria-invalid={hasError(addErrors, "start_time") || undefined}
                  aria-describedby={`${addStartTimeId}-error`}
                />
                <FormError
                  issues={addErrors}
                  name="start_time"
                  id={`${addStartTimeId}-error`}
                />
              </label>
            </div>

            <div className="grid">
              <label htmlFor={addEndDateId}>
                Date de fin
                <input
                  id={addEndDateId}
                  name="end_date"
                  type="date"
                  defaultValue={toInputDate(selectedDate.toISOString())}
                  required
                  aria-invalid={hasError(addErrors, "end_date") || undefined}
                  aria-describedby={`${addEndDateId}-error`}
                />
                <FormError
                  issues={addErrors}
                  name="end_date"
                  id={`${addEndDateId}-error`}
                />
              </label>
              <label htmlFor={addEndTimeId}>
                Heure
                <input
                  id={addEndTimeId}
                  name="end_time"
                  type="time"
                  defaultValue={toInputTime(selectedDate.toISOString())}
                  required
                  aria-invalid={hasError(addErrors, "end_time") || undefined}
                  aria-describedby={`${addEndTimeId}-error`}
                />
                <FormError
                  issues={addErrors}
                  name="end_time"
                  id={`${addEndTimeId}-error`}
                />
              </label>
            </div>

            <label htmlFor={addLocationId}>
              Lieu
              <input id={addLocationId} name="location" />
            </label>

            <label htmlFor={addDescriptionId}>
              Description
              <textarea id={addDescriptionId} name="description" />
            </label>

            <footer
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "0.5rem",
                justifyContent: "end",
              }}
            >
              <button
                type="button"
                className="secondary outline"
                onClick={() => {
                  setAddErrors([]);
                  setSelectedDate(null);
                }}
              >
                Annuler
              </button>
              <button type="submit" style={{ width: "initial" }}>
                Ajouter
              </button>
            </footer>
          </form>
        </Modal>
      )}

      {selectedEvent && (
        <Modal
          title="Détails de l'événement"
          onClose={() => {
            setEditErrors([]);
            setSelectedEvent(null);
          }}
        >
          {selectedEvent.owner_id === user?.id ? (
            <form
              aria-label={`Formulaire de modification de l'événement ${selectedEvent.id}`}
              action={handleEdit}
            >
              <label htmlFor={editTitleId}>
                Titre
                <input
                  id={editTitleId}
                  name="title"
                  defaultValue={selectedEvent.title}
                  required
                  aria-invalid={hasError(editErrors, "title") || undefined}
                  aria-describedby={`${editTitleId}-error`}
                />
                <FormError
                  issues={editErrors}
                  name="title"
                  id={`${editTitleId}-error`}
                />
              </label>

              <label htmlFor={editTypeId}>
                Type
                <select
                  id={editTypeId}
                  name="type"
                  defaultValue={selectedEvent.type}
                  required
                >
                  <option value="SHOW">Représentation</option>
                  <option value="REHEARSAL">Répétition</option>
                  <option value="COURSE">Cours</option>
                  <option value="OTHER">Autre</option>
                </select>
              </label>

              <div className="grid">
                <label htmlFor={editStartDateId}>
                  Date de début
                  <input
                    id={editStartDateId}
                    name="start_date"
                    type="date"
                    defaultValue={toInputDate(selectedEvent.start_time)}
                    required
                    aria-invalid={
                      hasError(editErrors, "start_date") || undefined
                    }
                    aria-describedby={`${editStartDateId}-error`}
                  />
                  <FormError
                    issues={editErrors}
                    name="start_date"
                    id={`${editStartDateId}-error`}
                  />
                </label>
                <label htmlFor={editStartTimeId}>
                  Heure
                  <input
                    id={editStartTimeId}
                    name="start_time"
                    type="time"
                    defaultValue={toInputTime(selectedEvent.start_time)}
                    required
                    aria-invalid={
                      hasError(editErrors, "start_time") || undefined
                    }
                    aria-describedby={`${editStartTimeId}-error`}
                  />
                  <FormError
                    issues={editErrors}
                    name="start_time"
                    id={`${editStartTimeId}-error`}
                  />
                </label>
              </div>

              <div className="grid">
                <label htmlFor={editEndDateId}>
                  Date de fin
                  <input
                    id={editEndDateId}
                    name="end_date"
                    type="date"
                    defaultValue={toInputDate(selectedEvent.end_time)}
                    required
                    aria-invalid={hasError(editErrors, "end_date") || undefined}
                    aria-describedby={`${editEndDateId}-error`}
                  />
                  <FormError
                    issues={editErrors}
                    name="end_date"
                    id={`${editEndDateId}-error`}
                  />
                </label>
                <label htmlFor={editEndTimeId}>
                  Heure
                  <input
                    id={editEndTimeId}
                    name="end_time"
                    type="time"
                    defaultValue={toInputTime(selectedEvent.end_time)}
                    required
                    aria-invalid={hasError(editErrors, "end_time") || undefined}
                    aria-describedby={`${editEndTimeId}-error`}
                  />
                  <FormError
                    issues={editErrors}
                    name="end_time"
                    id={`${editEndTimeId}-error`}
                  />
                </label>
              </div>

              <label htmlFor={editLocationId}>
                Lieu
                <input
                  id={editLocationId}
                  name="location"
                  defaultValue={selectedEvent.location}
                />
              </label>

              <label htmlFor={editDescriptionId}>
                Description
                <textarea
                  id={editDescriptionId}
                  name="description"
                  defaultValue={selectedEvent.description}
                />
              </label>

              <footer
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "end",
                }}
              >
                <button
                  type="button"
                  className="contrast outline"
                  onClick={() => handleDelete(selectedEvent.id)}
                >
                  Supprimer
                </button>
                <button type="submit" style={{ width: "initial" }}>
                  Enregistrer
                </button>
              </footer>
            </form>
          ) : (
            <div>
              <strong>Type:</strong>{" "}
              {selectedEvent.type === "SHOW"
                ? "🎭 Représentation"
                : selectedEvent.type === "REHEARSAL"
                  ? "📅 Répétition"
                  : selectedEvent.type === "COURSE"
                    ? "🎓 Cours"
                    : "📌 Autre"}
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
              <div style={{ marginTop: "1rem" }}>
                <strong>Ma présence : </strong>
                <PresenceToggle
                  eventId={Number(selectedEvent.id)}
                  initialStatus="PENDING"
                />
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

export default CalendarPage;
