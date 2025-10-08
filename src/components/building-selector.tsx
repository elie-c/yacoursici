'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Building } from '@/lib/types';
import { useLoading } from '@/components/ui/loading-context';

type BuildingSelectorProps = {
  buildings: Building[];
  selectedBuildingId: string;
};

export function BuildingSelector({ buildings, selectedBuildingId }: BuildingSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setLoading } = useLoading();

  const handleValueChange = (buildingId: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('building', buildingId);
    const search = current.toString();
    const query = search ? `?${search}` : '';
    setLoading(true)
    router.push(`${pathname}${query}`)
  };

  return (
    <Select value={selectedBuildingId} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full sm:w-[300px] text-base bg-card">
        <SelectValue placeholder="Sélectionnez un bâtiment" />
      </SelectTrigger>
      <SelectContent>
        {buildings.map((building) => (
          <SelectItem key={building.id} value={building.id} className="text-base">
            {building.name}
          </SelectItem>
        ))}
      </SelectContent>
      {/* Overlay handled by AppShell */}
    </Select>
  );
}
