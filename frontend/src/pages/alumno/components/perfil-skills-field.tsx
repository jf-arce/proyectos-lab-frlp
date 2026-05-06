import { type RefObject } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox';

interface SkillsFieldProps {
  allSkillNames: string[];
  selectedSkillNames: string[];
  skillAnchor: RefObject<HTMLDivElement | null>;
  onValueChange: (names: string[]) => void;
  newSkillInput: string;
  onNewSkillInputChange: (value: string) => void;
  onAddCustomSkill: () => void;
}

export function PerfilSkillsField({
  allSkillNames,
  selectedSkillNames,
  skillAnchor,
  onValueChange,
  newSkillInput,
  onNewSkillInputChange,
  onAddCustomSkill,
}: SkillsFieldProps) {
  return (
    <>
      <Combobox
        items={allSkillNames}
        multiple
        value={selectedSkillNames}
        onValueChange={onValueChange}
      >
        <div ref={skillAnchor}>
          <ComboboxChips className="min-h-10">
            {selectedSkillNames.map((name) => (
              <ComboboxChip key={name}>{name}</ComboboxChip>
            ))}
            <ComboboxChipsInput
              placeholder={
                selectedSkillNames.length === 0 ? 'Buscar habilidad...' : ''
              }
            />
          </ComboboxChips>
        </div>
        <ComboboxContent anchor={skillAnchor}>
          <ComboboxEmpty>No hay habilidades que coincidan</ComboboxEmpty>
          <ComboboxList>
            {(name: string) => (
              <ComboboxItem key={name} value={name}>
                {name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <div className="flex gap-2 mt-2">
        <Input
          placeholder="Agregar habilidad personalizada..."
          value={newSkillInput}
          onChange={(e) => onNewSkillInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddCustomSkill();
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          disabled={!newSkillInput.trim()}
          onClick={onAddCustomSkill}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </>
  );
}
