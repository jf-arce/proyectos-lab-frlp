import { Search } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from '@/components/ui/combobox';

interface LabProjectsFiltersBarProps {
  searchQuery: string;
  selectedSkills: string[];
  skillOptions: string[];
  onSearchChange: (value: string) => void;
  onSkillsChange: (skills: string[]) => void;
}

export function LabProjectsFiltersBar({
  searchQuery,
  selectedSkills,
  skillOptions,
  onSearchChange,
  onSkillsChange,
}: LabProjectsFiltersBarProps) {
  const anchor = useComboboxAnchor();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Buscar por palabras clave
        </label>
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="IA, Python, Electrónica..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </InputGroup>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Habilidades
        </label>
        <Combobox
          items={skillOptions}
          multiple
          value={selectedSkills}
          onValueChange={onSkillsChange}
        >
          <div ref={anchor}>
            <ComboboxChips className="min-h-10">
              {selectedSkills.map((skill) => (
                <ComboboxChip key={skill}>{skill}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={
                  selectedSkills.length === 0 ? 'Selecciona habilidades...' : ''
                }
              />
            </ComboboxChips>
          </div>
          <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>Sin resultados.</ComboboxEmpty>
            <ComboboxList>
              {(skill: string) => (
                <ComboboxItem key={skill} value={skill}>
                  {skill}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  );
}
