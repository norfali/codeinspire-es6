import * as Snippet from './snippet';
import * as ajaxUrl from './constants/urls';

export default class Codepens extends Snippet {

	constructor() {
		super();
	}

	fetchSnippets(url, element) {

		this.sendRequest(ajaxUrl.CODEPEN_URL, '.snippets-codepen');

	}

	// Use in child class only
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
		const { creator, date, link, subject, title, description } = r;

		let languages = $(description).find("small").html().replace(/(This Pen uses)/, "Languages used");
		languages = languages.replace(/(,)\s(and)\s/, "");
	
		// YGL returns date string wrapped with u21B5 chars
		let friendlyDate = super.parseDate(date.replace(/\u21B5/g, "").trim());

		let snippet = `<li class="snippets__item"><div class="test">
		<div class="snippets__more"><a href="${link}" class="snippets__codelink">${subject}</a></div>
		<h5 class="snippets__creator">By ${creator}</h5>
		<code class="snippets__languages">${languages}</code>
		</div></li>`;

		super.insertSnippets(".snippets-codepen", snippet);

		super.ajaxProgress("end", ".snippets-codepen");
	}

	insertSnippets(snippetArea, snippets) {

	}
	parseDate(itemDate) {

	}

	ajaxProgress(status, element) {

	}

}

