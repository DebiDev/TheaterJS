export type ArgsType = (string | number | (() => void));

export class Scene {
  name: string;
  actor?: string;
  args?: ArgsType[];
}
