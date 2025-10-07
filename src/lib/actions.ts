'use server';

import { add, sub, set } from 'date-fns';
import type { Building, Room, CalendarEvent, RoomStatusInfo, RoomWithStatus } from './types';

// --- MOCK DATABASE & iCal SOURCE ---

const buildings: Building[] = [
  { id: 'eng', name: 'Engineering & Tech Building' },
  { id: 'sci', name: 'Science Hall' },
  { id: 'lib', name: 'Main Library' },
];

const rooms: Room[] = [
  // Engineering
  { id: 'eng-101', name: 'Innovate Lab', buildingId: 'eng', iCalUrl: 'cal-eng-101' },
  { id: 'eng-205', name: 'Project Room A', buildingId: 'eng', iCalUrl: 'cal-eng-205' },
  { id: 'eng-310', name: 'Seminar Room', buildingId: 'eng', iCalUrl: 'cal-eng-310' },

  // Science
  { id: 'sci-b1', name: 'Bio Lab', buildingId: 'sci', iCalUrl: 'cal-sci-b1' },
  { id: 'sci-112', name: 'Chem Study', buildingId: 'sci', iCalUrl: 'cal-sci-112' },
  { id: 'sci-220', name: 'Physics Collab', buildingId: 'sci', iCalUrl: 'cal-sci-220' },
  { id: 'sci-300', name: 'Quiet Study', buildingId: 'sci', iCalUrl: 'cal-sci-300' },

  // Library
  { id: 'lib-1a', name: 'Group Study 1A', buildingId: 'lib', iCalUrl: 'cal-lib-1a' },
  { id: 'lib-1b', name: 'Group Study 1B', buildingId: 'lib', iCalUrl: 'cal-lib-1b' },
  { id: 'lib-2c', name: 'Media Room 2C', buildingId: 'lib', iCalUrl: 'cal-lib-2c' },
  { id: 'lib-3d', name: 'Silent Zone 3D', buildingId: 'lib', iCalUrl: 'cal-lib-3d' },
  { id: 'lib-4e', name: 'Presentation Practice', buildingId: 'lib', iCalUrl: 'cal-lib-4e' },
];

const generateDayEvents = (baseDate: Date, eventSeeds: { hour: number; duration: number; summary: string }[]): CalendarEvent[] => {
  return eventSeeds.map(seed => {
    const startDate = set(baseDate, { hours: seed.hour, minutes: 0, seconds: 0, milliseconds: 0 });
    const endDate = add(startDate, { minutes: seed.duration });
    return {
      summary: seed.summary,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
  });
};

const today = new Date();
const tomorrow = add(today, { days: 1 });
const currentHour = new Date().getHours();

const mockCalendarData: Record<string, CalendarEvent[]> = {
  'cal-eng-101': [ // Innovate Lab - Busy today
    ...generateDayEvents(today, [
      { hour: 9, duration: 90, summary: 'Senior Design Project' },
      { hour: 11, duration: 50, summary: 'Robotics Club Meeting' },
      { hour: 14, duration: 120, summary: 'AI Workshop' },
    ]),
  ],
  'cal-eng-205': [ // Project Room A - One meeting now, one later
    ...generateDayEvents(today, [
      { hour: currentHour, duration: 60, summary: 'Group Sync' },
      { hour: currentHour + 3, duration: 45, summary: 'Code Review' },
    ]),
  ],
  'cal-eng-310': [ // Seminar Room - Free all day
  ...generateDayEvents(tomorrow, [
      { hour: 10, duration: 180, summary: 'Guest Lecture' },
    ]),
  ],
  'cal-sci-b1': [ // Bio Lab - Free for a short while
    { summary: 'Cell Culture Prep', start: sub(new Date(), { minutes: 10 }).toISOString(), end: add(new Date(), { minutes: 50 }).toISOString() },
    { summary: 'Microscopy Session', start: add(new Date(), { hours: 2 }).toISOString(), end: add(new Date(), { hours: 4 }).toISOString() },
  ],
  'cal-sci-112': [ // Chem Study - Occupied for a while
    { summary: 'Organic Chem Study Group', start: sub(new Date(), { hours: 1 }).toISOString(), end: add(new Date(), { hours: 1, minutes: 30 }).toISOString() },
  ],
  'cal-sci-220': [ // Physics Collab - Free for rest of day
    ...generateDayEvents(today, [ { hour: 8, duration: 120, summary: 'Quantum Mechanics Review' } ]),
  ],
   'cal-sci-300': [], // Quiet Study - always free
  'cal-lib-1a': [ // Group Study 1A
    ...generateDayEvents(today, [ { hour: 10, duration: 50, summary: 'History Project' }, { hour: 13, duration: 50, summary: 'Econ P-Set' } ]),
  ],
  'cal-lib-1b': [ // Group Study 1B - back-to-back
    ...generateDayEvents(today, [ { hour: 15, duration: 60, summary: 'Debate Prep' }, { hour: 16, duration: 60, summary: 'Presentation Run-through' } ]),
  ],
  'cal-lib-2c': [ // Media Room 2C - has a booking now
     { summary: 'Podcast Recording', start: sub(new Date(), { minutes: 30 }).toISOString(), end: add(new Date(), { minutes: 60 }).toISOString() },
  ],
  'cal-lib-3d': [], // Silent Zone 3D - always free
  'cal-lib-4e': [ // Presentation Practice - free for 30 mins
    { summary: 'Upcoming Booking', start: add(new Date(), { minutes: 30 }).toISOString(), end: add(new Date(), { minutes: 90 }).toISOString() },
  ],
};


export async function getBuildings(): Promise<Building[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return buildings;
}

export async function getRoomsByBuilding(buildingId: string): Promise<Room[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return rooms.filter(room => room.buildingId === buildingId);
}

async function getRoomStatus(iCalUrl: string): Promise<RoomStatusInfo> {
  const events = (mockCalendarData[iCalUrl] || []).sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const now = new Date();

  const currentEvent = events.find(
    event => new Date(event.start) <= now && new Date(event.end) > now
  );

  if (currentEvent) {
    return {
      status: 'occupied',
      nextChangeTime: new Date(currentEvent.end),
      currentEventName: currentEvent.summary,
    };
  }

  const nextEvent = events.find(event => new Date(event.start) > now);

  return {
    status: 'free',
    nextChangeTime: nextEvent ? new Date(nextEvent.start) : null,
    currentEventName: null,
  };
}

export async function getRoomsWithStatus(buildingId: string): Promise<RoomWithStatus[]> {
    const buildingRooms = await getRoomsByBuilding(buildingId);
    if (buildingRooms.length === 0) return [];
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const roomsWithStatus = await Promise.all(
        buildingRooms.map(async (room) => {
            const statusInfo = await getRoomStatus(room.iCalUrl);
            return { ...room, ...statusInfo };
        })
    );
    return roomsWithStatus;
}
