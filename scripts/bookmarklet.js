(function() {
    const scriptNode = document.createElement('script');
    scriptNode.src = 'https://record-service.jane/scraper.bundle.js';
    scriptNode.onload = bootstrapScraper;

    document.body.appendChild(scriptNode);

    function bootstrapScraper() {
        const container = document.createElement('div');
        container.innerHTML = `<select class="export-type">
    <option value="single-page">Single Page</option>
    <option value="json">Data Snapshot</option>
    <option value="record">Record</option>
    <option value="stop">Stop Recording</option>
</select>
<button class="start-button">Go</button>`;
        container.screenScrapeIgnore = true;
        container.querySelector('.start-button').addEventListener('click', () => {
            const select = container.querySelector('.export-type');
            if(select.value !== 'stop') {
                scraper.scrape({
                    output: select.value
                })
            } else {
                scraper.stopRecording();
            }
        });

        container.style.position = 'fixed';
        container.style.right = '8px';
        container.style.top = '8px';
        container.style.backgroundColor = '#fff';
        container.style.border = 'solid 1px #ccc';
        container.style.borderRadius = '3px';
        container.style.padding = '8px';
        container.style.zIndex = 999999;
        document.body.appendChild(container);
    }
})()