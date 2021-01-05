import voidElements from 'void-elements';

export class Html {

  isVoidElement(tag: string): boolean {
    const tagName = tag.match(/<([^\s>]+)/);
    return Boolean(tagName) && voidElements[tagName[1].toLowerCase()] === true;
  }

  strip(str: string): string {
    return str.replace(/(<([^>]+)>)/gi, '');
  }

  map(str: string): Tag[] {
    const regexp = /<[^>]+>/gi;
    const tags: Tag[] = [];
    const openers: Tag[] = [];
    let result: RegExpExecArray;
    let tag: Tag;

    // tslint:disable-next-line:no-conditional-assignment
    while ((result = regexp.exec(str))) {
      tag = {
        tagName: result[0],
        position: result.index
      };

      if (tag.tagName.charAt(1) === '/') {
        tag.opener = openers.pop();
      } else if (
        tag.tagName.charAt(tag.tagName.length - 2) !== '/' &&
        !this.isVoidElement(tag.tagName)
      ) {
        openers.push(tag);
      }

      tags.push(tag);
    }

    return tags;
  }

  inject(str: string, map: Tag[]): string {
    for (let i = 0, tag; i < map.length; i += 1) {
      tag = map[i];

      if (str.length > 0 && tag.position <= str.length) {
        str =
          str.substr(0, tag.position) + tag.tagName + str.substr(tag.position);
      } else if (tag.opener && tag.opener.position < str.length) {
        str += tag.tagName;
      }
    }

    return str;
  }
}

interface Tag {
  tagName: string;
  position: number;
  opener?: Tag;
}
