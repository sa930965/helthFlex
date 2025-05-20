
1. Setup and Installation

Run the following command to install dependencies:

npm install
# or force install if needed
npm install --force


2. Architecture and Folder Structure

The app follows a modular architecture. Below is the folder structure overview:

/App
 └── /src
      ├── /redux        # State management using Redux
      ├── /router       # Navigation configuration
      └── /screens      # All screen components (Dashboard, Task, Video, etc.)


3. Feature Summary

Dashboard Screen
- This is the main screen where users can view a list of all created tasks.
- Tasks are displayed in a scrollable list with options to filter them based on their status.
- Available filter options:
  - All – Displays every task regardless of status.
  - Completed – Shows only the tasks that have been marked as done.
  - Incomplete – Shows only the tasks that are still pending or in progress.
- Helps users manage and track their work more efficiently.

Add/Edit Task Screen
- This screen provides a form for creating new tasks or editing existing ones.
- The form includes the following input fields:
  - Title (Required) – A short name for the task.
  - Description – Optional additional details or notes about the task.
  - Due Date (Required) – A calendar input to set the task deadline.
  - Priority – A dropdown or selector for setting the task's urgency (Low, Medium, or High).
- Ensures that all essential information is collected to organize tasks effectively.

Task Details Screen
- This screen shows the full details of a specific task selected from the dashboard.
- It displays all relevant fields such as Title, Description, Due Date, Priority, and Status.
- Users can perform the following actions:
  - Edit – Open the task in the Add/Edit screen to make changes.
  - Delete – Permanently remove the task from the list.
- Useful for reviewing task information and taking quick action.

Offline Video Screen
- This screen allows users to view and play videos that have been downloaded to the device.
- Features include:
  - Video Playback – Play videos without an internet connection.
  - Download Progress – Display the current download progress with indicators.
  - Download Status – Show whether the video is fully downloaded and available offline.
- Useful for users who need access to video content in areas with limited or no connectivity.


4. Notes on Potential Improvements & Future Enhancements

- Optimize download experience for large videos
  - Add in-app notifications for download progress and completion
  - Implement background downloading support for uninterrupted performance
