'use client';

import { useState, useEffect } from 'react';
import { formatDistanceStrict } from 'date-fns';
import { Lock, DoorOpen } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RoomWithStatus } from '@/lib/types';

function TimeRemaining({ nextChangeTime, status }: { nextChangeTime: Date | null, status: 'free' | 'occupied' }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const calculateRemaining = () => {
      if (!nextChangeTime) {
        setTime('indefinitely');
        return;
      }
      
      const now = new Date();
      if (now >= nextChangeTime) {
        setTime('just changed');
        // A full page refresh will be triggered by re-navigation in a real app,
        // but here we just show the state.
        if (typeof window !== 'undefined') {
            setTimeout(() => window.location.reload(), 2000);
        }
        return;
      }

      const distance = formatDistanceStrict(nextChangeTime, now);
      setTime(`for ${distance}`);
    };

    calculateRemaining();
    const intervalId = setInterval(calculateRemaining, 1000);

    return () => clearInterval(intervalId);
  }, [nextChangeTime]);

  if (!time) return null;

  return (
    <p>
      {status === 'free' ? 'Free ' : 'Occupied '}
      <span className="font-semibold">{time}</span>
    </p>
  );
}


export function RoomStatusCard({ room }: { room: RoomWithStatus }) {
  const isFree = room.status === 'free';
  
  return (
    <Card className="flex flex-col h-full transition-transform duration-200 hover:scale-105 hover:shadow-xl bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-headline">{room.name}</CardTitle>
        <Badge variant={isFree ? 'success' : 'destructive'} className="capitalize shrink-0">
          {room.status}
        </Badge>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center items-center text-center gap-4">
        {isFree ? (
          <DoorOpen className="w-16 h-16 text-success" aria-label="Room is free" />
        ) : (
          <Lock className="w-16 h-16 text-destructive" aria-label="Room is occupied" />
        )}
        <div className="text-muted-foreground font-body">
          <TimeRemaining nextChangeTime={room.nextChangeTime} status={room.status} />
          {!isFree && room.currentEventName && (
             <p className="text-sm mt-1 truncate" title={room.currentEventName}>({room.currentEventName})</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
