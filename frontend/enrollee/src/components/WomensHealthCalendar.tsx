"use client";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import React, { useEffect, useRef, useState } from "react";

interface PeriodEvent extends EventInput {
  extendedProps: {
    calendar: string;
    type?: string;
  };
}

interface PeriodTracker {
  id: string;
  lastPeriodDate: string;
  cycleLength: number;
  periodDuration: number;
  nextPeriodDate: string;
  nextFertileWindowStart: string;
  nextFertileWindowEnd: string;
  notes?: string;
}

const WomensHealthCalendar: React.FC = () => {
  const [tracker, setTracker] = useState<PeriodTracker | null>(null);
  const [events, setEvents] = useState<PeriodEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const {
    isOpen: isTrackerOpen,
    openModal: openTrackerModal,
    closeModal: closeTrackerModal,
  } = useModal();
  const {
    isOpen: isUpdateOpen,
    openModal: openUpdateModal,
    closeModal: closeUpdateModal,
  } = useModal();

  // Form states
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [notes, setNotes] = useState("");

  const calendarRef = useRef<FullCalendar>(null);

  // Fetch period tracker data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient("/enrollee/womens-health/tracker");

        if (data.data) {
          setTracker(data.data);
          setLastPeriodDate(data.data.lastPeriodDate?.split("T")[0] || "");
          setCycleLength(data.data.cycleLength);
          setPeriodDuration(data.data.periodDuration);
          setNotes(data.data.notes || "");
          await fetchPeriodEvents();
        } else {
          setTracker(null);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching period tracker:", err);
        setError("Failed to load period tracker. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchPeriodEvents = async () => {
    try {
      const data = await apiClient("/api/enrollee/womens-health/events");
      setEvents(data.data || []);
    } catch (err) {
      console.error("Error fetching period events:", err);
    }
  };

  const handleCreateTracker = async () => {
    if (!lastPeriodDate) {
      setError("Please enter your last period date");
      return;
    }

    try {
      const data = await apiClient("/api/enrollee/womens-health/tracker", {
        method: "POST",
        body: {
          lastPeriodDate,
          cycleLength,
          periodDuration,
          notes,
        },
      });

      setTracker(data.data);
      fetchPeriodEvents();
      closeTrackerModal();
      setError(null);
    } catch (err) {
      console.error("Error creating tracker:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create tracker. Please try again."
      );
    }
  };

  const handleUpdateTracker = async () => {
    if (!lastPeriodDate) {
      setError("Please enter your last period date");
      return;
    }

    try {
      const data = await apiClient("/enrollee/womens-health/tracker", {
        method: "PUT",
        body: {
          lastPeriodDate,
          cycleLength,
          periodDuration,
          notes,
        },
      });

      setTracker(data.data);
      fetchPeriodEvents();
      closeUpdateModal();
      setError(null);
    } catch (err) {
      console.error("Error updating tracker:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update tracker. Please try again."
      );
    }
  };

  const resetForm = () => {
    setLastPeriodDate(tracker?.lastPeriodDate?.split("T")[0] || "");
    setCycleLength(tracker?.cycleLength || 28);
    setPeriodDuration(tracker?.periodDuration || 5);
    setNotes(tracker?.notes || "");
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-8">
        <div className="text-center text-gray-500">
          Loading period tracker...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 m-6 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {!tracker ? (
          <div className="p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Start Tracking Your Period
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create a period tracker to get personalized predictions about
                your cycle, fertile window, and ovulation dates.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  openTrackerModal();
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 font-medium text-white hover:bg-brand-600 transition-colors"
              >
                Start Tracking
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Period Tracker
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Last period:{" "}
                    {new Date(tracker.lastPeriodDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetForm();
                    openUpdateModal();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                >
                  Update Period
                </button>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Cycle Length
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                    {tracker.cycleLength} days
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Period Duration
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-300">
                    {tracker.periodDuration} days
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Next Period
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                    {new Date(tracker.nextPeriodDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="custom-calendar p-6">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next",
                  center: "title",
                  right: "dayGridMonth",
                }}
                events={events}
                eventDisplay="block"
                height="auto"
              />
            </div>

            {/* Legend */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Legend
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Period (estimated)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Fertile Window
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Ovulation
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Tracker Modal */}
      <Modal
        isOpen={isTrackerOpen}
        onClose={closeTrackerModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              Start Period Tracking
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter details about your menstrual cycle to get personalized
              predictions
            </p>
          </div>

          <div className="mt-8">
            {/* Last Period Date */}
            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Last Period Start Date *
              </label>
              <input
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                When did your last period start?
              </p>
            </div>

            {/* Cycle Length */}
            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Average Cycle Length (days)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="21"
                  max="35"
                  step="1"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                  {cycleLength}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Typical cycle length is 21-35 days, average is 28 days
              </p>
            </div>

            {/* Period Duration */}
            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Average Period Duration (days)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="3"
                  max="7"
                  step="1"
                  value={periodDuration}
                  onChange={(e) => setPeriodDuration(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                  {periodDuration}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                How many days does your period typically last? (3-7 days is
                normal)
              </p>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any observations about your cycle, symptoms, etc."
                className="h-24 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={closeTrackerModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTracker}
              type="button"
              className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              Create Tracker
            </button>
          </div>
        </div>
      </Modal>

      {/* Update Tracker Modal */}
      <Modal
        isOpen={isUpdateOpen}
        onClose={closeUpdateModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              Log New Period
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your period tracker with your latest period start date
            </p>
          </div>

          <div className="mt-8">
            {/* Last Period Date */}
            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Last Period Start Date *
              </label>
              <input
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            {/* Cycle Length */}
            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Average Cycle Length (days)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="21"
                  max="35"
                  step="1"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                  {cycleLength}
                </span>
              </div>
            </div>

            {/* Period Duration */}
            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Average Period Duration (days)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="3"
                  max="7"
                  step="1"
                  value={periodDuration}
                  onChange={(e) => setPeriodDuration(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                  {periodDuration}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any observations about your cycle, symptoms, etc."
                className="h-24 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={closeUpdateModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateTracker}
              type="button"
              className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              Update Tracker
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default WomensHealthCalendar;
