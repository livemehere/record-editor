export const isNexonGame = (name: string) => {
  const list = ["FC ONLINE", "SuddenAttack", "KartDrift", "MapleStory"];
  return list.map((l) => l.toLowerCase()).includes(name.trim().toLowerCase());
};
