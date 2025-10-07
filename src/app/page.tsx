import { Suspense } from 'react';
import { getBuildings, getRoomsWithStatus } from '@/lib/actions';
import { BuildingSelector } from '@/components/building-selector';
import { RoomStatusGrid } from '@/components/room-status-grid';
import { Skeleton } from '@/components/ui/skeleton';
import type { Building } from '@/lib/types';

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3 p-4 border rounded-lg bg-card">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-3/5" />
            <Skeleton className="h-6 w-1/4" />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 pt-4">
             <Skeleton className="h-16 w-16 rounded-full" />
             <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}


async function RoomData({ buildingId, buildings }: { buildingId: string, buildings: Building[] }) {
  if (!buildingId) {
    const buildingName = buildings[0]?.name || 'un bâtiment';
    return (
        <div className="text-center py-10">
            <p className="text-muted-foreground">Veuillez sélectionner un bâtiment pour voir l'état des salles.</p>
        </div>
    );
  }
  const rooms = await getRoomsWithStatus(buildingId);
  return <RoomStatusGrid rooms={rooms} />;
}


export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const buildings = await getBuildings();
  const selectedBuildingId =
    typeof searchParams.building === 'string' && buildings.some(b => b.id === searchParams.building)
      ? searchParams.building
      : buildings[0]?.id || '';

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl font-bold font-headline text-center sm:text-left">
            Disponibilité des salles
          </h1>
          {buildings.length > 0 && (
            <BuildingSelector
              buildings={buildings}
              selectedBuildingId={selectedBuildingId}
            />
          )}
        </header>

        <Suspense fallback={<GridSkeleton />}>
          <RoomData buildingId={selectedBuildingId} buildings={buildings} />
        </Suspense>
      </main>
      <footer className="w-full py-4 mt-8">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          Fais en 30 minutes grâce à une IA tout en suivant un cours depuis le fond de la salle -{' '}
          <a
            href="https://www.linkedin.com/in/elie-c/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Elie Castang
          </a>
        </div>
      </footer>
    </div>
  );
}
