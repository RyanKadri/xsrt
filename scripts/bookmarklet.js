(function() {
    const scriptNode = document.createElement('script');
    scriptNode.src = 'https://record-service.jane/bootstrap/scraper-bootstrap.bundle.js';
    document.body.appendChild(scriptNode);
    scriptNode.onload = () => {
        document.body.removeChild(scriptNode);
    }
})()