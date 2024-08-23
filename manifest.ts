import { Manifest } from "deno-slack-sdk/mod.ts";
import { TimeZoneSchedulerFunction } from "./functions/timezone_scheduler_function.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "distracted-elephant-712",
  description: "A blank template for building Slack apps with Deno",
  icon: "assets/default_new_app_icon.png",
  functions: [TimeZoneSchedulerFunction],
  workflows: [],
  outgoingDomains: ["timeapi.io"],
  botScopes: ["commands", "chat:write", "chat:write.public"],
});
