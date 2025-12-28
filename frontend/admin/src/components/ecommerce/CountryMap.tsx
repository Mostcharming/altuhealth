import React from "react";
// import { VectorMap } from "@react-jvectormap/core";
import type { DemographicData } from "@/hooks/useDashboardData";
import { worldMill } from "@react-jvectormap/world";
import dynamic from "next/dynamic";

const VectorMap = dynamic(
  () => import("@react-jvectormap/core").then((mod) => mod.VectorMap),
  { ssr: false }
);

// Country coordinates mapping
const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  Nigeria: [9.0765, 7.3986],
  Ghana: [5.6037, -0.187],
  Kenya: [-0.0236, 37.9062],
};

// Define the component props
interface CountryMapProps {
  mapColor?: string;
  demographicData?: DemographicData[];
}

type MarkerStyle = {
  initial: {
    fill: string;
    r: number; // Radius for markers
  };
};

type Marker = {
  latLng: [number, number];
  name: string;
  style?: {
    fill: string;
    borderWidth: number;
    borderColor: string;
    stroke?: string;
    strokeOpacity?: number;
  };
};

const CountryMap: React.FC<CountryMapProps> = ({
  mapColor,
  demographicData,
}) => {
  // Create markers from demographic data
  const markers: Marker[] = demographicData
    ? demographicData.map((item) => ({
        latLng: COUNTRY_COORDINATES[item.country] || [0, 0],
        name: item.country,
        style: {
          fill: "#465FFF",
          borderWidth: 1,
          borderColor: "white",
          strokeOpacity: 0,
        },
      }))
    : [];

  return (
    <VectorMap
      map={worldMill}
      backgroundColor="transparent"
      markerStyle={
        {
          initial: {
            fill: "#465FFF",
            r: 4, // Custom radius for markers
          }, // Type assertion to bypass strict CSS property checks
        } as MarkerStyle
      }
      markersSelectable={true}
      markers={markers as Marker[]}
      zoomOnScroll={false}
      zoomMax={12}
      zoomMin={1}
      zoomAnimate={true}
      zoomStep={1.5}
      regionStyle={{
        initial: {
          fill: mapColor || "#D0D5DD",
          fillOpacity: 1,
          fontFamily: "Outfit",
          stroke: "none",
          strokeWidth: 0,
          strokeOpacity: 0,
        },
        hover: {
          fillOpacity: 0.7,
          cursor: "pointer",
          fill: "#465fff",
          stroke: "none",
        },
        selected: {
          fill: "#465FFF",
        },
        selectedHover: {},
      }}
      regionLabelStyle={{
        initial: {
          fill: "#35373e",
          fontWeight: 500,
          fontSize: "13px",
          stroke: "none",
        },
        hover: {},
        selected: {},
        selectedHover: {},
      }}
    />
  );
};

export default CountryMap;
