import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // Filter out any redundant 'Home' or '/' items passed in items array
  const sanitizedItems = items.filter(
    (item) => item.label.toLowerCase() !== 'home' && item.href !== '/'
  );

  return (
    <nav
      aria-label="Breadcrumbs"
      className={`flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto py-2 no-scrollbar ${className}`}
    >
      <Link
        href="/"
        className="flex items-center hover:text-foreground transition-colors shrink-0 font-medium"
      >
        <Home className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
        <span>Home</span>
      </Link>

      {sanitizedItems.map((item, index) => {
        const isLast = index === sanitizedItems.length - 1;
        return (
          <div key={index} className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground/50 shrink-0" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-[280px]">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
