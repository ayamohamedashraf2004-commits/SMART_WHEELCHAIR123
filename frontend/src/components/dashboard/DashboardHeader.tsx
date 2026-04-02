import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

const DashboardHeader: React.FC = () => {
  return (
    <header className="h-14 flex items-center justify-between px-3 sm:px-6 bg-surface glow-border">
      <h1 className="text-xs sm:text-sm font-mono text-foreground tracking-wide truncate">
        <span className="text-primary">WC-01</span> <span className="hidden sm:inline">// Welcome wheelchair Dashboard</span>
      </h1>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
        <div className="relative w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search systems..."
            className="w-full h-8 pl-9 pr-4 bg-secondary rounded-lg text-xs font-mono text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
          <Bell size={16} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive" />
        </button>

        <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-primary/10">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-mono text-xs font-bold">
            AM
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-mono text-foreground">Aya Mohamed</p>
            <p className="text-[10px] font-mono text-muted-foreground">OPERATOR</p>
          </div>
          <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
