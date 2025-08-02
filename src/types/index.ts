export interface Switch {
  id: string;
  name: string;
  brand: string;
  type: SwitchType;
  actuation: number;
  force: number;
  travel: number;
  soundProfile: SoundProfile;
  tactility: Tactility;
  price?: number;
  availability: boolean;
  imageUrl?: string;
  soundUrl?: string;
  description?: string;
  releaseDate?: Date;
  averageRating?: number;
  reviewCount?: number;
}

export interface FilterOptions {
  brands: string[];
  types: SwitchType[];
  minForce: number;
  maxForce: number;
  minPrice: number;
  maxPrice: number;
  soundProfiles: SoundProfile[];
  tactility: Tactility[];
  availability: boolean;
}

export enum SwitchType {
  LINEAR = 'LINEAR',
  TACTILE = 'TACTILE',
  CLICKY = 'CLICKY',
  SILENT = 'SILENT',
}

export enum SoundProfile {
  QUIET = 'QUIET',
  MODERATE = 'MODERATE',
  LOUD = 'LOUD',
  THOCKY = 'THOCKY',
  CLACKY = 'CLACKY',
  CREAMY = 'CREAMY',
}

export enum Tactility {
  NONE = 'NONE',
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  HEAVY = 'HEAVY',
}