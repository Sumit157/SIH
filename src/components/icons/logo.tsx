import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn('text-primary', props.className)}
    >
      <title>Gau Gyan Logo</title>
      <path d="M14.5 13.04c.32.33.8.5 1.5.5c1.66 0 3-1.57 3-3.54c0-1.2-.53-2.28-1.32-2.9C18.42 6.03 19 5.06 19 4a3 3 0 0 0-3-3c-1.76 0-3 1.25-3 3.5c0 .73.23 1.41.62 1.96" />
      <path d="M9.5 13.04c-.32.33-.8.5-1.5.5c-1.66 0-3-1.57-3-3.54c0-1.2.53-2.28 1.32-2.9C5.58 6.03 5 5.06 5 4a3 3 0 0 1 3-3c1.76 0 3 1.25 3 3.5c0 .73-.23 1.41-.62 1.96" />
      <path d="M12 11.5c-2.5 0-4.75.81-6.44 2.3A2 2 0 0 0 5 15.55V21h14v-5.45a2 2 0 0 0-.56-1.75C16.75 12.31 14.5 11.5 12 11.5Z" />
      <path d="M12 12c-2.43 2.1-3.66 3.6-5 5" />
      <path d="M12 17c.91.83 2.2 1.83 3.5 3" />
      <path d="M14 12c1.47 1.5 2.6 2.89 3.4 4" />
    </svg>
  );
}
