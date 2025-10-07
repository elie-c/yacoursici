import { RoomStatusCard } from './room-status-card';
import type { RoomWithStatus } from '@/lib/types';

type RoomStatusGridProps = {
    rooms: RoomWithStatus[];
}

export function RoomStatusGrid({ rooms }: RoomStatusGridProps) {
    if (rooms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg bg-card mt-8 h-64">
                <p className="text-lg font-medium text-muted-foreground">Aucune salle trouvée pour ce bâtiment.</p>
                <p className="text-sm text-muted-foreground">Il se peut qu'il n'y ait aucune salle réservable ou qu'une erreur soit survenue.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map(room => (
                <RoomStatusCard key={room.id} room={room} />
            ))}
        </div>
    )
}
