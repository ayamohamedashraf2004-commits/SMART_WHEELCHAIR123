import React from 'react';
import { User, Phone, AlertTriangle, Calendar, Clock } from 'lucide-react';

const UserInfo: React.FC = () => {
  return (
    <div className="bg-surface p-3.5 rounded-xl glow-border h-full">
      <div className="flex items-center gap-2 mb-3">
        <User size={12} className="text-primary" />
        <h3 className="text-[9px] font-mono font-bold uppercase tracking-widest text-foreground">USER_INF</h3>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-mono text-sm font-bold glow-cyan">
          AM
        </div>
        <div>
          <p className="text-xs font-mono text-foreground font-semibold">Aya Mohamed</p>
          <p className="text-[9px] font-mono text-muted-foreground">ID: WC-USR-0042</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="space-y-1.5 text-[11px] font-mono">
        <InfoRow label="AGE" value="22" />
        <InfoRow label="PHONE" value="+20 1XX XXX XXXX" icon={<Phone size={10} />} />
        <InfoRow label="EMERGENCY" value="+20 1XX XXX XXXX" icon={<AlertTriangle size={10} className="text-destructive" />} />
        <InfoRow label="STATUS" value="ACTIVE" valueClass="text-accent" dot />
        <InfoRow label="CREATED" value="2024-01-15" icon={<Calendar size={10} />} />
        <InfoRow label="UPDATED" value="2024-12-01" icon={<Clock size={10} />} />
      </div>
    </div>
  );
};

const InfoRow: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueClass?: string;
  dot?: boolean;
}> = ({ label, value, icon, valueClass = 'text-foreground', dot }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-primary/5">
    <span className="text-muted-foreground flex items-center gap-1.5">
      {icon}
      {label}
    </span>
    <span className={`${valueClass} flex items-center gap-1.5`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" />}
      {value}
    </span>
  </div>
);

export default UserInfo;
