(function() {
    const scriptNode = document.createElement('script');
    scriptNode.src = 'https://record-service.jane/scraper-bootstrap.bundle.js';
    document.body.appendChild(scriptNode);
    scriptNode.onload = () => {
        document.body.removeChild(scriptNode);
    }
})()