export interface NavItem {
  label: string;
  href: string;
}

export interface MarqueeItem {
  label: string;
  icon?: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface TechItem {
  name: string;
}

export interface TechCategory {
  name: string;
  items: TechItem[];
}

export type HighlightType = 'SUCCESS' | 'AUDIT' | 'INIT' | 'INFO' | 'DEPLOYED' | 'FINDING' | 'HIGH' | 'MEDIUM' | 'CANTINA' | 'SHIPPED';

export interface ExperienceHighlight {
  type: HighlightType;
  text: string;
}

export interface ExperienceItem {
  period: string;
  title: string;
  company: string;
  tags: string[];
  logFile: string;
  logType: HighlightType;
  highlights: ExperienceHighlight[];
  status: string;
}

export interface Project {
  name: string;
  description: string;
  techStack: string[];
  highlights: string[];
  github: string;
  status: string;
  lang: string;
  visibility: 'Public' | 'Private';
  lastUpdated: string;
  flagship?: boolean;
}

export interface InfraItem {
  name: string;
  description: string;
  icon: string;
}

export interface CommandItem {
  id: string;
  label: string;
  href: string;
  description: string;
}
