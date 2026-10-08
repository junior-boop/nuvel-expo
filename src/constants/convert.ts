import { Dimensions, PixelRatio } from "react-native";
export const H = Dimensions.get("window").height

export const convert = (value: number): number => {
  const fontScale = Dimensions.get("screen").fontScale;

  if (value === undefined) {
    return 16 * 0.800000011920929;
  }

  if (fontScale > 0.800000011920929) {
    return value * 1;
  }

  return value;
};

// Sur certains telephones Android bas de gamme, PixelRatio.get() (la densite
// physique de l'ecran) est tres faible : les tailles de texte en "dp" restent
// identiques mais paraissent beaucoup plus grandes a l'oeil. On bascule entre
// ces deux bornes de densite pour calculer un facteur d'echelle, applique a
// chaque taille de texte existante afin de garder la hierarchie typographique
// (un titre reste plus grand qu'une legende) tout en retrecissant sur les
// ecrans a faible dpi.
const MIN_DPI_RATIO = 1
const MAX_DPI_RATIO = 3

// Base de design des tailles de texte "normales" de l'app (ex: fontSize: 16) :
// elle doit naviguer entre 12px (petit dpi) et 16px (grand dpi).
const GENERAL_BASE = 16
const GENERAL_MIN = 12
const GENERAL_MAX = 16

const dpiRatioNormalized = (): number => {
  const ratio = PixelRatio.get()
  const clamped = Math.min(MAX_DPI_RATIO, Math.max(MIN_DPI_RATIO, ratio))
  return (clamped - MIN_DPI_RATIO) / (MAX_DPI_RATIO - MIN_DPI_RATIO)
}

/**
 * Remplace convert() pour les tailles de police (fontSize) uniquement.
 * Le facteur est calcule une fois sur la base GENERAL_MIN/GENERAL_MAX puis
 * applique a `value`, donc un titre a 28 et une legende a 13 retrecissent
 * ensemble, dans la meme proportion.
 */
export const fontScale = (value: number): number => {
  const t = dpiRatioNormalized()
  const minFactor = GENERAL_MIN / GENERAL_BASE
  const maxFactor = GENERAL_MAX / GENERAL_BASE
  const factor = minFactor + t * (maxFactor - minFactor)
  return value * factor
}
