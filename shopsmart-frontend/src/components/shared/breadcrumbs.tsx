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
  return (
    <nav
      aria-label="Breadcrumbs"
      className={`flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto py-2 no-scrollbar ${className}`}
    >
      <Link
        href="/"
        className="flex items-center hover:text-foreground transition-colors shrink-0 font-medium"
      >
        <Home className="h-3.5 w-3.5 mr-1" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center space-x-2 shrink-0">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-[300px]">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
