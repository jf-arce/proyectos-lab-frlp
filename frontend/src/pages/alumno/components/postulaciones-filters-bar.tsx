import { Search } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const estadoOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_REVISION', label: 'En revisión' },
  { value: 'ACEPTADA', label: 'Aceptada' },
  { value: 'RECHAZADA', label: 'Rechazada' },
];

interface PostulacionesFiltersBarProps {
  searchQuery: string;
  selectedEstado: string;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
}

export function PostulacionesFiltersBar({
  searchQuery,
  selectedEstado,
  onSearchChange,
  onEstadoChange,
}: PostulacionesFiltersBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="space-y-1.5 md:col-span-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Buscar por proyecto o laboratorio
        </label>
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Nombre del proyecto, laboratorio..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </InputGroup>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Estado
        </label>
        <Select value={selectedEstado} onValueChange={onEstadoChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {estadoOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
