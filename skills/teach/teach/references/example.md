# Example lesson

An excerpt for the question: Why does a browser restrict cross-origin reads, and what is CORS for?

## Why the browser restricts cross-origin reads

You are building a dashboard at `https://dashboard.example` that reads data from `https://api.example`. These URLs have different origins: an origin consists of a scheme, host, and port.

The browser also runs scripts from sites you do not trust. If any script could read responses from any origin, a malicious page could read private data from another site whenever the browser sent credentials that authorized access. The same-origin policy restricts those reads, but it also prevents your dashboard from reading the API's responses by default.

## How the API permits the dashboard to read a response

CORS lets the API tell the browser which origins may read its responses. For a request from the dashboard, this response header permits that origin:

```http
Access-Control-Allow-Origin: https://dashboard.example
```

The browser checks the header before exposing the response to the dashboard's script. The API has granted read access to that origin; it has not authenticated the user. Requests that include credentials require additional configuration.

## Why blocking a response does not prevent a request

Some cross-origin requests can reach the server even when the browser will not let the script read the response. A server-side action is not undone by hiding its result, so CORS is not a substitute for protection against cross-site request forgery.

For methods and headers that require a preflight, the browser first sends an `OPTIONS` request to check permission. It sends the actual request only if that check succeeds. Whether a request needs preflight depends on its method, headers, and content type, not simply on whether it changes server state.
