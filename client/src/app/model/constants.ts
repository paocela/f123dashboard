import { cifAe, cifAt, cifAu, cifAz, cifBe, cifBh, cifBr, cifCa, cifCn, cifEs, cifGb, cifHu, cifIt, cifJp, cifMc, cifMx, cifNl, cifQa, cifSa, cifSg, cifUs } from '@coreui/icons';

export const medals = new Map<number, string>([
  [1, "medal_first.svg"],
  [2, "medal_second.svg"],
  [3, "medal_third.svg"]
]);

export const posizioni = new Map<number, string>([
  [1, "Primo"],
  [2, "Secondo"],
  [3, "Terzo"],
  [4, "Quarto"],
  [5, "Quinto"],
  [6, "Sesto"],
  [7, "Settimo"],
  [8, "Ottavo"],
  [9, "Giro Veloce"],
  [10, "DNF"],
  [11, "Team Vincente"]
]);

export const allFlags: {[key: string]: any} = {
  "Barhain": cifBh,
  "Arabia Saudita": cifSa,
  "Australia": cifAu,
  "Giappone": cifJp,
  "Cina": cifCn,
  "USA": cifUs,
  "Monaco": cifMc,
  "Canada": cifCa,
  "Spagna": cifEs,
  "Austria": cifAt,
  "UK": cifGb,
  "Ungheria": cifHu,
  "Belgio": cifBe,
  "Olanda": cifNl,
  "Italia": cifIt,
  "Azerbaijan": cifAz,
  "Singapore": cifSg,
  "Messico": cifMx,
  "Brasile": cifBr,
  "Qatar": cifQa,
  "Emirati Arabi Uniti": cifAe,
};
