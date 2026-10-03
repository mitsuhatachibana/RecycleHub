'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const router = useRouter();

  return (
    <nav className="flex items-center gap-2 text-sm mb-4">
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Dashboard</span>
      </button>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.href && index < items.length - 1 ? (
            <button
              onClick={() => router.push(item.href!)}
              className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ) : (
            <span className="flex items-center gap-1 text-gray-900 font-medium">
              {item.icon}
              <span>{item.label}</span>
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
