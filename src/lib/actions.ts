'use server';

import { add, sub, set } from 'date-fns';
import type { Building, Room, CalendarEvent, RoomStatusInfo, RoomWithStatus } from './types';

// --- MOCK DATABASE & iCal SOURCE ---

const buildings: Building[] = [
  { id: 'esir-41', name: 'ESIR - 41' },
  { id: 'esir-42', name: 'ESIR - 42' },
];

const rooms: Room[] = [
  // ESIR 41
  { id: 'esir41-001', name: '001', buildingId: 'esir-41', iCalUrl: 'cal-esir41-001' },
  { id: 'esir41-002', name: '002', buildingId: 'esir-41', iCalUrl: 'cal-esir41-002' },
  { id: 'esir41-003', name: '003', buildingId: 'esir-41', iCalUrl: 'cal-esir41-003' },
  { id: 'esir41-004', name: '004', buildingId: 'esir-41', iCalUrl: 'cal-esir41-004' },
  { id: 'esir41-101', name: '101', buildingId: 'esir-41', iCalUrl: 'cal-esir41-101' },
  { id: 'esir41-102', name: '102', buildingId: 'esir-41', iCalUrl: 'cal-esir41-102' },
  { id: 'esir41-103', name: '103', buildingId: 'esir-41', iCalUrl: 'cal-esir41-103' },
  { id: 'esir41-104', name: '104', buildingId: 'esir-41', iCalUrl: 'cal-esir41-104' },
  
  // ESIR 42
  { id: 'esir42-amphi-l', name: 'Amphi L', buildingId: 'esir-42', iCalUrl: 'cal-esir42-amphi-l' },
  { id: 'esir42-amphi-m', name: 'Amphi M', buildingId: 'esir-42', iCalUrl: 'cal-esir42-amphi-m' },
  { id: 'esir42-amphi-n', name: 'Amphi N', buildingId: 'esir-42', iCalUrl: 'cal-esir42-amphi-n' },
  { id: 'esir42-salle-haut', name: 'Salle du haut', buildingId: 'esir-42', iCalUrl: 'cal-esir42-salle-haut' },
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
  // ESIR 42
  'cal-esir42-amphi-l': [
    ...generateDayEvents(today, [
      { hour: 9, duration: 120, summary: 'Cours Magistral' },
      { hour: 14, duration: 90, summary: 'Conférence A' },
    ]),
  ],
  'cal-esir42-amphi-m': [
    { summary: 'Partiel', start: sub(new Date(), { minutes: 60 }).toISOString(), end: add(new Date(), { minutes: 120 }).toISOString() },
  ],
  'cal-esir42-amphi-n': [],
  'cal-esir42-salle-haut': [
    ...generateDayEvents(tomorrow, [{ hour: 10, duration: 60, summary: 'Réunion Pédagogique' }]),
  ],

  // ESIR 41
  'cal-esir41-001': [
    ...generateDayEvents(today, [{ hour: currentHour, duration: 50, summary: 'TP Électronique' }]),
  ],
  'cal-esir41-002': [],
  'cal-esir41-003': [
    { summary: 'Projet Info', start: sub(new Date(), { minutes: 30 }).toISOString(), end: add(new Date(), { hours: 2 }).toISOString() },
  ],
  'cal-esir41-004': [
    ...generateDayEvents(today, [{ hour: 11, duration: 55, summary: 'Soutenance' }]),
  ],
  'cal-esir41-101': [
    ...generateDayEvents(today, [{ hour: 10, duration: 50, summary: 'TD Maths' }, { hour: 16, duration: 50, summary: 'TD Physique' }]),
  ],
  'cal-esir41-102': [],
  'cal-esir41-103': [
    { summary: 'Réservation', start: add(new Date(), { minutes: 15 }).toISOString(), end: add(new Date(), { minutes: 75 }).toISOString() },
  ],
  'cal-esir41-104': [
    ...generateDayEvents(tomorrow, [{ hour: 9, duration: 180, summary: 'Examen' }]),
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
