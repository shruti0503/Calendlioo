"use server"
import { db } from "@/drizzle/db"
import { getValidTimesFromSchedule } from "@/lib/getValidTimesFromSchedule"
import { meetingActionSchema } from "@/schema/meetings"
import "use-server"
import { z } from "zod"
import { createCalendarEvent } from "../googleCalendar"
import { redirect } from "next/navigation"
import { fromZonedTime } from "date-fns-tz"
import { conforms } from "lodash"

export async function createMeeting(
  unsafeData: z.infer<typeof meetingActionSchema>
) {
  const { success, data } = meetingActionSchema.safeParse(unsafeData)
  console.log("meetingActionSchema.safeParse(unsafeData)",meetingActionSchema.safeParse(unsafeData))
  console.log("success, data:", success, data)

  if (!success) return { error: true }

  const event = await db.query.EventTable.findFirst({
    where: ({ clerkUserId, isActive, id }, { eq, and }) =>
      and(
        eq(isActive, true),
        eq(clerkUserId, data.clerkUserId),
        eq(id, data.eventId)
      ),
  })


  if (event == null){
    console.log("e")
    console.log("event is null", event)
    return { error: true }
  } 
  const startInTimezone = fromZonedTime(data.startTime, data.timezone)

  const validTimes = await getValidTimesFromSchedule([startInTimezone], event)
  if (validTimes.length === 0) return { error: true }

  await createCalendarEvent({
    ...data,
    startTime: startInTimezone,
    durationInMinutes: event.durationInMinutes,
    eventName: event.name,
  })

  redirect(
    `/book/${data.clerkUserId}/${
      data.eventId
    }/success?startTime=${data.startTime.toISOString()}`
  )
}