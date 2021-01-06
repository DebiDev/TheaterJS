export type ArgsType = (string[] | string | number | (() => void) | Scene);

export class Scene {
  name: string;
  actor?: string;
  args?: ArgsType[];
}
