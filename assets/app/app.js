import Codepens from './codepen-snippets';
import CssDeck from './cssdeck-snippets';

const codepen = new Codepens();
codepen.fetchSnippets();

const cssdeck = new CssDeck();
cssdeck.fetchSnippets();
