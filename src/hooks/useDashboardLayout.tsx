import { useState, useEffect, useCallback } from 'react';

export interface WidgetConfig {
  id: string;
  label: string;
  visible: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'totalInvested', label: 'Totaal Geïnvesteerd', visible: true },
  { id: 'estimatedValue', label: 'Geschatte Waarde', visible: true },
  { id: 'inCollection', label: 'In Collectie', visible: true },
  { id: 'wishlistMeter', label: 'Wishlist Meter', visible: true },
  { id: 'categoryBreakdown', label: 'Collectie per Categorie', visible: true },
  { id: 'top5', label: 'Top 5 Meest Waardevol', visible: true },
];

const STORAGE_KEY = 'bb-collect-dashboard-layout';

export function useDashboardLayout() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WidgetConfig[];
        // Merge with defaults in case new widgets were added
        const ids = new Set(parsed.map(w => w.id));
        const merged = [
          ...parsed,
          ...DEFAULT_WIDGETS.filter(d => !ids.has(d.id)),
        ];
        return merged;
      }
    } catch {}
    return DEFAULT_WIDGETS;
  });

  const [editMode, setEditMode] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const save = useCallback((newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidgets));
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    save(widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  }, [widgets, save]);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const updated = [...widgets];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    save(updated);
  }, [widgets, save]);

  const visibleWidgets = widgets.filter(w => w.visible);
  const hiddenWidgets = widgets.filter(w => !w.visible);

  return {
    widgets,
    visibleWidgets,
    hiddenWidgets,
    editMode,
    setEditMode,
    toggleVisibility,
    reorder,
    dragIndex,
    setDragIndex,
  };
}
