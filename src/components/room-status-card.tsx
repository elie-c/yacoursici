'use client';

import { useState, useEffect } from 'react';
import { formatDistanceStrict, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Lock, DoorOpen, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RoomWithStatus } from '@/lib/types';

const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;

function TimeRemaining({ nextChangeTime, status }: { nextChangeTime: Date | null, status: 'free' | 'occupied' }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const calculateRemaining = () => {
      if (!nextChangeTime) {
        setTime('indéfiniment');
        return;
      }
      
      const now = new Date();
      if (now >= nextChangeTime) {
        setTime('à l\'instant');
        if (typeof window !== 'undefined') {
            setTimeout(() => window.location.reload(), 2000);
        }
        return;
      }

      const distance = formatDistanceStrict(nextChangeTime, now, { locale: fr });
      setTime(`pendant ${distance}`);
    };

    calculateRemaining();
    const intervalId = setInterval(calculateRemaining, 1000);

    return () => clearInterval(intervalId);
  }, [nextChangeTime]);

  if (!time) return null;

  return (
    <p>
      {status === 'free' ? 'Libre ' : 'Occupée '}
      <span className="font-semibold">{time}</span>
    </p>
  );
}

export function RoomStatusCard({ room }: { room: RoomWithStatus }) {
  const isFree = room.status === 'free';
  const now = new Date();

  let badgeVariant: 'success' | 'destructive' | 'warning' = 'success';
  let badgeText = 'Libre';
  let Icon = DoorOpen;
  let iconClass = "text-success";

  if (!isFree) {
    badgeVariant = 'destructive';
    badgeText = 'Occupée';
    Icon = Lock;
    iconClass = "text-destructive";
  } else if (room.nextChangeTime && differenceInMinutes(room.nextChangeTime, now) < 30) {
    badgeVariant = 'warning';
    badgeText = 'Bientôt occupée';
    Icon = AlertTriangle;
    iconClass = 'text-warning';
  }

  return (
    <Card className="flex flex-col h-full transition-transform duration-200 hover:scale-105 hover:shadow-xl bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-headline">{room.name}</CardTitle>
        <Badge variant={badgeVariant} className="capitalize shrink-0">
          {badgeText}
        </Badge>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center items-center text-center gap-4">
        <Icon className={`w-16 h-16 ${iconClass}`} aria-label={`Salle ${badgeText}`} />
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
