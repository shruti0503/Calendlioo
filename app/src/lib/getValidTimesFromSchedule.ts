
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

  if (start == null || end == null){
    console.log("start == null || end == null")
    return []
  } 

  console.log("before schedule")

  const schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId: userIdCol }, { eq }) =>
      eq(userIdCol, event.clerkUserId),
    with: { availabilities: true },
  })
  console.log("after schedule", schedule)
  console.log("timezone is", schedule?.timezone)
  console.log("schedule is this: ", schedule)


  if (schedule == null){
    console.log("schedule is null")
    return []
  } 

  const groupedAvailabilities = groupBy(
    schedule.availabilities,
    a => a.dayOfWeek
  )


  const eventTimes = await getCalendarEventTimes(event.clerkUserId, {
    start,
    end,
  })

  return timesInOrder.filter(intervalDate => {
    const availabilities = getAvailabilities(
      groupedAvailabilities,
      intervalDate,
      schedule.timezone
    )
    const eventInterval = {
      start: intervalDate,
      end: addMinutes(intervalDate, event.durationInMinutes),
    }

    console.log(" eventTimes.every",
      eventTimes.every(eventTime => {
        // console.log("areIntervalsOverlapping",areIntervalsOverlapping(eventTime, eventInterval));
        // console.log("!areIntervalsOverlapping",!areIntervalsOverlapping(eventTime, eventInterval))
        return !areIntervalsOverlapping(eventTime, eventInterval)
      })
    )

    console.log("availabilities are", availabilities);
    console.log("eventInterval",eventInterval)
    console.log("eventInterval.start",eventInterval.start);
    console.log("eventInterval.end",eventInterval.end);
    console.log('')
   

    console.log("availabilities.some",
      availabilities.some(availability => {
        console.log("isWithinInterval(eventInterval.start, availability)",isWithinInterval(eventInterval.start, availability));
        console.log(" isWithinInterval(eventInterval.end, availability)", isWithinInterval(eventInterval.end, availability))
        return (
          isWithinInterval(eventInterval.start, availability) &&
          isWithinInterval(eventInterval.end, availability)
        )
      })
    )
    

    console.log("final ans", 

    eventTimes.every(eventTime => {
      // console.log("areIntervalsOverlapping",areIntervalsOverlapping(eventTime, eventInterval));
      // console.log("!areIntervalsOverlapping",!areIntervalsOverlapping(eventTime, eventInterval))
      return !areIntervalsOverlapping(eventTime, eventInterval)
    })
    &&
    availabilities.some(availability => {
      return (
        isWithinInterval(eventInterval.start, availability) &&
        isWithinInterval(eventInterval.end, availability)
      )
    })
  )

    return (
      eventTimes.every(eventTime => {
        return !areIntervalsOverlapping(eventTime, eventInterval)
      }) &&
      availabilities.some(availability => {
        return (
          isWithinInterval(eventInterval.start, availability) &&
          isWithinInterval(eventInterval.end, availability)
        )
      })
    )
  })
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
  console.log("timezone is ", timezone)
  console.log("groupedAvailabilities",groupedAvailabilities)
  let availabilities
  // :
  //   | (typeof ScheduleAvailabilityTable.$inferSelect)[]
  //   | undefined

  console.log("groupedAvailabilities?.monday",groupedAvailabilities?.monday)

  if (groupedAvailabilities?.monday) {
    console.log("ismonday", groupedAvailabilities.monday)
    availabilities = groupedAvailabilities.monday
  }
  if (groupedAvailabilities?.tuesday) {
    availabilities = groupedAvailabilities.tuesday
  }
  if (groupedAvailabilities?.wednesday) {
    availabilities = groupedAvailabilities.wednesday
  }
  if (groupedAvailabilities?.thursday) {
    availabilities = groupedAvailabilities.thursday
  }
  if (groupedAvailabilities.friday) {
    availabilities = groupedAvailabilities.friday
  }
  if (groupedAvailabilities?.saturday) {
    availabilities = groupedAvailabilities.saturday
  }
  if (groupedAvailabilities?.sunday) {
    availabilities = groupedAvailabilities.sunday
  }

  if ( availabilities===undefined ){
    console.log("no availabilities", availabilities);
    return []
  }

  console.log("availabilities.map",availabilities)

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
    console.log("{ start, end }",{ start, end })

    return { start, end }
  })
}