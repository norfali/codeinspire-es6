// Snippet Class

export default class Snippet {

	constructor() {
	}

	insertSnippets(snippetArea, snippets) {

		$(snippetArea).append(snippets);
	}

	// Custom date format
	parseDate(itemDate) {
		const months = [
			'Jan',
			'Feb', 
			'Mar', 
			'Apr', 
			'May', 
			'Jun', 
			'Jul', 
			'Aug', 
			'Sept', 
			'Oct', 
			'Nov', 
			'Dec'
		];

		let newDate = new Date(itemDate);

		return newDate.getDate() + " " + months[newDate.getMonth()] + " " + newDate.getFullYear();
	}

	ajaxProgress(status, element) {

		let animRepeaterTimer = null;
		const loader = `<div class="loader">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="#4273FF">
									<circle transform="translate(8 0)" cx="0" cy="16" r="0"> 
									<animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0" keytimes="0;0.2;0.7;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline"/>
									</circle>
									<circle transform="translate(16 0)" cx="0" cy="16" r="0"> 
									<animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0.3" keytimes="0;0.2;0.7;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline"/>
									</circle>
									<circle transform="translate(24 0)" cx="0" cy="16" r="1.58103"> 
									<animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0.6" keytimes="0;0.2;0.7;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline"/>
									</circle>
									</svg>
									</div>`;
		// Start
		if(status == "start") {
			$(element).before(loader);
		} else if(status == "end") {
			$(element).siblings('.loader').fadeOut(function() {
				$(element).fadeIn();
			});
		}
	}
}