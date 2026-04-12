import { useState } from 'react';
import ItemFormDialog from '@/components/ItemFormDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AddItem() {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Item Toevoegen</h1>
          <p className="text-muted-foreground">Voeg een nieuw item toe aan je collectie of wishlist</p>
        </div>
      </div>
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        <Plus className="h-4 w-4 mr-2" /> Nieuw Item
      </Button>
      <ItemFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
