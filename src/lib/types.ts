export type Building = {
  id: string;
  name: string;
};

export type Room = {
  id: string;
  name: string;
  buildingId: string;
};

export type CalendarEvent = {
  summary: string;
  start: string; // ISO 8601 format
  end: string;   // ISO 8601 format
};

export type RoomStatusInfo = {
    status: 'free' | 'occupied';
    nextChangeTime: Date | null;
    currentEventName: string | null;
}

export type RoomWithStatus = Room & RoomStatusInfo;
