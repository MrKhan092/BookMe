import { useState, useEffect } from "react";
import { listAvailability, saveAvailability } from "../api/client";
import { availabilityPageStyles as s } from "../assets/dummyStyles";
import heroImg from "../assets/P5.png";
import {
  Check,
  Plus,
  Trash2,
  Clock,
  CalendarDays,
  Save,
  Info,
} from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const defaultWindow = { start: "09:00", end: "17:00" };

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState({});
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const numberToDay = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    listAvailability()
      .then((r) => {
        const data = r.data.availability || r.data || [];
        const obj = {};
        if (Array.isArray(data)) {
          data.forEach((item) => {
            const dayName = item.day || numberToDay[item.dayOfWeek];
            if (dayName) {
              obj[dayName] = (item.slot || item.windows || []).map((s) => ({
                start: s.start || s.startTime || "",
                end: s.end || s.endTime || "",
              }));
            }
          });
        }
        setAvailability(obj);
      })
      .catch(() => {});
  }, []);

  const dayWindows = availability[selectedDay] || [];
  const isDayActive = dayWindows.length > 0;

  const toggleDay = (day) => {
    setAvailability((prev) => {
      const copy = { ...prev };
      if (copy[day] && copy[day].length > 0) {
        copy[day] = [];
      } else {
        copy[day] = [{ ...defaultWindow }];
      }
      return copy;
    });
    setSelectedDay(day);
  };

  const addWindow = () => {
    setAvailability((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), { ...defaultWindow }],
    }));
  };

  const removeWindow = (idx) => {
    setAvailability((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter((_, i) => i !== idx),
    }));
  };

  const updateWindow = (idx, field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map((w, i) =>
        i === idx ? { ...w, [field]: value } : w
      ),
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      // Backend expects one call per day with { dayOfWeek: 0-6, slot: [...] }
      // DAYS array: Monday=0 index, but dayOfWeek: 0=Sunday,1=Monday,...,6=Saturday
      const dayToNumber = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };

      const promises = DAYS.map((day) => {
        const windows = availability[day] || [];
        const slot = windows.map((w) => ({
          startTime: w.start || w.startTime,
          endTime: w.end || w.endTime,
        }));
        return saveAvailability({ dayOfWeek: dayToNumber[day], slot });
      });

      await Promise.all(promises);
      setMessage("Availability saved!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.mainGrid}>
      {/* ── Left ── */}
      <div>
        <div className={s.leftTopArea}>
          <div>
            <div className={s.availabilityLabel}>AVAILABILITY</div>
            <h1 className={s.mainHeading}>
              Set when you're
              <br />
              <span className={s.gradientText}>available.</span>
            </h1>
            <p className={s.subText}>
              Choose your working days and time windows. Customers can only book
              during these hours.
            </p>
          </div>
          <div className={s.illustrationContainer}>
            <img src={heroImg} alt="" className={s.illustrationImg} />
          </div>
        </div>

        {/* Day list */}
        <div className={s.dayListContainer}>
          {DAYS.map((day) => {
            const active =
              availability[day] && availability[day].length > 0;
            return (
              <button
                key={day}
                className={active ? s.dayButtonActive : s.dayButtonInactive}
                onClick={() => {
                  setSelectedDay(day);
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={
                      active
                        ? s.dayIconContainerActive
                        : s.dayIconContainerInactive
                    }
                  >
                    <CalendarDays className={s.dayIcon} />
                  </div>
                  <span
                    className={active ? s.dayLabelActive : s.dayLabelInactive}
                  >
                    {day}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDay(day);
                  }}
                >
                  {active ? (
                    <div className={s.dayCheckActiveContainer}>
                      <Check className={s.dayCheckActiveIcon} />
                    </div>
                  ) : (
                    <div className={s.dayCheckInactiveCircle} />
                  )}
                </button>
              </button>
            );
          })}
        </div>

        <div className={s.infoBox}>
          <Info className={s.infoBoxIcon} />
          <p className={s.infoBoxText}>
            <strong className={s.infoBoxStrong}>Tip:</strong> Click the circle
            to toggle a day on/off. Click the day name to edit time windows.
          </p>
        </div>
      </div>

      {/* ── Right ── */}
      <div className={s.rightSection}>
        <div className={s.rightTopBar}>
          <div className={s.rightTopLeft}>
            <div className={s.rightTopIconContainer}>
              <CalendarDays className={s.rightTopCalendarIcon} />
            </div>
            <div>
              <div className={s.rightDayName}>{selectedDay}</div>
              <div className={s.rightSummaryText}>
                {isDayActive
                  ? `${dayWindows.length} time window${dayWindows.length > 1 ? "s" : ""}`
                  : "Day off"}
              </div>
            </div>
          </div>
          {isDayActive && (
            <button className={s.addWindowButton} onClick={addWindow}>
              <Plus className={s.addWindowIcon} />
              Add window
            </button>
          )}
        </div>

        <div className={s.slotsContainer}>
          {!isDayActive && (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500">
                This day is currently set as a day off.
              </p>
              <button
                className={`${s.dashedAddButton} mt-4`}
                onClick={() => toggleDay(selectedDay)}
              >
                <Plus className={s.dashedAddIcon} />
                Enable this day
              </button>
            </div>
          )}

          {dayWindows.map((w, idx) => (
            <div key={idx} className={s.slotCard}>
              <div className={s.slotGrid}>
                <div>
                  <label className={s.slotLabel}>Start time</label>
                  <div className={s.timeInputContainer}>
                    <Clock className={s.timeInputClockIcon} />
                    <input
                      type="time"
                      className={s.timeInput}
                      value={w.start}
                      onChange={(e) =>
                        updateWindow(idx, "start", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className={s.slotLabel}>End time</label>
                  <div className={s.timeInputContainer}>
                    <Clock className={s.timeInputClockIcon} />
                    <input
                      type="time"
                      className={s.timeInput}
                      value={w.end}
                      onChange={(e) =>
                        updateWindow(idx, "end", e.target.value)
                      }
                    />
                  </div>
                </div>
                <button
                  className={s.removeSlotButton}
                  onClick={() => removeWindow(idx)}
                >
                  <Trash2 className={s.removeSlotIcon} />
                  Remove
                </button>
              </div>
            </div>
          ))}

          {isDayActive && (
            <button className={s.dashedAddButton} onClick={addWindow}>
              <Plus className={s.dashedAddIcon} />
              Add another window
            </button>
          )}
        </div>

        <button
          className={s.saveButton}
          onClick={handleSave}
          disabled={loading}
        >
          <Save className={s.saveIcon} />
          {loading ? "Saving…" : "Save availability"}
        </button>

        {message && <p className={s.message}>{message}</p>}
      </div>
    </div>
  );
}
