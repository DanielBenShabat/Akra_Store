'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { Input } from '@/components/admin-ui/input';
import { Textarea } from '@/components/admin-ui/textarea';
import { Label } from '@/components/admin-ui/label';
import type { ContentSettings } from '@/lib/site-settings';
import { updateContentSettingsAction } from './actions';

interface Props {
  content: ContentSettings;
}

export default function ContentSettingsSection({ content }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const value = {
      about: {
        title: formData.get('aboutTitle') as string,
        body: formData.get('aboutBody') as string,
      },
      contact: {
        title: formData.get('contactTitle') as string,
        intro: formData.get('contactIntro') as string,
        whatsappLabel: formData.get('whatsappLabel') as string,
        whatsappHref: formData.get('whatsappHref') as string,
        email: formData.get('email') as string,
        businessId: formData.get('businessId') as string,
      },
    };

    const payload = new FormData();
    payload.append('value', JSON.stringify(value));

    startTransition(async () => {
      const result = await updateContentSettingsAction(payload);
      if (result.success) {
        toast.success('Content settings saved');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to save content');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-border p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">About Page</h2>
        <p className="text-sm text-muted-foreground">Edit the About page content.</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="aboutTitle">Page Title</Label>
          <Input
            id="aboutTitle"
            name="aboutTitle"
            defaultValue={content.about.title}
            disabled={isPending}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="aboutBody">Body Text</Label>
          <p className="text-xs text-muted-foreground">
            Separate paragraphs with a blank line.
          </p>
          <Textarea
            id="aboutBody"
            name="aboutBody"
            rows={12}
            defaultValue={content.about.body}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Contact Page</h2>
        <p className="text-sm text-muted-foreground">Edit the Contact page details.</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="contactTitle">Page Title</Label>
          <Input
            id="contactTitle"
            name="contactTitle"
            defaultValue={content.contact.title}
            disabled={isPending}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactIntro">Intro Text</Label>
          <Textarea
            id="contactIntro"
            name="contactIntro"
            rows={2}
            defaultValue={content.contact.intro}
            disabled={isPending}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="whatsappLabel">WhatsApp Label</Label>
            <Input
              id="whatsappLabel"
              name="whatsappLabel"
              defaultValue={content.contact.whatsappLabel}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="whatsappHref">WhatsApp URL</Label>
            <Input
              id="whatsappHref"
              name="whatsappHref"
              defaultValue={content.contact.whatsappHref}
              disabled={isPending}
              placeholder="https://wa.me/972500000000"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={content.contact.email}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="businessId">Business ID</Label>
            <Input
              id="businessId"
              name="businessId"
              defaultValue={content.contact.businessId}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="bg-foreground text-background hover:bg-foreground/90"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
          </>
        ) : (
          'Save content settings'
        )}
      </Button>
    </form>
  );
}
