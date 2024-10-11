import { DAYS_OF_WEEK_IN_ORDER } from "@/data/contants"
import { db } from "@/drizzle/db"
import { ScheduleAvailabilityTable } from "@/drizzle/schema"
import { getCalendarEventTimes } from "@/server/googleCalendar"
import {
  addMinutes,
  areIntervalsOverlapping,
  isFriday,
  isMonday,
  isSaturday,
  isSunday,
  isThursday,
  isTuesday,
  isWednesday,
  isWithinInterval,
  setHours,
  setMinutes,
} from "date-fns"
import { groupBy } from 'lodash';
import { fromZonedTime } from "date-fns-tz"

export async function getValidTimesFromSchedule(
  timesInOrder: Date[],
  event: { clerkUserId: string; durationInMinutes: number }
) {
  const start = timesInOrder[0]
  const end = timesInOrder.at(-1)

  // Log initial time data and event details
  console.log("timesInOrder:", timesInOrder)
  console.log("Start Time:", start)
  console.log("End Time:", end)
  console.log("Event Details:", event)

  if (start == null || end == null) return []

  // Fetch the schedule from the database
  const schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId: userIdCol }, { eq }) =>
      eq(userIdCol, event.clerkUserId),
    with: { availabilities: true },
  })

  // Log the schedule data fetched from the database
  console.log("Fetched Schedule:", schedule)

  if (schedule == null) {
    console.log("Schedule is null, returning empty array")
    return []
  }

  const groupedAvailabilities = groupBy(
    schedule.availabilities,
    a => a.dayOfWeek
  )

  // Log the grouped availabilities for easier debugging
  console.log("Grouped Availabilities:", groupedAvailabilities)

  // Fetch event times
  const eventTimes = await getCalendarEventTimes(event.clerkUserId, {
    start,
    end,
  })

  // Log the calendar event times
  console.log("Fetched Event Times:", eventTimes)

  // Log before filtering available times
  console.log("Filtering valid times based on schedule availability and events")

  // Filter the valid times
  const validTimes = timesInOrder.filter(intervalDate => {
    const availabilities = getAvailabilities(
      groupedAvailabilities,
      intervalDate,
      schedule.timezone
    )

    // Log availabilities for each time interval
    console.log("Availabilities for", intervalDate, ":", availabilities)

    const eventInterval = {
      start: intervalDate,
      end: addMinutes(intervalDate, event.durationInMinutes),
    }

    // Log event interval being checked
    console.log("Event Interval:", eventInterval)

    // Check if the event times are overlapping with existing events or outside availability
    const isValid = eventTimes.every(eventTime => {
      const isOverlapping = areIntervalsOverlapping(eventTime, eventInterval)
      console.log("Checking overlap with eventTime", eventTime, ":", isOverlapping)
      return !isOverlapping
    }) &&
      availabilities.some(availability => {
        const isWithinStart = isWithinInterval(eventInterval.start, availability)
        const isWithinEnd = isWithinInterval(eventInterval.end, availability)
        console.log(
          "Checking availability overlap with availability",
          availability,
          ": start", isWithinStart, ", end", isWithinEnd
        )
        return isWithinStart && isWithinEnd
      })

    // Log the result for this time interval
    console.log("Interval", intervalDate, "is valid:", isValid)

    return isValid
  })

  // Log the valid times after filtering
  console.log("Valid Times:", validTimes)

  return validTimes
}

function getAvailabilities(
  groupedAvailabilities: Partial<
    Record<
      (typeof DAYS_OF_WEEK_IN_ORDER)[number],
      (typeof ScheduleAvailabilityTable.$inferSelect)[]
    >
  >,
  date: Date,
  timezone: string
) {
  let availabilities:
    | (typeof ScheduleAvailabilityTable.$inferSelect)[]
    | undefined

  // Log the current date and day of week being checked
  console.log("Getting availabilities for date:", date)

  if (isMonday(date)) availabilities = groupedAvailabilities.monday
  if (isTuesday(date)) availabilities = groupedAvailabilities.tuesday
  if (isWednesday(date)) availabilities = groupedAvailabilities.wednesday
  if (isThursday(date)) availabilities = groupedAvailabilities.thursday
  if (isFriday(date)) availabilities = groupedAvailabilities.friday
  if (isSaturday(date)) availabilities = groupedAvailabilities.saturday
  if (isSunday(date)) availabilities = groupedAvailabilities.sunday

  // Log the availabilities found for this day
  console.log("Availabilities for the day:", availabilities)

  if (availabilities == null) {
    console.log("No availabilities found, returning empty array")
    return []
  }

  return availabilities.map(({ startTime, endTime }) => {
    const start = fromZonedTime(
      setMinutes(
        setHours(date, parseInt(startTime.split(":")[0])),
        parseInt(startTime.split(":")[1])
      ),
      timezone
    )

    const end = fromZonedTime(
      setMinutes(
        setHours(date, parseInt(endTime.split(":")[0])),
        parseInt(endTime.split(":")[1])
      ),
      timezone
    )

    // Log the mapped availability times
    console.log("Mapped availability:", { start, end })

    return { start, end }
  })
}
