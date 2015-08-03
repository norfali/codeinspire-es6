import * as Snippet from './snippet';
import * as ajaxUrl from './constants/urls';

export default class CssDeck extends Snippet {

	constructor() {
		super();
	}

	fetchSnippets(url, element) {

		//super.fetchSnippets(ajaxUrl.CSSDECK_URL, '.snippets-cssdeck');
		this.sendRequest(ajaxUrl.CSSDECK_URL, '.snippets-cssdeck');
	}

	sendRequest(url, element) {
		$.ajax({
			method: "GET",
			url: url,
			beforeSend: super.ajaxProgress("start", element),
			success: ::this.handleResults
		});
	}

	handleResults(data) {

		const results = data.query.results.item;

		let items = results.map(r =>
			this.createSnippet(r)
		);

	}

	createSnippet(r) {
		const { pubDate, origLink, title, description } = r;

		const text = $(description).html();
	
		// YGL returns date string wrapped with u21B5 chars
		let friendlyDate = super.parseDate(pubDate.replace(/\u21B5/g, "").trim());

		let snippet = `<li class="snippets__item"><div class="test">
		<div class="snippets__more"><a href="${origLink}" class="snippets__codelink">${title}</a></div>
		<h5 class="snippets__creator">By Anon</h5>
		<p>${text}</p>
		</div></li>`;

		super.insertSnippets(".snippets-cssdeck", snippet);
		super.ajaxProgress("end", ".snippets-cssdeck");
	}

	insertSnippets(snippetArea, snippets) {

	}
	parseDate(itemDate) {

	}
	ajaxProgress(status, element) {

	}

}

