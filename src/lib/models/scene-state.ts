import {ArgsType} from './scene';
import {Tag} from './tag';

export class SceneState {
  type: string;

  // type === 'type' || 'erase'
  cursor?: number;
  done?: () => void;

  // type === 'type'
  isFixing?: boolean;
  previousMistakeCursor?: number;
  previousFixCursor?: number;
  typeValue?: string;
  htmlMap?: Tag[];
  initialValue?: string;

  // type === 'erase'
  eraseArgs?: ArgsType;

  constructor() {
    this.type = '';
  }
}
