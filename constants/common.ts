export const UnitMeasurement = {
  Kilogram: "kg",
  Gram: "g",
  Liter: "L",
  Milliliter: "ml",
  Centimeter: "cm",
  Meter: "m",
  Inch: "inch",
  Piece: "pcs"
} as const;

export type UnitMeasurementType = typeof UnitMeasurement[keyof typeof UnitMeasurement];

export const UnitMeasurementOptions = [
  UnitMeasurement.Kilogram,
  UnitMeasurement.Gram,
  UnitMeasurement.Liter,
  UnitMeasurement.Milliliter,
  UnitMeasurement.Meter,
  UnitMeasurement.Inch,
  UnitMeasurement.Centimeter,
  UnitMeasurement.Piece
];

export const numberToAlphabet = (number: number) => {
  return String.fromCharCode(64 + number).toLowerCase();
};