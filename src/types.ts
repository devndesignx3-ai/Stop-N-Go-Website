/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GasPrices {
  regular: number;
  midgrade: number;
  premium: number;
  diesel: number;
  lastUpdated: string;
}

export interface StationPrices {
  [stationName: string]: GasPrices;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  googleMapsUrl: string;
  directionsUrl: string;
  lat: number;
  lng: number;
  amenities: string[];
  photo: string;
}

export interface AttachedFile {
  name: string;
  type: string;
  data: string; // base64 representation
}

export interface JobApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  dateAvailable: string;
  desiredPosition: string;
  previousExperience: string;
  resume: AttachedFile | null;
  additionalNotes: string;
  selectedLocation: string;
  status: "Pending" | "Reviewed" | "Interview Scheduled" | "Hired" | "Rejected";
  adminNotes: string;
  createdAt: string;
}

export interface Review {
  author: string;
  rating: number;
  date: string;
  relativeTime: string;
  text: string;
  avatarColor: string;
}
