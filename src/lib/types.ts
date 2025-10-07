export type Building = {
  id: string;
  name: string;
};

export type Room = {
  id: string;
  name: string;
  buildingId: string;
};

export type RoomStatusInfo = {
    status: 'free' | 'occupied';
    nextChangeTime: Date | null;
    currentEventName: string | null;
}

export type RoomWithStatus = Room & RoomStatusInfo;
