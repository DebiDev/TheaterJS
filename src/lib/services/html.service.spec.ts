import voidElements from 'void-elements';
import {Html} from './html.service';

let candidateHTML;
let candidateMap;
let candidateStr;

describe('html utils', () => {
  beforeEach(() => {
    candidateHTML =
      '<h1 id="some-id" class="some-class">Hey<br/> <strong aria-attribute="some-attribute">there!</strong><img src="/whatever.png"/></h1>';
    candidateMap = [
      {
        tagName: '<h1 id="some-id" class="some-class">',
        position: 0
      },

      {
        tagName: '<br/>',
        position: 39
      },

      {
        tagName: '<strong aria-attribute="some-attribute">',
        position: 45
      },

      {
        tagName: '</strong>',
        position: 91,
        opener: {
          tagName: '<strong aria-attribute="some-attribute">',
          position: 45
        }
      },

      {
        tagName: '<img src="/whatever.png"/>',
        position: 100
      },

      {
        tagName: '</h1>',
        position: 126,
        opener: {
          tagName: '<h1 id="some-id" class="some-class">',
          position: 0
        }
      }
    ];
    candidateStr = 'Hey there!';
  });

  describe('has a strip method that', () => {
    it('should remove html from a string', () => {
      expect(new Html().strip(candidateHTML)).toBe(candidateStr);
    });
  });

  describe('has a map method that', () => {
    it('should return a map of a string\'s html', () => {
      expect(new Html().map(candidateHTML)).toEqual(candidateMap);
    });

    it('should be able to map autoclosing tag that are missing the slash', () => {
      Object.keys(voidElements).forEach(voidElement => {
        const str = `<h1>Hey<${voidElement}>there!</h1>`;
        expect(new Html().map(str)).toEqual([
          { tagName: '<h1>', position: 0 },
          { tagName: `<${voidElement}>`, position: 7 },
          {
            tagName: '</h1>',
            position: str.length - '</h1>'.length,
            opener: { tagName: '<h1>', position: 0 }
          }
        ]);
      });
    });
  });

  describe('has an inject method that', () => {
    it('should inject html based on a map', () => {
      expect(new Html().inject(candidateStr, candidateMap)).toBe(candidateHTML);
    });

    it('should close opened tags even if string is shorter', () => {
      expect(new Html().inject('H', candidateMap)).toBe(
        '<h1 id="some-id" class="some-class">H</h1>'
      );
      expect(new Html().inject('Hey t', candidateMap)).toBe(
        '<h1 id="some-id" class="some-class">Hey<br/> <strong aria-attribute="some-attribute">t</strong></h1>'
      );
    });
  });
});
