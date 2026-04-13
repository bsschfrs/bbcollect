import { useState } from 'react';
import { useCustomFields, CustomField } from '@/hooks/useCustomFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface CustomFieldsManagerProps {
  categoryId: string;
}

const fieldTypeLabels: Record<string, string> = {
  text: 'Tekst',
  number: 'Nummer',
  dropdown: 'Dropdown',
};

export default function CustomFieldsManager({ categoryId }: CustomFieldsManagerProps) {
  const { fields, addField, updateField, deleteField } = useCustomFields(categoryId);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'text' | 'number' | 'dropdown'>('text');
  const [newOptions, setNewOptions] = useState<string[]>([]);
  const [newOptionInput, setNewOptionInput] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addField.mutateAsync({
      category_id: categoryId,
      field_name: newName.trim(),
      field_type: newType,
      dropdown_options: newType === 'dropdown' ? newOptions : [],
      sort_order: fields.length,
    });
    setNewName('');
    setNewType('text');
    setNewOptions([]);
    setNewOptionInput('');
    setAdding(false);
  };

  const addOption = () => {
    const val = newOptionInput.trim();
    if (val && !newOptions.includes(val)) {
      setNewOptions([...newOptions, val]);
      setNewOptionInput('');
    }
  };

  const moveField = async (field: CustomField, direction: -1 | 1) => {
    const idx = fields.findIndex(f => f.id === field.id);
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const other = fields[targetIdx];
    await Promise.all([
      updateField.mutateAsync({ id: field.id, sort_order: other.sort_order }),
      updateField.mutateAsync({ id: other.id, sort_order: field.sort_order }),
    ]);
  };

  return (
    <div className="space-y-3 mt-3 pl-2 border-l-2 border-border">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aangepaste velden</p>

      {fields.length === 0 && !adding && (
        <p className="text-xs text-muted-foreground">Geen aangepaste velden voor deze categorie.</p>
      )}

      {fields.map((field, idx) => (
        <div key={field.id} className="flex items-center gap-2 text-sm">
          <div className="flex flex-col gap-0.5">
            <Button
              size="icon"
              variant="ghost"
              className="h-4 w-4"
              disabled={idx === 0}
              onClick={() => moveField(field, -1)}
            >
              <span className="text-[10px]">▲</span>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-4 w-4"
              disabled={idx === fields.length - 1}
              onClick={() => moveField(field, 1)}
            >
              <span className="text-[10px]">▼</span>
            </Button>
          </div>
          <span className="flex-1 font-medium">{field.field_name}</span>
          <Badge variant="secondary" className="text-[10px]">{fieldTypeLabels[field.field_type]}</Badge>
          {field.field_type === 'dropdown' && field.dropdown_options?.length > 0 && (
            <span className="text-[10px] text-muted-foreground">({field.dropdown_options.join(', ')})</span>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Veld verwijderen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Het veld "{field.field_name}" en alle bijbehorende waarden worden permanent verwijderd.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuleren</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteField.mutate(field.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Verwijderen</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}

      {adding ? (
        <div className="space-y-2 rounded-lg border border-dashed border-border p-3 bg-muted/20">
          <div>
            <Label className="text-xs">Veldnaam</Label>
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="bijv. Maat, Kleur, Set" className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Type</Label>
            <Select value={newType} onValueChange={v => setNewType(v as any)}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Tekst</SelectItem>
                <SelectItem value="number">Nummer</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {newType === 'dropdown' && (
            <div>
              <Label className="text-xs">Opties</Label>
              <div className="flex flex-wrap gap-1 mb-1">
                {newOptions.map(opt => (
                  <Badge key={opt} variant="secondary" className="text-xs gap-1">
                    {opt}
                    <button onClick={() => setNewOptions(newOptions.filter(o => o !== opt))} className="hover:text-destructive">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1">
                <Input
                  value={newOptionInput}
                  onChange={e => setNewOptionInput(e.target.value)}
                  placeholder="Optie toevoegen..."
                  className="h-8 text-sm flex-1"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }}
                />
                <Button type="button" size="sm" variant="outline" onClick={addOption} className="h-8">+</Button>
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>Toevoegen</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewName(''); setNewType('text'); setNewOptions([]); }}>Annuleren</Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setAdding(true)} className="text-xs">
          <Plus className="h-3 w-3 mr-1" /> Veld toevoegen
        </Button>
      )}
    </div>
  );
}
