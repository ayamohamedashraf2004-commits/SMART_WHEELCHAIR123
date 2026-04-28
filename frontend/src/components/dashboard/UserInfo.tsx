import React from 'react';
import { User, Phone, AlertTriangle, Calendar, Clock } from 'lucide-react';
import type { UserProfile } from '@/services/api';

interface UserInfoProps {
  user: UserProfile | null;
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  return (
    <div className="bg-surface p-3.5 rounded-xl glow-border h-full">
      
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3">
        <User size={12} className="text-primary" />
        <h3 className="text-[9px] font-mono font-bold uppercase tracking-widest text-foreground">
          USER_INFO
        </h3>
      </div>

      {/* USER HEADER */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-mono text-sm font-bold glow-cyan">
          {user?.name
            ? user.name
                .split(' ')
                .map(w => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : 'XX'}
        </div>

        <div>
          <p className="text-xs font-mono text-foreground font-semibold">
            {user?.name || 'Unknown'}
          </p>

          <p className="text-[9px] font-mono text-muted-foreground">
            ID: {user?.id ? `WC-${user.id.toString().slice(0, 8).toUpperCase()}` : 'N/A'}
          </p>
        </div>
      </div>

      {/* INFO ROWS */}
      <div className="space-y-1.5 text-[11px] font-mono">

        <InfoRow label="AGE" value={user?.age ? String(user.age) : '--'} />

        <InfoRow
          label="PHONE"
          value={user?.phone || '--'}
          icon={<Phone size={10} />}
        />


        <InfoRow
          label="STATUS"
          value={user?.status || 'ACTIVE'}
          valueClass={user?.status === 'ACTIVE' ? 'text-green-400' : 'text-yellow-400'}
        />

        <InfoRow
          label="created_at"
          value={user?.created_at ? user.created_at.slice(0, 10) : '--'}
          icon={<Calendar size={10} />}
        />

        <InfoRow
          label="updated_at"
          value={user?.updated_at ? user.updated_at.slice(0, 10) : '--'}
          icon={<Clock size={10} />}
        />

      </div>
    </div>
  );
};

const InfoRow: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueClass?: string;
}> = ({ label, value, icon, valueClass = 'text-foreground' }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-primary/5">
    
    <span className="text-muted-foreground flex items-center gap-1.5">
      {icon}
      {label}
    </span>

    <span className={`${valueClass} flex items-center gap-1.5`}>
      {value}
    </span>
  </div>
);

export default UserInfo;