'use server';

import ICAL from 'ical.js';
import type { Building, Room, RoomStatusInfo, RoomWithStatus } from './types';
import { CALENDAR_URLS } from './config';

const buildings: Building[] = [
  { id: 'esir-41', name: 'ESIR - 41' },
  { id: 'esir-42', name: 'ESIR - 42' },
];

const rooms: Room[] = [
  // ESIR 41
  { id: 'esir41-001', name: '001', buildingId: 'esir-41' },
  { id: 'esir41-002', name: '002', buildingId: 'esir-41' },
  { id: 'esir41-003', name: '003', buildingId: 'esir-41' },
  { id: 'esir41-004', name: '004', buildingId: 'esir-41' },
  { id: 'esir41-101', name: '101', buildingId: 'esir-41' },
  { id: 'esir41-102', name: '102', buildingId: 'esir-41' },
  { id: 'esir41-103', name: '103', buildingId: 'esir-41' },
  { id: 'esir41-104', name: '104', buildingId: 'esir-41' },

  // ESIR 42
  { id: 'esir42-amphi-l', name: 'Amphi L', buildingId: 'esir-42' },
  { id: 'esir42-amphi-m', name: 'Amphi M', buildingId: 'esir-42' },
  { id: 'esir42-amphi-n', name: 'Amphi N', buildingId: 'esir-42' },
  { id: 'esir42-salle-haut', name: '101', buildingId: 'esir-42' },
];


export async function getBuildings(): Promise<Building[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return buildings;
}

export async function getRoomsByBuilding(buildingId: string): Promise<Room[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return rooms.filter(room => room.buildingId === buildingId);
}


async function getRoomStatusFromICal(iCalUrl: string, roomName: string): Promise<RoomStatusInfo> {
  try {
    const response = await fetch(iCalUrl, {
      next: { revalidate: 60 * 5 } // Revalidate every 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar: ${response.statusText}`);
    }

    const iCalData = await response.text();
    const jcalData = ICAL.parse(iCalData);
    const vcalendar = new ICAL.Component(jcalData);
    const vevents = vcalendar.getAllSubcomponents('vevent');
    const now = ICAL.Time.now();

    const relevantEvents = vevents.filter(vevent => {
      const event = new ICAL.Event(vevent);
      const location = event.location || '';
      return location.includes(roomName);
    });

    for (const vevent of relevantEvents) {
      const event = new ICAL.Event(vevent);
      const isHappeningNow = event.startDate.compare(now) <= 0 && event.endDate.compare(now) > 0;

      if (isHappeningNow) {
        return {
          status: 'occupied',
          nextChangeTime: event.endDate.toJSDate(),
          currentEventName: event.summary,
        };
      }
    }

    // Find the next event
    let nextEvent: ICAL.Event | null = null;
    for (const vevent of relevantEvents) {
        const event = new ICAL.Event(vevent);
        if (event.startDate.compare(now) > 0) {
            if (!nextEvent || event.startDate.compare(nextEvent.startDate) < 0) {
                nextEvent = event;
            }
        }
    }

    return {
      status: 'free',
      nextChangeTime: nextEvent ? nextEvent.startDate.toJSDate() : null,
      currentEventName: null,
    };

  } catch (error) {
    console.error(`Error processing calendar for URL ${iCalUrl}:`, error);
    return {
      status: 'free',
      nextChangeTime: null,
      currentEventName: null,
    };
  }
}

async function getRoomStatus(room: Room): Promise<RoomStatusInfo> {
  const iCalUrl = CALENDAR_URLS[room.buildingId];
  
  if (!iCalUrl) {
    console.warn(`No calendar URL for building ${room.buildingId}.`);
    return { status: 'free', nextChangeTime: null, currentEventName: null };
  }
  
  return getRoomStatusFromICal(iCalUrl, room.name);
}

export async function getRoomsWithStatus(buildingId: string): Promise<RoomWithStatus[]> {
    const buildingRooms = await getRoomsByBuilding(buildingId);
    if (buildingRooms.length === 0) return [];
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const roomsWithStatus = await Promise.all(
        buildingRooms.map(async (room) => {
            const statusInfo = await getRoomStatus(room);
            return { ...room, ...statusInfo };
        })
    );
    return roomsWithStatus;
}
