import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export enum NodeType {
  Protagonist = 'Protagonist',
  Antagonist = 'Antagonist',
  Hacker = 'Hacker',
  Corporate = 'Corporate',
  Civilian = 'Civilian'
}

export interface CharacterNode extends SimulationNodeDatum {
  id: string;
  name: string;
  role: string; // e.g., "Cybersecurity Engineer", "CEO"
  group: NodeType;
  description: string;
  imageUrl?: string;
  // D3 internal properties
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface PlotLink extends SimulationLinkDatum<CharacterNode> {
  source: string | CharacterNode;
  target: string | CharacterNode;
  plotPoint: string; // The specific plot reason they are connected
  strength: number; // 1-10, how strong the connection is
}

export interface GraphData {
  nodes: CharacterNode[];
  links: PlotLink[];
}

export interface Dimensions {
  width: number;
  height: number;
}