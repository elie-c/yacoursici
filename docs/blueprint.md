# **App Name**: RoomStatus

## Core Features:

- Building Selection: A dropdown menu allows students to select a building.
- iCal URL Association: Associate each room name with its unique iCal URL in a database. Store calendar name and URL of iCal calendars in Cloud SQL
- Availability Status: Determine room availability (free or occupied) in real-time by querying the associated iCal calendar using URLs retrieved from Cloud SQL database.
- Time Remaining Display: Display the remaining time until the room becomes occupied or free, based on the iCal data for all rooms in the selected building.
- Data Refresh: The data refreshes when the user changes the building.

## Style Guidelines:

- Primary color: Light blue (#A7D1E7), conveying a sense of calm and reliability suitable for a tool providing real-time information.
- Background color: Very light blue (#F0F8FF), nearly white to keep focus on the status.
- Accent color: Soft orange (#E59866) to highlight the active or selected states in the app.
- Font pairing: 'Inter' (sans-serif) for headlines and 'PT Sans' (sans-serif) for body text, ensuring legibility and a modern, accessible feel.
- Use simple, clear icons to visually represent the room's status (e.g., a lock for 'occupied,' an open door for 'free').
- A clean, card-based layout presents each room's information, focusing on its current status and time remaining.
- Subtle transitions and loading animations to indicate real-time data fetching and updates.