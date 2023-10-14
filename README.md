# Web Scraper
Web scraper API with frontend
## Backend usage
Install dependencies with `npm install`, then run backend with `node index.js`.
## Frontend usage
Install dependencies with `npm install`, then run the frontend with `npm run dev`.         
Visit the served webpage (typically `http://localhost:5173/`).          
Click **submit**.
## API documentation
1. Root Endpoint - Get Cards
   - URL: `/`
   - HTTP Method: GET
   - Description: This endpoint returns an array of objects containing information about scraped blog posts, formatted as a JSON object.
    - Parameters:
        None
    - Request Headers:
        None
    - Query Parameters:
        None
    - Request Body:
        None
    - Response:
      -  Status Code: 200 (OK) on success or an error status code on failure.
      -  Content Type: application/json
      -  Response Body: A JSON object representing a list of cards. The response may be pretty-printed for readability.

2. Process URL Endpoint

   - URL: `/process-url`
   - HTTP Method: GET
   - Description: This endpoint processes a URL provided as a query parameter and returns an array of objects containing information about scraped blog posts, formatted as a JSON object.
   - Parameters:
        None
   - Request Headers:
        None
   - Query Parameters:
        - url (required): The URL to be processed.
   - Request Body:
        None
   - Response:
       - Status Code: 200 (OK) on success if the URL is valid and data is successfully processed, or 500 (Internal Server Error) on failure.
       - Content Type: application/json
       - Response Body: If the URL is valid and data is successfully processed, the response will be a JSON object containing information related to the provided URL. If the URL is missing or invalid, the response will contain an error message.
## Detailed Explanation
### Scraping
The first attempts at writing the backend used axios and cheerio. Unfortunately, cheerio wasn't suitable for running js, so I replaced it with puppeteer which runs a browser instance.      
When scraping, I mostly looked for `<a>` elements, then used their position in the DOM hierarchy to get to the divs containing the necessary text.         
I made new pages / tabs and returned promises for every blog post, rather than loading the pages sequentially, in order to increase performance.             
I included the article date as extra content.            

### Sentiment analysis
The sentiment analysis algorithm uses a dictionary I built from words found in every article. Each non-neutral word has a weight of 1 or 2 to signal its intensity.          
The article page text is then split into sanitized tokens (all lowercase, no punctuation). Every token that has a corresponding weight in the dictionary will get added to the article's sum. The overall sentiment of the blog post is the sign of its sum. If the sum is 0, the article is neutral. I thought of marking articles as neutral for sum values between -2 and 2, but there was no need for that with this example.

### Frontend
The frontend uses Vue 3 (Composition API with script setup) and Tailwind CSS. It uses axios to send the request, then shows the resulting JSON in a `<textarea>`.           
As a standout feature, I used an animated skeleton loader to model the loading state until the request response is obtained.
