import { getArchiveItems } from '@/lib/data-store';
import ArchiveClient from './ArchiveClient';

export const dynamic = 'force-dynamic';

export default async function AdminArchivePage() {
  const items = await getArchiveItems();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Archive</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Position images on the storefront archive canvas using X, Y, and size percentages.
        </p>
      </div>
      <ArchiveClient items={items} />
    </div>
  );
}
