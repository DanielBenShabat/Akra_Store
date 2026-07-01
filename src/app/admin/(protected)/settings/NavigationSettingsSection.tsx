'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { Input } from '@/components/admin-ui/input';
import { Label } from '@/components/admin-ui/label';
import type { NavigationSettings, ManagedNavItem } from '@/lib/site-settings';
import { updateNavigationSettingsAction } from './actions';

interface Props {
  navigation: NavigationSettings;
}

export default function NavigationSettingsSection({ navigation }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newHref, setNewHref] = useState('');

  const items = [...navigation.items].sort((a, b) => a.displayOrder - b.displayOrder);

  function saveItems(updatedItems: ManagedNavItem[]) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append(
        'value',
        JSON.stringify({ items: updatedItems }),
      );
      const result = await updateNavigationSettingsAction(formData);
      if (result.success) {
        toast.success('Navigation saved');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to save navigation');
      }
    });
  }

  function moveItem(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const updated = [...items];
    const temp = updated[index].displayOrder;
    updated[index] = { ...updated[index], displayOrder: updated[newIndex].displayOrder };
    updated[newIndex] = { ...updated[newIndex], displayOrder: temp };
    saveItems(updated);
  }

  function toggleEnabled(index: number) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, enabled: !item.enabled } : item,
    );
    saveItems(updated);
  }

  function updateLabel(index: number, label: string) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, label } : item,
    );
    saveItems(updated);
  }

  function removeCustomItem(index: number) {
    const updated = items.filter((_, i) => i !== index);
    // Re-number displayOrder
    const reOrdered = updated.map((item, i) => ({ ...item, displayOrder: i + 1 }));
    saveItems(reOrdered);
  }

  function addCustomLink() {
    if (!newLabel.trim() || !newHref.trim()) {
      toast.error('Label and href are required');
      return;
    }
    const maxOrder = items.reduce((max, item) => Math.max(max, item.displayOrder), 0);
    const newItem: ManagedNavItem = {
      id: `custom-${crypto.randomUUID()}`,

      label: newLabel.trim(),
      href: newHref.trim(),
      type: 'custom',
      enabled: true,
      displayOrder: maxOrder + 1,
    };
    saveItems([...items, newItem]);
    setNewLabel('');
    setNewHref('');
    setShowAddForm(false);
  }

  return (
    <div className="rounded-md border border-border p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Navigation</h2>
        <p className="text-sm text-muted-foreground">
          Reorder, enable/disable, and add custom links to the navigation drawer.
        </p>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Saving…
        </div>
      )}

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center gap-2 rounded-md border border-border p-3 ${
              !item.enabled ? 'opacity-50' : ''
            }`}
          >
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => moveItem(index, -1)}
                disabled={index === 0 || isPending}
                className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                aria-label="Move up"
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1 || isPending}
                className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown className="h-3 w-3" />
              </button>
            </div>

            <Input
              value={item.label}
              onChange={(e) => updateLabel(index, e.target.value)}
              disabled={isPending}
              className="flex-1 h-8 text-sm"
            />

            <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[120px]">
              {item.href}
            </span>

            <button
              type="button"
              onClick={() => toggleEnabled(index)}
              disabled={isPending}
              className={`px-2 py-0.5 text-xs rounded border ${
                item.enabled
                  ? 'border-green-300 text-green-700 bg-green-50'
                  : 'border-red-300 text-red-700 bg-red-50'
              }`}
            >
              {item.enabled ? 'On' : 'Off'}
            </button>

            {item.type === 'custom' && (
              <button
                type="button"
                onClick={() => removeCustomItem(index)}
                disabled={isPending}
                className="p-1 text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${item.label}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {showAddForm ? (
        <div className="rounded-md border border-border p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Add custom link</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Label</Label>
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Lookbook"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Link</Label>
              <Input
                value={newHref}
                onChange={(e) => setNewHref(e.target.value)}
                placeholder="e.g. /lookbook or https://…"
                className="h-8 text-sm"
              />
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={addCustomLink}
          >
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-3 w-3 mr-1" /> Add custom link
        </Button>
      )}
    </div>
  );
}
