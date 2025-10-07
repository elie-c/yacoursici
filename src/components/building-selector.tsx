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

type BuildingSelectorProps = {
  buildings: Building[];
  selectedBuildingId: string;
};

export function BuildingSelector({ buildings, selectedBuildingId }: BuildingSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleValueChange = (buildingId: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('building', buildingId);
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  return (
    <Select value={selectedBuildingId} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full sm:w-[300px] text-base bg-card">
        <SelectValue placeholder="Select a building" />
      </SelectTrigger>
      <SelectContent>
        {buildings.map((building) => (
          <SelectItem key={building.id} value={building.id} className="text-base">
            {building.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
