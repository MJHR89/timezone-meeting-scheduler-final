/**
 * Converts a given date and time from one timezone to another using the Time API.
 * @param fromTimeZone - The original timezone of the date and time.
 * @param dateTime - The date and time to be converted.
 * @param toTimeZone - The target timezone for the conversion.
 * @returns A promise that resolves to the converted date and time result.
 */

export async function convertTimeZone(
  fromTimeZone: string,
  dateTime: string,
  toTimeZone: string
): Promise<any> {
  try {
    const response = await fetch(
      "https://timeapi.io/api/Conversion/ConvertTimeZone",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromTimeZone,
          dateTime,
          toTimeZone,
          dstAmbiguity: "",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to convert time zone");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error during time zone conversion:", error);
    throw error;
  }
}
