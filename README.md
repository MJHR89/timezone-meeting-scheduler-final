# 🗓️Scheduling Meetings Across Time Zones in Slack 🕘

**Time:** 20-30 min

## Description:

In today’s global work environment, coordinating with colleagues across different time zones can be a hassle. Jumping between apps and doing mental math to figure out meeting times often leads to confusion and delays. To streamline this process, we’re going to create a Slack automation that takes the guesswork out of scheduling. This tool allows you to input a proposed meeting time and instantly converts it to the participant's local time zone. By integrating this directly into Slack, you can save time and avoid the hassle of switching apps, ensuring that your meetings are scheduled efficiently and accurately.
With this automation, managing your global team’s schedule becomes seamless, letting you focus on the meeting itself rather than the logistics.

## Requirements

* A github account
* The Slack workspace (get free sandboxes [here](https://api.slack.com/developer-program))
* A Google calendar account

## Minihack instructions

### Introduction
Coordinating meetings across different time zones can be a logistical headache. Imagine you're trying to schedule a meeting with a colleague or customer in another part of the world, and you're unsure what time works best for both of you. Switching between apps and doing mental calculations to convert time zones can be tedious and error-prone.
What if you could streamline this process directly within Slack? In this hack, you'll build a workflow that automates the conversion of meeting times from one timezone to another, making it easier to schedule meetings with your global team members.
Using Slack’s Workflow Builder, you'll create an automation that takes a proposed meeting time in your timezone, converts it to the timezone of the person you're scheduling with, and then schedules the meeting. This workflow saves you time, reduces the chances of errors, and allows you to focus on what matters most—collaborating with your team, no matter where they are in the world.

### Your timezone scheduler workflow at a glance

Your timezone scheduler workflow will consist of the following steps:

1. Built-in function: Collect info in a **form**
2. **Custom function**: Timezone aware meeting scheduler
3. Built-in function: **Send a message** with the time conversion and a button to create the calendar invite
4. Calendar connector: Use the **Google calendar connector** to create the meeting
5. Built-in function: **Reply a message in thread** with the confirmation of the meeting creation

![Final automation in Workflow Builder](/assets/Final%20automation.png)

Before we start let’s see the tools we need. We’re going to combine the power and simplicity of Workflow Builder, with the customizable opportunities of modular apps.

Workflow Builder is a tool in Slack that allows users to automate tasks and processes by creating workflows. Workflows are collections of automated steps that are triggered by events, like when a message is posted in a channel. You can access Workflow Builder via the Automations menu on the left side bar in Slack.

Automations are all about workflows. Developers can create workflow-based apps using Typescript with the Deno Slack SDKs and the Slack CLI. The Slack CLI helps you through the entire app creation process - from initialization to deployment.

## Part I: Let’s get technical! Create your custom function

### 🛠️ Environment Set Up

#### 1. Create your Codespace environment

1. Navigate to (add link)
2. Click the green code button
3. Click Codespaces 
  1. Click Create codespace on main

This will set up your Codespace environment and install the Slack CLI and the Deno Slack SDK.

**Test the Slack CLI Installation** 

* In your Codespace terminal, run the command: slack version
* If the installation was successful, you should see a version number displayed.

#### 2. Connect Slack CLI with Your Slack Workspace

In the Codespace terminal, run: slack login Follow the prompts to authenticate:

* Copy the command that looks like /slackauthticket THISISYOURTOKEN123456789 (including the /).
* Paste this command into any Slack channel. This will trigger a modal asking for permission.
* After accepting, copy the challenge code provided.
* Paste the challenge code back into your Codespace terminal.

You’re now authenticated! If you encounter any issues, refer to our documentation on authentication.


### 🧠 Manifest

The manifest is where your app's configurations are stored. Learn more in the Slack Manifest Documentation.

1. Add function and import statement

Add the function import and update the function list in your manifest file:
```
import { TimeZoneSchedulerFunction } from "./functions/timezone_scheduler_function.ts";

functions: [TimeZoneSchedulerFunction],
```

2. Add timeapi.io as outgoing domain

Add timeapi.io to the outgoingDomains array to allow your app to call the time conversion API:

```outgoingDomains: ["timeapi.io"],```

3. Name your app

Give your app a unique name so you can easily identify it:

```name: "MJ-timezone-scheduler",```



### 🖌️ Create your custom function

A custom function in Slack requires two key components:

1. The function definition
2. The function logic ( handler )

#### 1. Define Function

Navigate to functions/timezone_scheduler_function.ts and define the input and output parameters for your function. The parameters should follow this structure:
**Input paramaters:**

* meeting_time: string
* user_timezone: string
* from_timezone: string
* target_timezone: string
* duration_minutes: number

**Output parameters:**

* readable_time_origin: string
* readable_time_participant: string
* calendar_meeting_time: timestamp (slack type)
* calendar_end_time: timestamp (slack type)

Ensure all parameters are included and properly defined as required.

#### 2. Implement the function logic (function handler)

The SlackFunction() method requires two arguments: the function’s definition and its logic.


* Pass the function definition as the first argument: SlackFunction(TimeZoneSchedulerFunction, ...) 
* Map the inputs within your function. 
    * You can declare them together:
    ```
    const {
      meeting_time,
      from_timezone,
      target_timezone,
      duration_minutes,
      user_timezone,
    } = inputs;
    ```
    * Or, use them directly as needed in your code, like: ```inputs.meeting_time```

Follow the instructions in the code to know where to use/insert each one.


* Import necessary helper functions for API calls and date formatting. (Check out the files in /util to know what they do)
```
import { convertTimeZone } from "../util/convert_timezone.ts";
import { formatDateTimeForAPI } from "../util/api_date_formatter.ts";
```

* Finally, ensure that each output parameter is correctly set to be used in subsequent workflow steps:
  ```
  outputs: {
    readable_time_origin: readableTimeOrigin,
    readable_time_participant: readableTimeParticipant,
    calendar_meeting_time: calendarMeetingTime,
    calendar_end_time: calendarEndTime,
  },
  ```

### 🏃 Run the custom function

1. In your Codespace terminal, run the command: slack run 
2. Select the Slack Workspace you authenticated with earlier.
3. If successful, you’ll see a message: Connected awaiting events

## Part II: Build your workflow step-by-step

### Choose your automation trigger

We’ll start by opening Workflow Builder. For this example, we’ll use a Link Trigger, which allows users to start the workflow on demand by clicking a link.
Starts from a link in Slack

### Step 1: Collect meeting information

First, add a form to gather all the necessary details about the meeting. In Workflow Builder select the Form step from the sidebar menu.

**Form Fields:**

* From which timezone (e.g. Europe/London) → short text
* What time and date → date/time picker
* How long (in minutes) → number
* To which timezone (e.g America/New_York) → short text
* What’s your meeting about? → short text
* Email of your contact → short text

### Step 2: Add your custom function

With your custom function now available in Workflow Builder (after running slack run), add it as the second step:

* On the Steps sidebar, find your app or click on 🔧 Custom.
* Select Timezone Meeting Scheduler as the step.

We need to connect the info we collected on the previous step, to pass it as input of our function. For that we’re going to use some variables.

* Link the inputs from the form to your function. Click on the {} on the right side of the inputs, and choose the following (remember that the naming depends on what you’ve added in the form on step 1):
  * Meeting time: {}Answer to: Date and time of the meeting? Then click on the caret v and choose the local compact format (That’s the format we expect in the code of our custom function)
  * User Timezone: {} Time when the workflow started. Then click on the caret v and choose the local date and time format
  * From timezone: {}Answer to: From which timezone
  * Target timezone: {}Answer to: To which timezone
  * Duration in minutes: {}Answer to: How long

### Step 3: Send a message to confirm the time conversion

Now, inform the user of the time conversion results. On the Steps sidebar, search for **Messages > Send a message** to a person.
You can craft you’re own message using all the variables available from previous steps, here’s an example:

![Send message to person Step](/assets/Send%20message.png)

Enable the “include a button” option and customize the button label.
The workflow will pause here and continue once the user clicks the button.

### Step 4: Use the Google Calendar connector

Let’s add a connector for Google Calendar. On the Steps sidebar, search for Google Calendar > Create a calendar event. Fill in the event details using the variables from previous steps.

![Create calendar event Step](/assets/Calendar%20connector.png)

### Step 5: Confirm with a message in thread

To finish, let the user know the event has been successfully scheduled.
On the Steps sidebar, search for **Messages > Reply to a message in thread**. 

![Reply to a message in thread](/assets/Reply%20in%20thread.png)

## Time to test!

Your workflow is now complete! Click the **Publish** button in Workflow Builder, name your workflow, and copy the generated link trigger. Share the link in your test Slack channel, add it as a bookmark, or to your channel canvas.

Run the workflow by clicking the link—when is your next meeting? 🌎🗓️

### Deployment

As a bonus, deploy your function to production to make it available at all times. Simply run: ```slack deploy```

Choose the appropriate workspace for deployment. Remember, the local version (```slack run```) and the production version (```slack deploy```) are separate. Update the Workflow Builder to use the production function and reconnect input variables.
