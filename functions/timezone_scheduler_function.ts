import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { convertTimeZone } from "../util/convert_timezone.ts";
import { formatDateTimeForAPI } from "../util/api_date_formatter.ts";

// Function definition
export const TimeZoneSchedulerFunction = DefineFunction({
  callback_id: "time_zone_scheduler",
  title: "Time Zone-Aware Meeting Scheduler",
  description:
    "Converts a proposed meeting time to the participant's time zone and calculates the end time.",
  source_file: "functions/timezone_scheduler_function.ts",
  input_parameters: {
    properties: {
      meeting_time: {
        type: Schema.types.string,
        description: "Proposed meeting time",
      },
      user_timezone: {
        type: Schema.types.string,
        description:
          "User's local date and time with timezone (e.g., 'August 14th, 2024 at 11:06 PM GMT+2')",
      },
      from_timezone: {
        type: Schema.types.string,
        description: "Time zone proposed (e.g., 'America/New_York')",
      },
      target_timezone: {
        type: Schema.types.string,
        description:
          "Time zone of the meeting participant (e.g., 'Europe/London')",
      },
      duration_minutes: {
        type: Schema.types.number,
        description: "Duration of the meeting in minutes",
      },
    },
    required: [
      "meeting_time",
      "user_timezone",
      "from_timezone",
      "target_timezone",
      "duration_minutes",
    ],
  },
  output_parameters: {
    properties: {
      readable_time_origin: {
        type: Schema.types.string,
        description: "Readable meeting time in the proposed time zone",
      },
      readable_time_participant: {
        type: Schema.types.string,
        description: "Readable meeting time in the participant's time zone",
      },
      calendar_meeting_time: {
        type: Schema.slack.types.timestamp, // Ensure this remains a timestamp type
        description: "Meeting time in the user's timezone",
      },
      calendar_end_time: {
        type: Schema.slack.types.timestamp, // Ensure this remains a timestamp type
        description: "End time of the meeting in the user's time zone",
      },
    },
    required: [
      "readable_time_origin",
      "readable_time_participant",
      "calendar_meeting_time",
      "calendar_end_time",
    ],
  },
});

export default SlackFunction(
  TimeZoneSchedulerFunction,
  async ({ inputs }) => {
    const {
      meeting_time,
      from_timezone,
      target_timezone,
      duration_minutes,
      user_timezone,
    } = inputs;

    let readableTimeOrigin: string | null = null;
    let readableTimeParticipant: string | null = null;
    let calendarMeetingTime: number | null = null;
    let calendarEndTime: number | null = null;

    try {
      // Step 1: Correctly format the meeting time for API usage
      const formattedMeetingTime = formatDateTimeForAPI(meeting_time);

      const meetingConversionResult = await convertTimeZone(
        from_timezone,
        formattedMeetingTime,
        target_timezone,
      );

      if (
        !meetingConversionResult ||
        !meetingConversionResult.conversionResult
      ) {
        throw new Error("Invalid DateTime format from API.");
      }

      // Step 2: Convert meeting_time from from_timezone to user timezone
      const calendarConversionResult = await convertTimeZone(
        from_timezone,
        formattedMeetingTime,
        user_timezone,
      );

      if (
        !calendarConversionResult || !calendarConversionResult.conversionResult
      ) {
        throw new Error("Invalid DateTime format from API.");
      }

      // Extract the calendar meeting time in user's timezone
      const userTimeZoneDate = new Date(
        calendarConversionResult.conversionResult.dateTime,
      );
      calendarMeetingTime = Math.floor(userTimeZoneDate.getTime() / 1000);

      // Step 3: Calculate readable times
      const originTime = new Date(meeting_time);
      readableTimeOrigin = originTime.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      const participantDateTime = new Date(
        meetingConversionResult.conversionResult.dateTime,
      );
      readableTimeParticipant = participantDateTime.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      // Step 4: Calculate end time for user
      const endTimeUser = new Date(
        userTimeZoneDate.getTime() + duration_minutes * 60000,
      );
      calendarEndTime = Math.floor(endTimeUser.getTime() / 1000);
    } catch (error) {
      return {
        error: `Error converting time: ${error.message}`,
      };
    }

    console.log("outputs", {
      readableTimeOrigin,
      readableTimeParticipant,
      calendarMeetingTime,
      calendarEndTime,
    });

    return {
      outputs: {
        readable_time_origin: readableTimeOrigin,
        readable_time_participant: readableTimeParticipant,
        calendar_meeting_time: calendarMeetingTime,
        calendar_end_time: calendarEndTime,
      },
    };
  },
);
